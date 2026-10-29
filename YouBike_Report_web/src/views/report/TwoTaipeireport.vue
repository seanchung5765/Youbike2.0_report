<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">見車率統計日報</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto; white-space: nowrap;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0">城市:</label>
        <div style="width: 140px;">
          <n-select v-model:value="city" :options="cityOptions" placeholder="請選擇" size="medium" />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <n-checkbox v-model:checked="stationAll" size="large">全選</n-checkbox>
        <div style="width: 300px; flex-shrink: 0;">
          <el-select-v2
            v-model="selectstationvalue"
            :disabled="stationAll"
            filterable
            multiple
            collapse-tags
            collapse-tags-tooltip
            :options="filteredStationOptions"
            placeholder="選擇場站"
            style="width: 100%"
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <label class="fw-bolder mb-0">類型:</label>
        <div style="width: 150px;">
          <n-select v-model:value="category" multiple :options="statusOptions" :max-tag-count="1" placeholder="請選擇" />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <div style="width: 140px;">
          <n-date-picker v-model:formatted-value="starttimestamp" type="date" value-format="yyyy-MM-dd" placeholder="開始日期" :is-date-disabled="disableStartDate" />
        </div>
        <span class="fw-bold">至</span>
        <div style="width: 140px;">
          <n-date-picker v-model:formatted-value="endtimestamp" type="date" value-format="yyyy-MM-dd" placeholder="結束日期" :is-date-disabled="disableEndDate" />
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-info text-light fw-bold" style="white-space: nowrap;" @click="clearDate">清空</button>
        <button type="button" class="btn btn-primary text-light fw-bold" style="white-space: nowrap;" @click="search">搜尋並匯出</button>
      </div>
    </form>

    <n-result v-if="data.length === 0" class="mt-5" status="info" title="此頁面只供下載 EXCEL" description="請選擇條件後點擊搜尋並匯出" />
  </div>
</template>

<script setup>
import { ref, inject, computed, watch, onMounted } from "vue";
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDatePicker, NSelect, NResult, NCheckbox } from "naive-ui";
import * as XLSX from "xlsx";
import { getAllCities } from "@/api/admin";

// 🚀 引入兩支 API：新報表用 getLookcarReport，舊場站清單用 getGcpReport
import { getLookcarReport, getGcpReport } from "@/api/report"; 

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

const isLoading = ref(false);
const city = ref(null);
const stationAll = ref(true);
const selectstationvalue = ref([]);
const category = ref([]);
const starttimestamp = ref(null);
const endtimestamp = ref(null);
const data = ref([]);

// 💡 為了絕對的安全，我們還是把它升級成 ref，避免網路很慢時的競態條件
const allStations = ref([]); 

const errorAlert = (text) => swal({ icon: "error", title: text, showConfirmButton: false, timer: 1500 });

const statusOptions = [
  { label: "無車", value: "無車" }, { label: "無位", value: "無位" },
  { label: "見車率", value: "見車率" }, { label: "見位率", value: "見位率" }
];

const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];
    cityOptions.value = dbCities
      .filter(c => c.status === 'active' && canusecitys.includes(c.city_id))
      .map(c => ({ label: c.city_name, value: c.city_name }));
  } catch (error) {
    console.error("載入縣市失敗:", error);
  }
};

const filteredStationOptions = computed(() => {
  if (!city.value) return [];
  // 加上 .value 讀取
  return allStations.value
    .filter(s => s.city === city.value)
    .map(s => ({ label: s.s_name_tw, value: `${s.s_no}-${s.city}` }));
});

watch(city, () => { selectstationvalue.value = []; });

const clearDate = () => { starttimestamp.value = null; endtimestamp.value = null; };

const MIN_DATE = new Date(2023, 0, 1).getTime();
const getTodayStart = () => new Date().setHours(0, 0, 0, 0);

const disableStartDate = (ts) => {
  if (ts < MIN_DATE || ts >= getTodayStart()) return true;
  if (endtimestamp.value) {
    const endDateTs = new Date(endtimestamp.value.replace(/-/g, '/')).getTime();
    return ts > endDateTs || ts < endDateTs - 30 * 86400000;
  }
  return false;
};

