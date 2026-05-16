<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">Email 投保分類</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 180px;">
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

      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-success text-light" style="white-space: nowrap;" @click="search">
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
        v-show="data.length > 0"
        ref="dataTable"
        :data="data"
        :columns="columns"
        :max-height="600"
        :scroll-x="1200"
        :bordered="false"
        size="small"
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
import { ref, inject, computed, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
import { useUserStore } from "../../stores/userdata";

// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";
import { getAllCities } from "@/api/admin";

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

// 🚀 改為 ref 以供組件綁定
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// --- 🚀 城市選單 (資料庫 API 動態載入) ---
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];
    
    // 過濾出 active 且有權限的城市 (因為是從資料庫撈，不會有「新竹市+竹科」這種組合)
    const options = dbCities
      .filter(c => c.status === 'active' && canusecitys.includes(c.city_id))
      .map(c => ({
        label: c.city_name,
        value: c.city_name 
      }));

    // 🚀 將「全公司」這個特例塞到陣列的最前面
    options.unshift({ label: "全公司", value: "全公司" });
    
    cityOptions.value = options;

  } catch (error) {
    console.error("載入縣市失敗:", error);
  }
};

onMounted(() => {
  loadCities();
});

const setAllCity = () => { city.value = cityOptions.value.map(c => c.value); };

// --- 月份選單動態生成 ---
const dateOptions = computed(() => {
  const arr = [];
  const start = new Date(2018, 0, 1); 
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1); 

  let current = new Date(start);
  while (current < end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    arr.push({ label: `${y}-${m}`, value: `${y}-${m}` });
    current.setMonth(current.getMonth() + 1);
  }
  return arr.reverse(); 
});

const setAllDate = () => { date.value = dateOptions.value.map(d => d.value); };

// --- 表頭定義 ---
const columns = [
  { key: "item1", align: "center", fixed: "left", title: "月份" },
  { key: "item2", align: "center", title: "縣市" },
  {
    title: "未投保卡片",
    align: "center",
    children: [
      { key: "item3", align: "center", title: "app" },
      { key: "item4", align: "center", title: "kiosk" },
      { key: "item5", align: "center", title: "web" },
      { key: "item6", align: "center", title: "合計" },
    ],
  },
  {
    title: "投保卡片",
    align: "center",
    children: [
      { key: "item7", align: "center", title: "app" },
      { key: "item8", align: "center", title: "kiosk" },
      { key: "item9", align: "center", title: "web" },
      { key: "item10", align: "center", title: "合計" },
    ],
  },
  { key: "item11", align: "center", title: "總計" }, 
];

// --- 🚀 斑馬紋樣式 (#e8e8e8) ---
const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

// --- 多層級表頭 Excel 準備 (移除 writeFile) ---
const prepareExcel = (nowdata, name) => {
  exceldata.value = [...nowdata];
  excelename.value = name;

  const flatColumns = [];
  columns.forEach(col => {
    if (col.children) {
      col.children.forEach(child => {
        flatColumns.push({ key: child.key, title: `${col.title}-${child.title}` });
      });
    } else {
      flatColumns.push({ key: col.key, title: col.title });
    }
  });

  excelecolumn.value = flatColumns.map(c => c.title);
};

// 工具函式
const removeHyphensFromArray = (datesArray) => datesArray.map(date => date.replace(/-/g, ""));

const convertToFormattedDate = (inputNumber) => {
  if (!inputNumber) return "";
  const year = Math.floor(inputNumber / 100);
  const month = inputNumber % 100;
  return `${year}年${String(month).padStart(2, "0")}月`;
};

// --- API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "monthly_report_email_INSUR_count",
      date: removeHyphensFromArray(date.value),
      city: city.value,
    };

    const res = await getGcpReport(params);
    const saultdata = res.data?.data || [];

    data.value = saultdata.map(i => ({
      item1: convertToFormattedDate(i.date),
      item2: i.city ?? "",
      item3: i.N_app ?? 0,
      item4: i.N_kiosk ?? 0,
      item5: i.N_web ?? 0,
      item6: i.N_total ?? 0,
      item7: i.Y_app ?? 0,
      item8: i.Y_kiosk ?? 0,
      item9: i.Y_web ?? 0,
      item10: i.Y_total ?? 0,
      item11: i.total ?? 0,
    }));

    // 🚀 將資料綁定給 OutputExcel
    prepareExcel(data.value, "Email投保分類");

  } catch (error) {
    console.error("API Error:", error);
    NotAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!city.value.length) return NotAlert("請選擇城市");
  if (!date.value.length) return NotAlert("請選擇月份");
  getData();
};
</script>

<style scoped>
/* 🚀 灰色行的背景顏色 (#e8e8e8) */
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

/* 滑鼠經過高亮 */
:deep(.n-data-table .n-data-table-tr.gray-row:hover td) {
  background-color: #d1d1d1 !important;
}
</style>