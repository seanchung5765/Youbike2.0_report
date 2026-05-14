<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />

    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">累積業績</h1>
    </div>
    
    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <!-- 月份選擇 -->
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
      ref="dataTable"
      size="small"
      :data="data"
      :columns="columns"
      :pagination="{ pageSize: 15 }"
      :max-height="500"
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

const isLoading = ref(false);
const dataTable = ref(null);
const timestamp = ref(null);
const data = ref([]);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🚀 月份防呆 (限制 2012-08 以前，以及本月含以後) ---
const disablePreviousDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const minDate = new Date(2012, 7, 1); // 2012年8月 (JavaScript 月份從 0 開始，所以 8月 是 7)

  return d < minDate || d >= currentMonthStart;
};

// --- 表頭設定 ---
const columns = [
  { key: "month", align: "center", fixed: "left", title: "月份" },
  { key: "city", align: "center", title: "城市" },
  { key: "num1", align: "center", title: "單月騎乘次數" },
  { key: "num2", align: "center", title: "去年同期騎乘次數" },
  { key: "num3", align: "center", title: "單月最高騎乘次數紀錄" },
];

const makeExecl = (nowdata, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = columns.map(col => col.title);
};

// --- API 請求與資料處理 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "founder_report",
      table_id: "monthly_operation_report",
      date: timestamp.value,
    };

    // 🚀 使用共用的 API 取代 axios
    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 💡 整理資料，加入 ?? 避免沒資料時顯示空白
    data.value = resdata.map((element) => ({
      month: element.month ?? "-",
      city: element.city ?? "不分縣市",
      num1: element.monthly_rent_number ?? 0,
      num2: element.last_year_monthly_rent_number ?? 0,
      num3: element.max_monthly_rent_number ?? 0,
    }));

    makeExecl(data.value, "累積業績");

    // 搜尋成功後回到第一頁
    if (dataTable.value?.page) dataTable.value.page(1);

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

<style scoped></style>