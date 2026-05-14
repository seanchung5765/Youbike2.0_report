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

    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <!-- 系統別選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">系統別:</label>
        <div style="width: 140px;">
          <!-- 🚀 升級為 n-select，消滅原本寫死的 v-if -->
          <n-select
            v-model:value="city"
            :options="systemOptions"
            placeholder="請選擇"
          />
        </div>
      </div>

      <!-- 日期選擇 -->
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
    />
  </div>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
// 🚀 記得補上 NSelect
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";
// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];
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

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🚀 權限選單優化 (資料驅動模式) ---
const systemOptions = computed(() => {
  const options = [];
  if (canusecitys.includes(2) && canusecitys.includes(3)) {
    options.push({ label: "雙北", value: "1" });
  }
  if (canusecitys.includes(4) && canusecitys.includes(5) && canusecitys.includes(6) && canusecitys.includes(7)) {
    options.push({ label: "桃竹苗", value: "2" });
  }
  if (canusecitys.includes(8)) {
    options.push({ label: "台中", value: "3" });
  }
  if (canusecitys.includes(12)) {
    options.push({ label: "嘉義", value: "4" });
  }
  if (canusecitys.includes(14) && canusecitys.includes(15) && canusecitys.includes(16)) {
    options.push({ label: "南高屏", value: "5" });
  }
  return options;
});

// --- 日期防呆優化 ---
const disableStartDate = (ts) => {
  const date = new Date(ts);
  const minDate = new Date(2023, 11, 1); // 2023-12-01
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 禁用 2023-12-01 以前，以及今天(含)以後的日期
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

const makeExecl = (nowdata, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = columns.map(col => col.title);
};

// --- API 請求與資料處理 ---
const getdata = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "CTI_summary_table",
      date: timestamp.value,
      item: city.value,
    };

    // 🚀 使用抽出的 API 發送請求
    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 💡 加上防呆機制 ?? 保證無資料時不破圖
    totaldata.value = resdata.map((item) => ({
      item1: item.city ?? "不分縣市",
      item2: item.ride_times ?? 0,
      item3: item.total ?? 0,
      item4: item.long_answer ?? 0,
      item5: item.hangup_gt_six ?? 0,
      item6: item.hangup_gt_six_percentage ?? "0%",
    }));

    makeExecl(totaldata.value, "統整表");

    // 🚀 搜尋成功後，自動回到第一頁
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
  await getdata();
};
</script>

<style scoped></style>