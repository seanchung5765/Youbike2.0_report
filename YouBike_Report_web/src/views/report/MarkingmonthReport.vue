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

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">選擇月份:</label>
        <div style="width: 140px;">
          <n-date-picker
            v-model:formatted-value="timestamp"
            type="month"
            :actions="null"
            :input-readonly="true"
            :update-value-on-close="true"
            placeholder="請選擇"
            value-format="yyyy-MM"
            :is-date-disabled="disablePreviousDate"
          />
        </div>
      </div>

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

    <div style="height: calc(100vh - 180px); padding-bottom: 10px; margin-top: 10px;">
      <n-data-table
        v-show="data.length > 0"
        size="small"
        :data="data"
        :columns="columns"
        :scroll-x="1000"
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
import { ref, inject } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
// 🚀 已移除 NSelect，只留下用得到的組件
import { NDataTable, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
import { getGcpReport } from "@/api/report";

const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const timestamp = ref(null);
const isLoading = ref(false);
const data = ref([]);
const columns = ref([]);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🚀 斑馬紋樣式判斷 (#e8e8e8) ---
const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

// --- 日期防呆優化 ---
const disablePreviousDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const minDate = new Date(2023, 5, 1); // 2023-06-01
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 禁用 2023年6月以前，以及 本月(含)以後 的月份
  return d < minDate || d >= currentMonthStart;
};

// --- 資料矩陣重構 ---
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
      title: colData[2] ?? `未知欄位${index + 1}`
    };
    
    // 針對第一欄位凍結與設定寬度
    if (index === 0) {
      colDef.fixed = "left";
      colDef.width = 100;
    }
    return colDef;
  });
  columns.value = cols;

  // 2. 建立資料列 Rows
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
      table_id: "monthly_report2_E", // 🚀 直接固定帶入原本 2.0+2.0E 的代碼
      date: `${timestamp.value}-01`,
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    processMatrixData(resdata);
    makeExecl(data.value, columns.value, "行銷月報");
    
  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  getData();
};
</script>

<style scoped>
/* 🚀 灰色行的背景顏色 (#e8e8e8) */
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

/* 滑鼠經過高亮 (避免被灰色強制蓋掉) */
:deep(.n-data-table .n-data-table-tr.gray-row:hover td) {
  background-color: #d1d1d1 !important;
}
</style>