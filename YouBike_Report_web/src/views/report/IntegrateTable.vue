<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">統整表</h1>
    </div>

    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">系統別:</label>
        <div style="width: 160px;">
          <n-select
            v-model:value="city"
            :options="systemOptions"
            placeholder="請選擇"
            clearable
          />
        </div>
      </div>

      <div style="width: 150px; flex-shrink: 0;">
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
        ref="dataTable"
        size="small"
        v-show="totaldata.length > 0"
        :pagination="{ pageSize: 15 }"
        :columns="columns"
        :data="totaldata"
        :max-height="600"
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
import { ref, inject, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";

// 🚀 引入集中管理的 API
import { getGcpReport } from "@/api/report";
import { getReportGroups } from "@/api/admin"; 

const ischange = inject("ischange");
const swal = inject("$swal");

async function NotAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const dataTable = ref(null);
const city = ref(null);
const timestamp = ref(null);
const isLoading = ref(false);
const totaldata = ref([]);
const systemOptions = ref([]);

// --- 🚀 1. 從資料庫 (report_groups 表) 撈取下拉選單 ---
const loadGroups = async () => {
  try {
    const res = await getReportGroups();
    
    // 💡 防禦性解析：確保 res.data.data 存在且為陣列
    let dbGroups = [];
    if (res && res.data && Array.isArray(res.data.data)) {
      dbGroups = res.data.data;
    } else if (res && Array.isArray(res.data)) {
      dbGroups = res.data;
    }

    // 將資料庫的 id (1, 2, 3...) 與 name (雙北, 桃竹苗...) 映射到選單
    systemOptions.value = dbGroups
      .filter(g => g.status === 'active') // 只顯示狀態為 active 的
      .map(g => ({
        label: g.name,
        value: String(g.id) // 轉為字串，確保傳給 GCP 時格式正確
      }));

  } catch (error) {
    console.error("載入報表群組失敗:", error);
    systemOptions.value = [];
  }
};

onMounted(() => {
  loadGroups();
});

// --- 🚀 2. 斑馬紋樣式 (#e8e8e8) ---
const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

// --- 日期防呆 ---
const disableStartDate = (ts) => {
  const date = new Date(ts);
  const minDate = new Date(2023, 11, 1); 
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < minDate || date >= today;
};

// --- 表頭定義 ---
const columns = [
  { key: "item1", align: "center", title: "縣市" },
  { key: "item2", align: "center", title: "使用次數" },
  { key: "item3", align: "center", title: "進電數" },
  { key: "item4", align: "center", title: "長時間通話數" },
  { key: "item5", align: "center", title: "掛斷數(大於6秒)" },
  { key: "item6", align: "center", title: "掛斷率(大於6秒)" },
];

let exceldata = [];
let excelename = "";
let excelecolumn = columns.map(col => col.title);

const makeExecl = (nowdata, name) => {
  exceldata = [...nowdata];
  excelename = name;
};

// --- API 請求與資料處理 ---
const fetchData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "CTI_summary_table",
      date: timestamp.value,
      item: city.value,
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    totaldata.value = resdata.map((item) => ({
      item1: item.city ?? "不分縣市",
      item2: item.ride_times ?? 0,
      item3: item.total ?? 0,
      item4: item.long_answer ?? 0,
      item5: item.hangup_gt_six ?? 0,
      item6: item.hangup_gt_six_percentage ?? "0%",
    }));

    makeExecl(totaldata.value, "統整表");

    if (dataTable.value?.page) dataTable.value.page(1);

  } catch (error) {
    console.error("API Error:", error);
    NotAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = async () => {
  if (!city.value) return NotAlert("請選擇系統別");
  if (!timestamp.value) return NotAlert("請選擇日期");
  await fetchData();
};
</script>

<style scoped>
/* 🚀 灰色行樣式 (#e8e8e8) */
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

/* 滑鼠經過高亮 (避免被灰色強制蓋掉) */
:deep(.n-data-table .n-data-table-tr:hover td) {
  background-color: #e6f7ff !important;
}
</style>