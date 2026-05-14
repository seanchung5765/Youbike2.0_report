<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">每日新增&刪減票卡數</h1>
    </div>

    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <div style="width: 150px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="starttimestamp"
          type="date"
          :actions="null"
          :input-readonly="true"
          placeholder="開始日期"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disablestartDate"
        />
      </div>

      <span class="fw-bold" style="flex-shrink: 0;">至</span>

      <div style="width: 150px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="endtimestamp"
          type="date"
          :actions="null"
          :input-readonly="true"
          placeholder="結束日期"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disableEndDate"
        />
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: 8px;">
        <button type="button" class="btn btn-info text-light fw-bold" @click="cleardate">清空日期</button>
        <button type="button" class="btn btn-success text-light fw-bold" @click="search">搜尋</button>
        <output-excel class="btn btn-primary text-light fw-bold" :data="exceldata" :name="excelename" :header="excelecolumn" />
      </div>
    </form>

    <div style="height: calc(100vh - 160px); padding-bottom: 10px;">
      <n-data-table
        v-show="totaldata.length > 0"
        ref="dataTable"
        size="small"
        :columns="columns"
        :data="totaldata"
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
import { NDataTable, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";

// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const starttimestamp = ref(null);
const endtimestamp = ref(null);
const isLoading = ref(false);
const totaldata = ref([]);
const dataTable = ref(null);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 日期防呆 ---
const TODAY = new Date().setHours(0, 0, 0, 0);
const MIN_DATE = new Date(2023, 8, 1).getTime();

const disablestartDate = (ts) => {
  if (ts < MIN_DATE || ts >= TODAY) return true;
  if (endtimestamp.value) {
    const end = new Date(endtimestamp.value).getTime();
    const thirtyDaysAgo = end - 30 * 24 * 60 * 60 * 1000;
    return ts < thirtyDaysAgo || ts > end;
  }
  return false;
};

const disableEndDate = (ts) => {
  if (ts < MIN_DATE || ts >= TODAY) return true;
  if (starttimestamp.value) {
    const start = new Date(starttimestamp.value).getTime();
    const thirtyDaysAfter = start + 30 * 24 * 60 * 60 * 1000;
    return ts < start || ts > thirtyDaysAfter;
  }
  return false;
};

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

// --- 🌟 斑馬紋設定 ---
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// --- 欄位平均優化 ---
const columns = [
  { key: "item1", align: "center", title: "日期", width: 250 },
  { key: "item2", align: "center", title: "縣市", width: 250 },
  { key: "item3", align: "center", title: "刪減票卡數", width: 250 },
  { key: "item4", align: "center", title: "增加票卡數", width: 250 },
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
      table_id: "add_del_card",
      begin_date: starttimestamp.value,
      end_date: endtimestamp.value,
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 資料轉換
    totaldata.value = resdata.map(item => {
      let formattedDate = "";
      if (item.date) {
        const d = new Date(item.date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const day = d.getDate().toString().padStart(2, "0");
        formattedDate = `${year}年${month}月${day}日`;
      }

      return {
        item1: formattedDate,
        item2: item.city ?? "",
        item3: item.del_card ?? 0,
        item4: item.add_card ?? 0,
      };
    });

    makeExecl(totaldata.value, "每日新增&刪減票卡數");
    
  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!starttimestamp.value) return NotCityAlert("請選擇開始日期");
  if (!endtimestamp.value) return NotCityAlert("請選擇結束日期");
  getData();
};
</script>

<style scoped>
/* 🌟 強制覆蓋斑馬紋顏色 */
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