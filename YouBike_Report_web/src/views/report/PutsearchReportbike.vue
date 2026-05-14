<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">騎乘次數明細比例</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <!-- 城市與全選 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 180px;">
          <!-- 🚀 統一為 n-select -->
          <n-select
            v-model:value="city"
            placeholder="請選擇"
            multiple
            :options="cityOptions"
            :max-tag-count="1"
            size="medium"
          />
        </div>
        <button type="button" class="btn btn-sm btn-success text-light" style="white-space: nowrap;" @click="setAllCity">
          全選
        </button>
      </div>

      <!-- 月份與全選 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; margin-left: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">月份:</label>
        <div style="width: 180px;">
          <n-select
            v-model:value="date"
            placeholder="請選擇"
            multiple
            :options="dateOptions"
            :max-tag-count="1"
            size="medium"
          />
        </div>
        <button type="button" class="btn btn-sm btn-success text-light" style="white-space: nowrap;" @click="setAllDate">
          全選
        </button>
      </div>

      <!-- 搜尋匯出按鈕 -->
      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-primary text-light" style="white-space: nowrap;" @click="search">
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
      :data="data"
      :columns="column"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="800"
      :bordered="false"
      size="small"
      :single-line="false"
      striped
    />
  </div>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
import { useUserStore } from "../../stores/userdata";
import * as XLSX from "xlsx";
// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const isLoading = ref(false);
const dataTable = ref(null);
const data = ref([]);
const city = ref([]);
const date = ref([]);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🚀 城市選單 (資料驅動 Computed) ---
const cityOptions = computed(() => {
  const map = [
    { label: "台北市", value: "台北市", auth: [2] },
    { label: "新北市", value: "新北市", auth: [3] },
    { label: "桃園市", value: "桃園市", auth: [4] },
    { label: "新竹市+竹科", value: "新竹市+竹科", auth: [5, 20] }, // 特殊：需要同時有 5 和 20
    { label: "新竹市", value: "新竹市", auth: [5] },
    { label: "新竹縣", value: "新竹縣", auth: [6] },
    { label: "竹科", value: "竹科", auth: [20] },
    { label: "苗栗縣", value: "苗栗縣", auth: [7] },
    { label: "台中市", value: "台中市", auth: [8] },
    { label: "嘉義市", value: "嘉義市", auth: [12] },
    { label: "嘉義縣", value: "嘉義縣", auth: [13] },
    { label: "台南市", value: "台南市", auth: [14] },
    { label: "高雄市", value: "高雄市", auth: [15] },
    { label: "屏東縣", value: "屏東縣", auth: [16] },
    { label: "台東縣", value: "台東縣", auth: [19] },
  ];

  // 確保必須的權限 (auth 陣列內的 ID) 使用者都有
  return map.filter(c => c.auth.every(a => canusecitys.includes(a)));
});

const setAllCity = () => {
  city.value = cityOptions.value.map(c => c.value);
};

// --- 🚀 月份選單動態生成 (極簡寫法) ---
const dateOptions = computed(() => {
  const arr = [];
  const start = new Date(2018, 0, 1); // 2018-01
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1); // 算到上個月為止

  let current = new Date(start);
  while (current < end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    arr.push({ label: `${y}-${m}`, value: `${y}-${m}` });
    current.setMonth(current.getMonth() + 1);
  }
  
  return arr.reverse(); // 🚀 反轉陣列，讓最新的月份排在最上面，UX 更好
});

const setAllDate = () => {
  date.value = dateOptions.value.map(d => d.value);
};

// --- 表頭定義 ---
const column = [
  { key: "item1", align: "center", fixed: "left", title: "使用次數" },
  { key: "item2", align: "center", title: "未加保卡數" },
  { key: "item3", align: "center", title: "已加保卡數" },
  { key: "item4", align: "center", title: "卡數合計" },
  { key: "item5", align: "center", title: "未加保比例" },
  { key: "item6", align: "center", title: "已加保比例" },
];

const makeExecl = (nowdata, name) => {
  if (!nowdata || !nowdata.length) return NotAlert("空資料不能匯出");
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = column.map(c => c.title);

  const validKeys = column.map(c => c.key);
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exceldata, { header: validKeys, skipHeader: true });
  XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
  XLSX.utils.sheet_add_aoa(worksheet, [excelecolumn], { origin: "A1" });
  XLSX.writeFile(workbook, `${excelename}.xlsx`);
};

// 將 ["2023-05", "2023-06"] 轉為 ["202305", "202306"]
const removeHyphensFromArray = (datesArray) => datesArray.map(date => date.replace(/-/g, ""));

// --- API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "alluse2",
      date: removeHyphensFromArray(date.value),
      city: city.value,
    };

    // 🚀 使用共用 API
    const res = await getGcpReport(params);
    const saultdata = res.data?.data || [];

    // 🚀 陣列映射防護
    data.value = saultdata.map(i => ({
      item1: i.usetime ?? "",
      item2: i.N ?? 0,
      item3: i.Y ?? 0,
      item4: i.Card_CNT ?? 0,
      item5: i.N_prop ?? "0%",
      item6: i.Y_prop ?? "0%",
    }));

    makeExecl(data.value, "騎乘次數明細比例");

    if (dataTable.value?.page) dataTable.value.page(1);

  } catch (error) {
    console.error("API Error:", error);
    NotAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!city.value.length) return NotAlert("請選擇城市");
  if (!date.value.length) return NotAlert("請選擇月份"); // 🚀 修復了原本錯誤提示寫「請選擇每週一日期」的 Bug
  getData();
};
</script>

<style scoped></style>