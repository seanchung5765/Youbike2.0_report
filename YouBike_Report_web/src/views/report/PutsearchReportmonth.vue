<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">投保率分析月報</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">類別:</label>
        <div style="width: 180px;">
          <n-select v-model:value="category" :options="categoryOptions" placeholder="請選擇" />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 16px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 160px;">
          <n-select
            v-model:value="city"
            placeholder="請選擇"
            multiple
            clearable
            :options="cityOptions"
            :max-tag-count="1"
            size="medium"
          />
        </div>
        <button type="button" class="btn btn-sm btn-success text-light" style="white-space: nowrap;" @click="setAllCity">
          全選
        </button>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 16px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">日期:</label>
        <div style="width: 220px;">
          <n-select
            v-model:value="date"
            placeholder="可搜尋 (如: 2026)"
            multiple
            filterable
            clearable
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

// 🚀 引入 API
import { getGcpReport } from "@/api/report";
import { getAllCities } from "@/api/admin";

const ischange = inject("ischange");
const swal = inject("$swal");
const store = useUserStore();
const canusecitys = store.citys || [];

async function NotAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const isLoading = ref(false);
const dataTable = ref(null);
const category = ref(null);
const data = ref([]);
const city = ref([]);
const date = ref([]);
const columns = ref([]);

const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// --- 類別選單 ---
const categoryOptions = [
  { label: "騎乘投保率(月)", value: "monthly_report_ride_INSUR" },
  { label: "保險加保統計", value: "monthly_report_INSUR" },
  { label: "實名會員統計", value: "monthly_report_MEBER" },
];

// --- 🚀 城市選單 (API 動態載入) ---
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];
    
    // 過濾並排除掉手寫時代的「新竹市+竹科」
    const options = dbCities
      .filter(c => c.status === 'active' && canusecitys.includes(c.city_id))
      .map(c => ({
        label: c.city_name,
        value: c.city_name 
      }));

    // 🚀 加入全公司選項
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

// --- 🚀 斑馬紋樣式 (#e8e8e8) ---
const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

// --- 表頭定義 ---
const columnConfigs = {
  monthly_report_ride_INSUR: [
    { key: "item1", align: "center", fixed: "left", title: "月份", width: 100 },
    { key: "item2", align: "center", title: "縣市", width: 100 },
    { key: "item3", align: "center", title: "總會員卡數(A)" },
    { key: "item4", align: "center", title: "總騎乘次數(B)" },
    { key: "item5", align: "center", title: "有使用紀錄會員卡數(C)" },
    { key: "item6", align: "center", title: "註冊地卡數" },
    { key: "item7", align: "center", title: "非註冊地卡數" },
    { key: "item8", align: "center", title: "有使用紀錄卡片占比(D=C/A)" },
    { key: "item9", align: "center", title: "有使用紀錄卡片加保張數(E)" },
    { key: "item10", align: "center", title: "保險涵蓋率_卡片數(F=E/C)" },
    { key: "item11", align: "center", title: "有加保卡片的騎乘次數(G)" },
    { key: "item12", align: "center", title: "保險涵蓋率_使用次數(H=G/B)" },
  ],
  monthly_report_INSUR: [
    { key: "item1", align: "center", fixed: "left", title: "月份", width: 100 },
    { key: "item2", align: "center", title: "縣市", width: 100 },
    { key: "item3", align: "center", title: "總加保數" },
    { key: "item4", align: "center", title: "總退保數" },
    { key: "item5", align: "center", title: "累積有效加保數" },
    { key: "item6", align: "center", title: "累積總會員卡片數" },
    { key: "item7", align: "center", title: "總會員加保率" },
  ],
  monthly_report_MEBER: [
    { key: "item1", align: "center", fixed: "left", title: "月份", width: 100 },
    { key: "item2", align: "center", title: "縣市", width: 100 },
    { key: "item3", align: "center", title: "總會員數" },
    { key: "item4", align: "center", title: "實名會員數" },
    { key: "item5", align: "center", title: "非實名會員數" },
    { key: "item6", align: "center", title: "總會員卡片數" },
    { key: "item7", align: "center", title: "實名會員卡片數" },
    { key: "item8", align: "center", title: "非實名會員卡片數" },
  ]
};

// --- 工具函式 ---
const removeHyphensFromArray = (datesArray) => datesArray.map(date => date.replace(/-/g, ""));
const convertToFormattedDate = (inputNumber) => {
  if (!inputNumber) return "";
  const year = Math.floor(inputNumber / 100);
  const month = inputNumber % 100;
  return `${year}年${String(month).padStart(2, "0")}月`;
};

const convertToPercentage = (value) => {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) return value;
  if (Number.isInteger(value)) return value;
  return (value * 100).toFixed(1) + "%";
};

// --- API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: category.value,
      date: removeHyphensFromArray(date.value),
      city: city.value,
    };

    const res = await getGcpReport(params);
    const rawData = res.data?.data || [];

    columns.value = columnConfigs[category.value];
    let excelName = categoryOptions.find(o => o.value === category.value)?.label || "報表";

    // 🚀 資料 Mapping
    if (category.value === "monthly_report_ride_INSUR") {
      data.value = rawData.map(i => ({
        item1: convertToFormattedDate(i.date), item2: i.city ?? "",
        item3: i.total_card ?? 0, item4: i.ride_times ?? 0,
        item5: i.ride_card ?? 0, item6: i.ride_card_incity ?? 0,
        item7: i.ride_card_nocity ?? 0, item8: convertToPercentage(i.active_per),
        item9: i.ride_card_INSUR ?? 0, item10: convertToPercentage(i.ride_card_INSUR_per),
        item11: i.ride_times_INSUR ?? 0, item12: convertToPercentage(i.ride_times_INSUR_per),
      }));
    } else if (category.value === "monthly_report_INSUR") {
      data.value = rawData.map(i => ({
        item1: convertToFormattedDate(i.date), item2: i.city ?? "",
        item3: i.total_add ?? 0, item4: i.total_minus ?? 0,
        item5: i.total_card_name ?? 0, item6: i.total_card ?? 0,
        item7: convertToPercentage(i.INSUR_rate),
      }));
    } else if (category.value === "monthly_report_MEBER") {
      data.value = rawData.map(i => ({
        item1: convertToFormattedDate(i.date), item2: i.city ?? "",
        item3: i.total_meber ?? 0, item4: i.total_meber_name ?? 0,
        item5: i.total_meber_no_name ?? 0, item6: i.total_card ?? 0,
        item7: i.total_card_name ?? 0, item8: i.total_card_no_name ?? 0,
      }));
    }

    // 🚀 準備匯出資料
    exceldata.value = [...data.value];
    excelename.value = excelName;
    excelecolumn.value = columns.value.map(c => c.title);

  } catch (error) {
    console.error("API Error:", error);
    NotAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!category.value) return NotAlert("請選擇類別");
  if (!city.value.length) return NotAlert("請選擇城市");
  if (!date.value.length) return NotAlert("請選擇日期");
  getData();
};
</script>

<style scoped>
/* 🚀 灰色行的背景顏色 (#e8e8e8) */
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

/* 滑鼠經過高亮 (避免被灰色強制蓋掉) */
:deep(.n-data-table .n-data-table-tr.gray-row:hover td) {
  background-color: #d1d1d1 !important;
}
</style>