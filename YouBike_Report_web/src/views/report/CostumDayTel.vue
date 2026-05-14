<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">補償券月報</h1>
    </div>

    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
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

      <div style="display: flex; gap: 8px; flex-shrink: 0;">
        <button
          type="button"
          class="btn btn-success text-light fw-bold"
          style="white-space: nowrap;"
          @click="search"
        >
          搜尋
        </button>
        <output-excel
          class="btn btn-primary text-light fw-bold"
          style="white-space: nowrap;"
          :data="exceldata"
          :name="excelename"
          :header="excelecolumn"
        />
      </div>
    </form>

    <div style="height: calc(100vh - 160px); padding-bottom: 10px;">
      <n-data-table
        ref="dataTable"
        size="small"
        v-show="totaldata.length > 0"
        :columns="columns"
        :data="totaldata"
        :scroll-x="600"
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
// 🚀 引入 NDatePicker 和 NDataTable
import { NDataTable, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
// 🚀 引入共用的 GCP 報表 API
import { getGcpReport } from "@/api/report";

const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const dataTable = ref(null);
const isLoading = ref(false);
const totaldata = ref([]);
const timestamp = ref(null);

// --- 🌟 斑馬紋設定 ---
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// --- 🚀 日期防呆優化 (用時間戳比對更乾淨) ---
const disablePreviousDate = (ts) => {
  const date = new Date(ts);
  const minDate = new Date(2023, 0, 1); // 2023年起
  
  const now = new Date();
  // 取得本月 1 號的午夜時間
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1); 

  // 禁用 2023 之前，或是「大於本月」的月份
  return date < minDate || date > thisMonth;
};

// --- 固定表頭 ---
const columns = [
  { key: "item1", align: "center", fixed: "left", title: "項目" },
  { key: "item2", align: "center", title: "使用縣市" },
  { key: "item3", align: "center", title: "車種" },
  { key: "item4", align: "center", title: "使用次數" },
  { key: "item5", align: "center", title: "使用金額" },
];

let exceldata = [];
let excelename = "";
let excelecolumn = [];

const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = nowcolumn.map(item => item.title);
};

// --- API 請求與資料處理 ---
const getdata = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "refund_report",
      date: timestamp.value,
    };

    // 🚀 呼叫抽出的 API
    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 💡 優化：使用 .map 精簡陣列產生，並加入 ?? 防呆機制
    totaldata.value = resdata.map((item) => ({
      item1: item.item ?? "",
      item2: item.city ?? "",
      item3: item.sys ?? "",
      item4: item.numbers ?? 0,
      item5: item.total ?? 0,
    }));

    // 💡 修正錯字：補償"卷" -> 補償"券"
    makeExecl(totaldata.value, columns, `${timestamp.value}補償券月報`);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    // 確保載入動畫一定會關閉
    isLoading.value = false;
  }
};

const search = async () => {
  if (!timestamp.value) return NotCityAlert("請選擇月份");
  await getdata();
};
</script>

<style scoped>
/* 🌟 強制覆蓋斑馬紋顏色 (包含固定在左側的欄位) */
:deep(.table-row-white) > td {
  background-color: #ffffff !important;
}

:deep(.table-row-gray) > td {
  background-color: #e8e8e8 !important; /* 指定的深灰色 */
}

/* 滑鼠經過高亮 */
:deep(.n-data-table-tr:hover) > td {
  background-color: #e6f7ff !important;
}
</style>