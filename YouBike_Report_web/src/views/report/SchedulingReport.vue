<template>
  <div class="container-fluid px-0" style="display: flex; flex-direction: column; height: calc(100vh - 120px);">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    
    <div class="flex-shrink-0">
      <div class="row mx-0">
        <h1 class="report-h1 fw-bold">調度日報</h1>
      </div>

      <form
        class="mx-0 py-3 px-3"
        :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
        style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
      >
        <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
          <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
          <div style="width: 160px;">
            <n-select
              v-model:value="city"
              :options="cityOptions"
              placeholder="請選擇"
            />
          </div>
        </div>

        <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
          <div style="width: 140px;">
            <n-date-picker
              v-model:formatted-value="starttimestamp"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="開始日期"
              :is-date-disabled="disableStartDate"
              clearable
            />
          </div>
          <span class="fw-bold">至</span>
          <div style="width: 140px;">
            <n-date-picker
              v-model:formatted-value="endtimestamp"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="結束日期"
              :is-date-disabled="disableEndDate"
              clearable
            />
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
    </div>

    <div class="flex-grow-1 mx-3 mt-3 mb-2" style="min-height: 0;">
      <n-data-table
        v-show="data?.length > 0"
        size="small"
        ref="dataTable"
        :columns="columns"
        :data="data"
        :scroll-x="currentScrollX" 
        :bordered="false"
        :single-line="false"
        flex-height
        style="height: 100%;"
        :class="{ 'dark-mode-table': ischange }"
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
const city = ref(null);
const starttimestamp = ref(null);
const endtimestamp = ref(null);
const data = ref([]);
const columns = ref([]);
const dataTable = ref(null);

const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// 🚀 新增：響應式計算橫向總寬度，有多少欄就撐多寬，絕對不再被壓扁或拉太寬
const currentScrollX = computed(() => {
  return columns.value.reduce((sum, col) => sum + (col.width || 110), 0);
});

// --- 城市選單 (API 動態載入) ---
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];
    
    const options = [];
    if (canusecitys.includes(2) && canusecitys.includes(3)) {
      options.push({ label: "雙北", value: "TaipeiNewtaipei2" });
    }

    dbCities.forEach(c => {
      if (c.status === 'active' && canusecitys.includes(c.city_id)) {
        let rawCode = c.codes ? c.codes.split(',')[0].trim() : '';
        let cleanBaseCode = rawCode.replace(/2E$/i, '').replace(/2$/i, '');
        options.push({ label: c.city_name, value: cleanBaseCode + '2' });
      }
    });

    cityOptions.value = options;
  } catch (error) {
    console.error("載入縣市失敗:", error);
  }
};

onMounted(() => {
  loadCities();
});

// --- 日期防呆 ---
const getTodayStart = () => new Date().setHours(0, 0, 0, 0);
const MIN_DATE = new Date(2023, 0, 1).getTime();

const disableStartDate = (ts) => {
  if (ts < MIN_DATE || ts >= getTodayStart()) return true;
  if (endtimestamp.value) {
    const end = new Date(endtimestamp.value).getTime();
    return ts > end || ts < end - 30 * 86400000;
  }
  return false;
};

const disableEndDate = (ts) => {
  if (ts < MIN_DATE || ts >= getTodayStart()) return true;
  if (starttimestamp.value) {
    const start = new Date(starttimestamp.value).getTime();
    return ts < start || ts > start + 30 * 86400000;
  }
  return false;
};

const cleardate = () => { starttimestamp.value = null; endtimestamp.value = null; };

// 🚀 改為標準的奇偶數斑馬紋命名
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'row-even' : 'row-odd';
};

// --- 資料矩陣處理 ---
const processMatrixData = (rawData) => {
  if (!rawData || rawData.length === 0) {
    data.value = [];
    columns.value = [];
    return;
  }

  // 1. 製作表頭：第一欄文字長給 220px，其餘日期欄給精緻的 110px 寬度
  columns.value = rawData.map((colData, index) => ({
    key: `item${index + 1}`,
    align: "center",
    title: colData[2] ?? "",
    fixed: index === 0 ? "left" : false, 
    width: index === 0 ? 220 : 110
  }));

  // 2. 矩陣轉置
  const rowCount = rawData[0].length;
  const rows = [];
  for (let rowIndex = 3; rowIndex < rowCount; rowIndex++) {
    const rowObj = {};
    rawData.forEach((colData, colIndex) => {
      rowObj[`item${colIndex + 1}`] = colData[rowIndex] ?? "";
    });
    rows.push(rowObj);
  }
  data.value = rows;
};

// --- API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "daily_report_maintain_query2", 
      begin_date: starttimestamp.value,
      end_date: endtimestamp.value,
      city: city.value,
    };

    const res = await getGcpReport(params);
    const resData = res.data?.data || [];

    processMatrixData(resData);

    exceldata.value = [...data.value];
    excelename.value = "調度日報";
    excelecolumn.value = columns.value.map(c => c.title);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!starttimestamp.value || !endtimestamp.value) return NotCityAlert("請選擇完整日期範圍");
  getData();
};
</script>

<style scoped>
:deep(.n-data-table-wrapper) {
  height: 100% !important;
}

/* 🚀 亮色模式 (預設)：一白一淡灰 */
:deep(.row-even td) {
  background-color: #ffffff !important;
}
:deep(.row-odd td) {
  background-color: #e8e8e8 !important; 
}
:deep(.n-data-table-tr:hover td) {
  background-color: #e6f7ff !important;
}

/* 🚀 暗色模式：一深黑一淺黑 */
:deep(.dark-mode-table .row-even td) {
  background-color: #18181c !important; 
}
:deep(.dark-mode-table .row-odd td) {
  background-color: #2c2c32 !important; 
}
:deep(.dark-mode-table .n-data-table-tr:hover td) {
  background-color: #3b3b45 !important; 
}
</style>