<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">調度日報</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <!-- 系統別 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">系統別:</label>
        <div style="width: 120px;">
          <n-select
            v-model:value="category"
            :options="sysOptions"
            @update:value="city = null"
            placeholder="請選擇"
          />
        </div>
      </div>

      <!-- 城市 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 160px;">
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇"
            :disabled="!category"
          />
        </div>
      </div>

      <!-- 日期區間 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <div style="width: 140px;">
          <n-date-picker
            v-model:formatted-value="starttimestamp"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="開始日期"
            :is-date-disabled="disableStartDate"
            clearable
          />
        </div>
        <span class="fw-bold">至</span>
        <div style="width: 140px;">
          <n-date-picker
            v-model:formatted-value="endtimestamp"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="結束日期"
            :is-date-disabled="disableEndDate"
            clearable
          />
        </div>
      </div>

      <!-- 按鈕群組 -->
      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-info text-light" style="white-space: nowrap;" @click="cleardate">清空日期</button>
        <button type="button" class="btn btn-success text-light" style="white-space: nowrap;" @click="search">搜尋</button>
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
      v-show="data?.length > 1"
      size="small"
      ref="dataTable"
      :columns="columns"
      :data="data"
      :pagination="{ pageSize: 18 }"
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
import { useUserStore } from "../../stores/userdata";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
import * as XLSX from "xlsx";
// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const isLoading = ref(false);
const category = ref(null);
const city = ref(null);
const starttimestamp = ref(null);
const endtimestamp = ref(null);
const data = ref([]);
const columns = ref([]);
const dataTable = ref(null);

// 🚀 Excel 響應式變數
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

const sysOptions = [
  { label: "1.0", value: "1" },
  { label: "2.0+2.0E", value: "2" }
];

// --- 🚀 城市選單 (資料驅動) ---
const cityOptions = computed(() => {
  if (!category.value) return [];

  const baseMap = [
    { label: "台北市", value: "Taipei", auth: 2 },
    { label: "新北市", value: "Newtaipei", auth: 3 },
    { label: "桃園市", value: "Taoyuan", auth: 4 },
    { label: "新竹市", value: "Hsinchu", auth: 5 },
    { label: "新竹縣", value: "Hsinchu_Country", auth: 6 },
    { label: "竹科", value: "HsinchuScience", auth: 20 },
    { label: "苗栗縣", value: "Miaoli", auth: 7 },
    { label: "台中市", value: "Taichung", auth: 8 },
    { label: "嘉義市", value: "Chiayi", auth: 12 },
    { label: "嘉義縣", value: "Chiayi_Country", auth: 13 },
    { label: "台南市", value: "Tainan", auth: 14 },
    { label: "高雄市", value: "Kaohsiung", auth: 15 },
    { label: "屏東縣", value: "Pingtung", auth: 16 },
    { label: "台東縣", value: "Taitung", auth: 19 },
  ];

  if (category.value === "1") {
    // 1.0 只有新北、桃園、苗栗
    return baseMap.filter(c => ["Newtaipei", "Taoyuan", "Miaoli"].includes(c.value) && canusecitys.includes(c.auth));
  } else {
    // 2.0 處理：增加「雙北」選項
    const options = [];
    if (canusecitys.includes(2) && canusecitys.includes(3)) {
      options.push({ label: "雙北", value: "TaipeiNewtaipei2" });
    }
    baseMap.forEach(c => {
      if (canusecitys.includes(c.auth)) {
        options.push({ label: c.label, value: `${c.value}2` });
      }
    });
    return options;
  }
});

// --- 🚀 日期防呆 (限制 30 天) ---
const getTodayStart = () => new Date().setHours(0, 0, 0, 0);
const MIN_DATE = new Date(2023, 0, 1).getTime();

const disableStartDate = (ts) => {
  if (ts < MIN_DATE || ts >= getTodayStart()) return true;
  if (endtimestamp.value) {
    const end = new Date(endtimestamp.value).getTime();
    return ts > end || ts < end - 30 * 86400000;
  }
  return false;
};

const disableEndDate = (ts) => {
  if (ts < MIN_DATE || ts >= getTodayStart()) return true;
  if (starttimestamp.value) {
    const start = new Date(starttimestamp.value).getTime();
    return ts < start || ts > start + 30 * 86400000;
  }
  return false;
};

const cleardate = () => { starttimestamp.value = null; endtimestamp.value = null; };

// --- 🚀 資料矩陣處理 (轉置邏輯) ---
const processMatrixData = (rawData) => {
  if (!rawData || rawData.length === 0) return;

  // 1. 製作表頭 (取每支直向 Array 的 index 2 作為 title)
  columns.value = rawData.map((colData, index) => ({
    key: `item${index + 1}`,
    align: "center",
    title: colData[2] ?? "",
    fixed: index === 0 ? "left" : undefined,
    width: index === 0 ? 150 : undefined
  }));

  // 2. 矩陣轉置 (將直向資料轉為 Row)
  // 資料起始點為 index 3
  const rowCount = rawData[0].length;
  const rows = [];
  for (let rowIndex = 3; rowIndex < rowCount; rowIndex++) {
    const rowObj = {};
    rawData.forEach((colData, colIndex) => {
      rowObj[`item${colIndex + 1}`] = colData[rowIndex] ?? "";
    });
    rows.push(rowObj);
  }
  data.value = rows;
};

// --- API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: `daily_report_maintain_query${category.value}`,
      begin_date: starttimestamp.value,
      end_date: endtimestamp.value,
      city: city.value,
    };

    const res = await getGcpReport(params);
    const resData = res.data?.data || [];

    processMatrixData(resData);

    // 更新 Excel 提供者
    exceldata.value = [...data.value];
    excelename.value = "調度日報";
    excelecolumn.value = columns.value.map(c => c.title);

    if (dataTable.value?.page) dataTable.value.page(1);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!category.value) return NotCityAlert("請選擇系統別");
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!starttimestamp.value || !endtimestamp.value) return NotCityAlert("請選擇完整日期範圍");
  getData();
};
</script>