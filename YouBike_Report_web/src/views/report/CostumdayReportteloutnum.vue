<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">外撥通數統計</h1>
    </div>

    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="width: 160px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="date"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="請選擇日期"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disableStartDate"
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
        :scroll-x="2000" 
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

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🌟 斑馬紋設定 ---
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// --- 日期防呆 ---
const disableStartDate = (ts) => {
  const date = new Date(ts).setHours(0, 0, 0, 0);
  const minDate = new Date(2023, 7, 8).setHours(0, 0, 0, 0); // 2023-08-08
  const today = new Date().setHours(0, 0, 0, 0);
  return date < minDate || date >= today;
};

// --- 🌟 動態生成表頭 ---
const columns = [
  { key: "item1", align: "center", fixed: "left", title: "員工編號", width: 100 },
  { key: "item2", align: "center", fixed: "left", title: "姓名", width: 100 },
  ...Array.from({ length: 24 }, (_, i) => ({
    key: `item${i + 3}`,
    align: "center",
    title: `${i}-${i + 1}`,
    width: 70
  })),
  { key: "item27", align: "center", title: "合計", width: 80 },
];

const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = nowcolumn.map(item => item.title);
};

// --- API 請求與資料處理 ---
const hourKeys = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifthteen", "sixteen",
  "seventeen", "eighteen", "nineteen", "twenty", "twenty_one", "twenty_two", "twenty_three"
];

const getdata = async () => {
  try {
    isLoading.value = true;
    
    // 🌟 最乾淨的 payload，不需要傳送 sys 也不需要 city
    const params = {
      dataset_id: "yb2",
      table_id: "CTI_callout",
      date: timestamp.value,
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    totaldata.value = resdata.map((element) => {
      const row = {
        item1: element.AID,
        item2: element.name,
        item27: element.total ?? 0,
      };
      
      hourKeys.forEach((key, index) => {
        row[`item${index + 3}`] = element[key] ?? 0;
      });
      
      return row;
    });

    makeExecl(totaldata.value, columns, "外撥通數統計");

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = async () => {
  if (!timestamp.value) return NotCityAlert("請選擇日期");
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