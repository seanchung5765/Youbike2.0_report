<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">YouBike2.0 騎乘時間查詢</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">系統別:</label>
        <div style="width: 100px;">
          <n-select v-model:value="category" :options="categoryOptions" @update:value="city = null" placeholder="請選擇" />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 140px;">
          <n-select v-model:value="city" :options="cityOptions" placeholder="請選擇" :disabled="!category" />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">項目:</label>
        <div style="width: 160px;">
          <n-select v-model:value="optionsvalue" multiple :options="itemOptions" :max-tag-count="1" placeholder="請選擇" />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <div style="width: 140px;">
          <n-date-picker v-model:formatted-value="starttimestamp" type="date" value-format="yyyy-MM-dd" placeholder="開始日期" :is-date-disabled="disableStartDate" clearable />
        </div>
        <span class="fw-bold">至</span>
        <div style="width: 140px;">
          <n-date-picker v-model:formatted-value="endtimestamp" type="date" value-format="yyyy-MM-dd" placeholder="結束日期" :is-date-disabled="disableEndDate" clearable />
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-info text-light" style="white-space: nowrap;" @click="cleardate">清空日期</button>
        <button type="button" class="btn btn-success text-light" style="white-space: nowrap;" @click="search">搜尋</button>
        <output-excel
          class="btn btn-primary text-light"
          style="white-space: nowrap;"
          :data="exceldata"
          :name="excelename"
          :header="excelecolumn"
        />
      </div>
    </form>

    <div style="height: calc(100vh - 180px); padding-bottom: 10px; margin-top: 10px;">
      <n-data-table
        v-show="data.length > 0"
        ref="dataTable"
        size="small"
        :data="data"
        :columns="columnDefs"
        :scroll-x="800"
        :bordered="false"
        :single-line="false"
        striped
        flex-height
        style="height: 100%;"
        :row-class-name="rowClassName"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { useUserStore } from "../../stores/userdata";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
// 🚀 引入 API
import { getGcpReport } from "@/api/report";
import { getAllCities } from "@/api/admin";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const isLoading = ref(false);
const category = ref(null);
const city = ref(null);
const optionsvalue = ref([]);
const starttimestamp = ref(null);
const endtimestamp = ref(null);
const data = ref([]);
const dataTable = ref(null);

const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// --- 選單選項 ---
const categoryOptions = [
  { label: "2.0", value: "2.0" },
  { label: "2.0E", value: "2.0E" }
];

const itemOptions = [
  { label: "同站借還", value: "同站借還" },
  { label: "跨站借還", value: "跨站借還" }
];

// --- 🚀 城市選單 (API 動態載入) ---
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];
    
    // 依據資料庫結果及登入者權限自動長出選單
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

onMounted(() => {
  loadCities();
});

// --- 🚀 斑馬紋樣式 (#e8e8e8) ---
const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

// --- 表頭定義 ---
const columnDefs = [
  { key: "num1", align: "center", fixed: "left", width: 100, title: "縣市" },
  { key: "num2", align: "center", title: "鄉鎮市區" },
  { key: "num3", align: "center", title: "同站／跨站" },
  { key: "num4", align: "center", title: "費率別" },
  { key: "num5", align: "center", title: "騎乘時間" },
  { key: "num6", align: "center", title: "次數" },
];

// --- 日期防呆 (限制 30 天) ---
const MIN_DATE = new Date(2023, 0, 1).getTime();
const getTodayStart = () => new Date().setHours(0, 0, 0, 0);

const disableStartDate = (ts) => ts < MIN_DATE || ts >= getTodayStart() || (endtimestamp.value && (ts > new Date(endtimestamp.value).getTime() || ts < new Date(endtimestamp.value).getTime() - 30 * 86400000));
const disableEndDate = (ts) => ts < MIN_DATE || ts >= getTodayStart() || (starttimestamp.value && (ts < new Date(starttimestamp.value).getTime() || ts > new Date(starttimestamp.value).getTime() + 30 * 86400000));

const cleardate = () => { starttimestamp.value = null; endtimestamp.value = null; };

// --- API 請求與資料處理 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "rent_minute_report2",
      begin_date: starttimestamp.value,
      end_date: endtimestamp.value,
      // 🚀 城市名稱 (e.g. 台北市) + 系統別 (e.g. 2.0) = "台北市2.0" 送出給 GCP
      city: `${city.value}${category.value}`,
      item: optionsvalue.value,
    };

    const res = await getGcpReport(params);
    const rawData = res.data?.data || [];

    // 資料合併與轉換邏輯 (Grouping 保留原有邏輯)
    const processed = [];
    rawData.forEach((element) => {
      const last = processed[processed.length - 1];
      
      const isSameGroup = last && 
        last.num2 === element.SxPSArea && 
        last.num3 === element.same_station && 
        last.num4 === element.rate_info && 
        last.num5 === element.rent_minute;

      if (isSameGroup) {
        last.num6 += element.times;
      } else {
        processed.push({
          num1: element.city ?? "",
          num2: element.SxPSArea ?? "",
          num3: element.same_station ?? "",
          num4: element.rate_info ?? "",
          num5: element.rent_minute ?? "",
          num6: element.times ?? 0,
        });
      }
    });

    data.value = processed;
    
    // 更新 Excel
    exceldata.value = [...processed];
    excelename.value = "yb2騎乘時間查詢";
    excelecolumn.value = columnDefs.map(c => c.title);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!category.value) return NotCityAlert("請選擇系統別");
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!optionsvalue.value.length) return NotCityAlert("請選擇項目");
  if (!starttimestamp.value || !endtimestamp.value) return NotCityAlert("請選擇完整日期區間");
  getData();
};
</script>

<style scoped>
/* 🚀 灰色行的背景顏色 (#e8e8e8) */
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

/* 滑鼠經過高亮 */
:deep(.n-data-table .n-data-table-tr.gray-row:hover td) {
  background-color: #d1d1d1 !important;
}
</style>