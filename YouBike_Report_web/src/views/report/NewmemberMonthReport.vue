<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">每月新增會員投保數</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <!-- 月份選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">年月份:</label>
        <div style="width: 140px;">
          <n-date-picker
            v-model:formatted-value="timestamp"
            type="month"
            :actions="null"
            update-value-on-close
            :is-date-disabled="disablePreviousDate"
            placeholder="請選擇年月份"
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
      :scroll-x="600"
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
const data = ref([]);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🚀 取得上個月日期 (極簡寫法) ---
function getLastMonthDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

const timestamp = ref(getLastMonthDate());

// --- 🚀 月份防呆限制 (極簡寫法) ---
const disablePreviousDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const minDate = new Date(2023, 0, 1); // 限制從 2023-01 開始

  // 禁用 2023 以前，以及 本月(含)以後 的月份
  return d < minDate || d >= currentMonthStart;
};

// --- 表頭定義 ---
const columns = [
  { key: "item1", align: "center", title: "縣市" },
  { key: "item2", align: "center", title: "新增會員卡投保數" },
  { key: "item3", align: "center", title: "新增註冊卡數" },
  { key: "item4", align: "center", title: "投保率" },
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
      dataset_id: "report",
      table_id: "month_insur",
      date: timestamp.value,
    };

    // 🚀 呼叫抽出的 API，確保帶有 Token 防護
    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 💡 整理資料，加入 ?? 保底避免空白
    data.value = resdata.map((item) => ({
      item1: item.city ?? "未提供",
      item2: item.insur ?? 0,
      item3: item.total ?? 0,
      item4: item.percentage ?? "0%",
    }));

    makeExecl(data.value, "每月新增會員投保數");

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
  if (!timestamp.value) return NotCityAlert("日期不能為空");
  getData();
};
</script>

<style scoped></style>