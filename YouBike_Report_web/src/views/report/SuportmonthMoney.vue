<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">補助款月報</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <!-- 日期選擇 -->
      <div style="width: 160px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="month"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="請選擇月份"
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
      :pagination="{ pageSize: 17 }"
      :max-height="600"
      :scroll-x="800"
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
import { NDataTable, NDatePicker } from "naive-ui";
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
const data = ref([]);
const dataTable = ref(null);

// 🚀 響應式 Excel 變數
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// --- 表頭定義 ---
const columns = [
  { key: "num1", align: "center", fixed: "left", title: "專案別", width: 120 },
  { key: "num2", align: "center", title: "系統別", width: 100 },
  { key: "num3", align: "center", title: "補助款項目", width: 180 },
  { key: "num4", align: "center", title: "票卡", width: 80 },
  { key: "num5", align: "center", title: "筆數" },
  { key: "num6", align: "center", title: "補助金額" },
  { key: "num7", align: "center", title: "單筆補助金額" },
];

// --- 日期防呆 ---
const disablePreviousDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const minDate = new Date(2023, 0, 1); // 2023-01
  
  return d >= currentMonthStart || d < minDate;
};

// --- 準備 Excel 資料 ---
const prepareExcel = (reportData) => {
  exceldata.value = [...reportData];
  excelename.value = `${timestamp.value}補助款月報`;
  excelecolumn.value = columns.map(c => c.title);
};

// --- 🚀 核心 API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "financial_report",
      table_id: "Subsidy",
      date: `${timestamp.value}-01`,
    };

    const res = await getGcpReport(params);
    const rawData = res.data?.data || [];

    // 🚀 資料處理：排序 + 格式化 Mapping
    data.value = [...rawData]
      .sort((a, b) => (a.rank || 0) - (b.rank || 0))
      .map(item => ({
        num1: item.project ?? "",
        num2: item.sys ?? "",
        num3: item.item ?? "",
        num4: "ALL",
        num5: item.CNT ?? 0,
        num6: item.CNT_money ?? 0,
        num7: item.Subsidy ?? 0,
      }));

    prepareExcel(data.value);
    
    if (dataTable.value?.page) {
      dataTable.value.page(1);
    }
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