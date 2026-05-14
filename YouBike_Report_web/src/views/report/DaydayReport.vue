<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">各專案達成率統計</h1>
    </div>

    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="width: 140px; flex-shrink: 0;">
        <n-date-picker 
          v-model:formatted-value="timestamp" 
          type="year" 
          placeholder="年份" 
          value-format="yyyy" 
          :is-date-disabled="disableDate" 
        />
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0;">
        <button type="button" class="btn btn-success text-light fw-bold" @click="search">搜尋</button>
        <output-excel class="btn btn-primary text-light fw-bold" :data="exceldata" :name="excelename" :header="excelecolumn" />
      </div>
    </form>

    <div style="height: calc(100vh - 160px); padding-bottom: 10px;">
      <n-data-table
        v-show="rawApiData.length > 0"
        ref="dataTable"
        :columns="columns"
        :data="rawApiData"
        :scroll-x="1600"
        size="small"
        striped
        :bordered="false"
        :single-line="false"
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
import { NDataTable, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";

// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

// --- 狀態定義 ---
const ischange = inject("ischange");
const swal = inject("$swal");
const isLoading = ref(false);
const timestamp = ref(null);
const dataTable = ref(null);

const rawApiData = ref([]); 

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🌟 斑馬紋設定 ---
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// --- 輔助函式 ---
async function NotAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const disableDate = (ts) => {
  const year = new Date(ts).getFullYear();
  const nowYear = new Date().getFullYear();
  return year < 2022 || year > nowYear;
};

// --- 動態生成 12 個月的表頭 (固定左側項目) ---
const columns = [
  { 
    key: "item", 
    align: "center", 
    fixed: "left", 
    title: "項目", 
    width: 250 
  },
  ...Array.from({ length: 12 }, (_, i) => ({
    key: `month${i + 1}`,
    align: "center",
    title: `${i + 1}月`,
    width: 100
  }))
];

const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = nowcolumn.map(item => item.title);
};

// --- API 請求與資料處理 ---
const getDate = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "data_analysis",
      table_id: "tan_tan_1",
      date: timestamp.value,
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 資料正規化：存入原始陣列
    rawApiData.value = resdata.map((element) => {
      const row = { item: element.item };
      for (let i = 1; i <= 12; i++) {
        row[`month${i}`] = element[`month${i}`] ?? 0;
      }
      return row;
    });

    makeExecl(rawApiData.value, columns, "各專案達成率統計");
    
  } catch (error) {
    console.error("API Error:", error);
    NotAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!timestamp.value) return NotAlert("請選擇年份");
  getDate();
};
</script>

<style scoped>
/* 🌟 強制覆蓋斑馬紋顏色 (包含固定在左側的欄位) */
:deep(.table-row-white) > td {
  background-color: #ffffff !important;
}

:deep(.table-row-gray) > td {
  background-color: #e8e8e8 !important; /* 翔宇指定的深灰色 */
}

/* 滑鼠經過高亮 */
:deep(.n-data-table-tr:hover) > td {
  background-color: #e6f7ff !important;
}
</style>