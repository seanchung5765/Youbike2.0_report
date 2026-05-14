<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">行銷月報 (每月10號更新資料)</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <!-- 系統別選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">系統別:</label>
        <div style="width: 140px;">
          <!-- 🚀 升級為 n-select -->
          <n-select
            v-model:value="category"
            :options="sysOptions"
            placeholder="請選擇"
          />
        </div>
      </div>

      <!-- 月份選擇 -->
      <div style="width: 140px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="month"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="選擇月份"
          value-format="yyyy-MM"
          :is-date-disabled="disablePreviousDate"
        />
      </div>

      <!-- 按鈕群組 -->
      <div style="display: flex; gap: 8px; flex-shrink: 0;">
        <button
          type="button"
          class="btn btn-success text-light"
          style="white-space: nowrap;"
          @click="search"
        >
          搜尋
        </button>
        <output-excel
          class="btn btn-primary text-light"
          style="white-space: nowrap;"
          :data="exceldata"
          :name="excelename"
          :header="excelecolumn"
        />
      </div>
    </form>

    <n-data-table
      v-show="data.length > 0"
      size="small"
      :data="data"
      ref="dataTable"
      :columns="columns"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="1000"
      :bordered="false"
      :single-line="false"
      striped
    />
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
// 🚀 記得引入 NSelect
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const timestamp = ref(null);
const isLoading = ref(false);
const category = ref(null);
const data = ref([]);
const columns = ref([]);
const dataTable = ref(null);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🚀 系統別選項 ---
const sysOptions = [
  { label: "1.0", value: "1" },
  { label: "2.0+2.0E", value: "2_E" }
];

// --- 🚀 日期防呆優化 (極簡化時間戳判斷) ---
const disablePreviousDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const minDate = new Date(2023, 5, 1); // 2023-06-01
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 禁用 2023年6月以前，以及 本月(含)以後 的月份
  return d < minDate || d >= currentMonthStart;
};

// --- 🚀 資料矩陣重構 (將 makecol 與 makedata 合併為一個清爽的函式) ---
const processMatrixData = (rawData) => {
  if (!rawData || rawData.length === 0) {
    data.value = [];
    columns.value = [];
    return;
  }

  // 1. 建立表頭 Columns
  const cols = rawData.map((colData, index) => {
    const colDef = {
      key: `item${index + 1}`,
      align: "center",
      title: colData[2] ?? `未知欄位${index + 1}` // 陣列的第 3 個元素是標題
    };
    
    // 針對第一欄位凍結與設定寬度
    if (index === 0) {
      colDef.fixed = "left";
      if (category.value !== "1") colDef.width = 100;
    }
    return colDef;
  });
  columns.value = cols;

  // 2. 建立資料列 Rows (從 index 3 開始才是真實資料)
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

const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = nowcolumn.map(col => col.title);
};

// --- API 請求與資料處理 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "marketing_report",
      table_id: `monthly_report${category.value}`,
      date: `${timestamp.value}-01`,
    };

    // 🚀 呼叫抽出的 API，解決 401 問題
    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 呼叫重構後的矩陣處理函式
    processMatrixData(resdata);

    if (dataTable.value?.page) dataTable.value.page(1);
    
    makeExecl(data.value, columns.value, "行銷月報");
  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!category.value) return NotCityAlert("請選擇系統別");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  getData();
};
</script>

<style scoped></style>