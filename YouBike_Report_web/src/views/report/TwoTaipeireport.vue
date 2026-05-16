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
        <button type="button" class="btn btn-info text-light" style="white-space: nowrap;" @click="clearDate">清空</button>
        <button type="button" class="btn btn-primary text-light" style="white-space: nowrap;" @click="search">搜尋匯出</button>
      </div>
    </form>

    <n-result v-if="data.length === 0" class="mt-5" status="info" title="此頁面只供下載 EXCEL" description="請選擇條件後點擊搜尋匯出" />
  </div>
</template>

<script setup>
import { ref, inject, computed, watch, onMounted } from "vue";
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDatePicker, NSelect, NResult, NCheckbox } from "naive-ui";
import * as XLSX from "xlsx";
import { getGcpReport } from "@/api/report";
import { getAllCities } from "@/api/admin";

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
let allStations = [];

const errorAlert = (text) => swal({ icon: "error", title: text, showConfirmButton: false, timer: 1500 });

const statusOptions = [
  { label: "無車", value: "無車" }, { label: "無位", value: "無位" },
  { label: "見車率", value: "見車率" }, { label: "見位率", value: "見位率" }
];

// --- 🚀 城市選單 (API 動態載入) ---
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];
    
    cityOptions.value = dbCities
      .filter(c => c.status === 'active' && canusecitys.includes(c.city_id))
      .map(c => ({
        label: c.city_name,
        value: c.city_name 
      }));
  } catch (error) {
    console.error("載入縣市失敗:", error);
  }
};

const filteredStationOptions = computed(() => {
  if (!city.value) return [];
  return allStations
    .filter(s => s.city === city.value)
    .map(s => ({ label: s.s_name_tw, value: `${s.s_no}-${s.city}` }));
});

watch(city, () => { selectstationvalue.value = []; });

const clearDate = () => { starttimestamp.value = null; endtimestamp.value = null; };

// --- 日期防呆 ---
const MIN_DATE = new Date(2023, 0, 1).getTime();
const getTodayStart = () => new Date().setHours(0, 0, 0, 0);

const disableStartDate = (ts) => ts < MIN_DATE || ts >= getTodayStart() || (endtimestamp.value && (ts > new Date(endtimestamp.value).getTime() || ts < new Date(endtimestamp.value).getTime() - 30 * 86400000));
const disableEndDate = (ts) => ts < MIN_DATE || ts >= getTodayStart() || (starttimestamp.value && (ts < new Date(starttimestamp.value).getTime() || ts > new Date(starttimestamp.value).getTime() + 30 * 86400000));

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
    const params = {
      station: stationAll.value ? ["all"] : selectstationvalue.value.map(v => parseInt(v.split("-")[0])),
      dataset_id: "data_analysis", table_id: "daily_empty_full",
      begin_date: starttimestamp.value, end_date: endtimestamp.value,
      city: [city.value], status: category.value,
    };

    const res = await getGcpReport(params);
    const rawData = res.data?.data || [];

    data.value = rawData.map(el => {
      const row = {
        item1: formatGcpDate(el.date), 
        item2: el.responsible_area ?? "",
        item3: el.s_no ?? "",
        item4: el.s_name ?? "",
        item5: el.status ?? "", 
        item6: el.item ?? "",   
      };
      for (let h = 0; h <= 23; h++) { 
        row[`item${h + 7}`] = el[`r${h}`] ?? 0; 
      }
      row.item31 = el.total ?? 0;
      return row;
    });

    if (!data.value.length) return errorAlert("查稱無資料");

    const headers = ["Date", "責任區", "場站代號", "站名", "狀態", "時間單位", ...Array.from({length: 24}, (_, i) => i.toString()), "總計"];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data.value, { skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
    XLSX.writeFile(workbook, `見車率日報_${city.value}_${starttimestamp.value}.xlsx`);

  } catch (e) {
    errorAlert("查詢失敗");
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  loadCities();
  try {
    const res = await getGcpReport({ dataset_id: "yb2", table_id: "station" });
    allStations = res.data?.data || [];
  } catch (e) {
    console.error("無法取得場站清單", e);
  }
});
</script>