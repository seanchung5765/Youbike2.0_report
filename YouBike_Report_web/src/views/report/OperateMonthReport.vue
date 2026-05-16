<template>
  <div class="container-fluid px-0" style="display: flex; flex-direction: column; height: calc(100vh - 130px);">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />

    <div class="flex-shrink-0">
      <div class="row mx-0">
        <h1 class="report-h1 fw-bold">累積業績</h1>
      </div>
      
      <form
        class="mx-0 py-3 px-3"
        :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
        style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
      >
        <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
          <label class="fw-bolder mb-0" style="white-space: nowrap;">月份:</label>
          <div style="width: 140px;">
            <n-date-picker
              v-model:formatted-value="timestamp"
              type="month"
              :actions="null"
              update-value-on-close
              :is-date-disabled="disablePreviousDate"
              placeholder="請選擇月份"
              value-format="yyyy-MM"
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
    </div>

    <div class="flex-grow-1 mx-3 mt-3 mb-2" style="min-height: 0;">
      <n-data-table
        v-show="data.length > 0"
        ref="dataTable"
        size="small"
        :data="data"
        :columns="columns"
        style="height: 100%;"
        flex-height
        :scroll-x="800"
        :bordered="false"
        :single-line="false"
        :class="{ 'dark-mode-table': ischange }"
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
import { getGcpReport } from "@/api/report";

const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false, timer: 1500 });
}

const isLoading = ref(false);
const dataTable = ref(null);
const timestamp = ref(null);
const data = ref([]);

const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

const disablePreviousDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const minDate = new Date(2012, 7, 1); 

  return d < minDate || d >= currentMonthStart;
};

const columns = [
  { key: "month", align: "center", fixed: "left", title: "月份", width: 100 },
  { key: "city", align: "center", fixed: "left", title: "城市", width: 100 },
  { key: "num1", align: "center", title: "單月騎乘次數" },
  { key: "num2", align: "center", title: "去年同期騎乘次數" },
  { key: "num3", align: "center", title: "單月最高騎乘次數紀錄" },
];

// 🚀 不管黑夜白天，只回傳奇偶數，讓 CSS 去煩惱顏色
const rowClassName = (row, index) => {
  return index % 2 === 0 ? "row-even" : "row-odd";
};

const makeExecl = (nowdata, name) => {
  exceldata.value = [...nowdata];
  excelename.value = name;
  excelecolumn.value = columns.map(col => col.title);
};

const getData = async () => {
  try {
    isLoading.value = true;
    data.value = []; 
    
    const params = {
      dataset_id: "founder_report",
      table_id: "monthly_operation_report",
      date: timestamp.value,
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    data.value = resdata.map((element) => ({
      month: element.month ?? "-",
      city: element.city ?? "不分縣市",
      num1: element.monthly_rent_number ?? 0,
      num2: element.last_year_monthly_rent_number ?? 0,
      num3: element.max_monthly_rent_number ?? 0,
    }));

    makeExecl(data.value, "累積業績");

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!timestamp.value) return NotCityAlert("請選擇月份");
  getData();
};
</script>

<style scoped>
:deep(.n-data-table-wrapper) {
  height: 100% !important;
}

/* =========================================
   🌞 亮色模式 (預設)：一白一淡灰
   ========================================= */
:deep(.row-even td) {
  background-color: #ffffff !important;
}
:deep(.row-odd td) {
  background-color: #f4f6f8 !important; 
}
:deep(.n-data-table-tr:hover td) {
  background-color: #e6f7ff !important;
}

/* =========================================
   🌙 暗色模式：一深黑一淺黑
   ========================================= */
:deep(.dark-mode-table .row-even td) {
  background-color: #18181c !important; /* Naive UI 預設深底色 */
}
:deep(.dark-mode-table .row-odd td) {
  background-color: #2c2c32 !important; /* 稍微亮一點的深灰色，形成對比 */
}
:deep(.dark-mode-table .n-data-table-tr:hover td) {
  background-color: #3b3b45 !important; /* 暗色模式專屬的 Hover 顏色 */
}
</style>