const disableEndDate = (ts) => {
  if (ts < MIN_DATE || ts >= getTodayStart()) return true;
  if (starttimestamp.value) {
    const startDateTs = new Date(starttimestamp.value.replace(/-/g, '/')).getTime();
    return ts < startDateTs || ts > startDateTs + 30 * 86400000;
  }
  return false;
};

const formatGcpDate = (dateInput) => {
  if (!dateInput) return "";
  const rawDate = typeof dateInput === 'object' ? dateInput.value : dateInput;
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return rawDate;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const search = async () => {
  if (!city.value) return errorAlert("請選擇城市");
  if (!stationAll.value && selectstationvalue.value.length === 0) return errorAlert("請選擇場站");
  if (category.value.length === 0) return errorAlert("請選擇類型");
  if (!starttimestamp.value || !endtimestamp.value) return errorAlert("請選擇日期範圍");

  try {
    isLoading.value = true;
    
    // 🚀 使用對接 Sean API 的新參數格式
const params = {
      begin_date: starttimestamp.value, 
      end_date: endtimestamp.value,
      city: [city.value], 
      status: category.value,
      // 🚀 拔掉單引號！改回原汁原味的 parseInt，傳送純數字給 BigQuery！
      station: stationAll.value ? ["all"] : selectstationvalue.value.map(v => parseInt(v.split("-")[0]))
    };

    const res = await getLookcarReport(params);
    const rawData = res.data?.data || [];
    
    if (!rawData.length) return errorAlert("查無資料");

    // 🚀 使用 col_ 字串馬甲，防止 Excel JS 底層數字排序錯位
    data.value = rawData.map(el => {
      const row = {
        col_date: formatGcpDate(el['日期']), 
        col_city: el['縣市'] ?? "",
        col_sno: el['場站代號'] ?? "",
        col_resp: el['責任區'] ?? "",
        col_sname: el['場站名稱'] ?? "",
        col_area: el['行政區'] ?? "",
        col_stotal: el['車柱數'] ?? "",
        col_status: el['類型'] ?? ""
      };
      
      // 塞入 00 ~ 23 的時段資料 (加上 col_ 前綴)
      for (let h = 0; h <= 23; h++) { 
        row[`col_${String(h).padStart(2, '0')}`] = el[`r${h}`] ?? 0; 
      }
      row.col_total = el['total'] ?? 0;
      return row;
    });

    // 🚀 建立對應的中文 headers
    const headers = [
      "日期", "縣市", "場站代號", "責任區", "場站名稱", "行政區", "車柱數", "類型", 
      ...Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')), "總計"
    ];
    
    // 將含有 col_ 的物件轉換成純陣列 (對齊 headers 的順序)，徹底杜絕跑版
    const finalExcelData = data.value.map(row => {
      const rowArr = [
        row.col_date, row.col_city, row.col_sno, row.col_resp, row.col_sname, 
        row.col_area, row.col_stotal, row.col_status
      ];
      for (let h = 0; h <= 23; h++) {
        rowArr.push(row[`col_${String(h).padStart(2, '0')}`]);
      }
      rowArr.push(row.col_total);
      return rowArr;
    });

    const workbook = XLSX.utils.book_new();
    
    // 1. 寫入第一行標題
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    
    // 2. 寫入資料 (純二維陣列) 從 A2 開始貼
    XLSX.utils.sheet_add_aoa(worksheet, finalExcelData, { origin: "A2" });
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "見車率統計");
    XLSX.writeFile(workbook, `見車率統計日報_${city.value}_${starttimestamp.value}至${endtimestamp.value}.xlsx`);

  } catch (e) {
    console.error(e);
    errorAlert("查詢失敗");
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  loadCities();
  try {
    // 🚀 正確呼叫舊版 API 來取得場站清單 (取代我的破註解)
    const res = await getGcpReport({ dataset_id: "yb2", table_id: "station" });
    allStations.value = res.data?.data || [];
  } catch (e) {
    console.error("無法取得場站清單", e);
  }
});
</script>
