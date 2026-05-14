<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />

    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">營運管理月報</h1>
    </div>
    
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
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

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 140px;">
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇"
          />
        </div>
      </div>

      <div style="width: 140px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="year"
          :actions="null"
          :input-readonly="true"
          :is-date-disabled="disableDate"
          placeholder="請選擇年份"
          value-format="yyyy"
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
          :data="dataTable"
          :name="excelName"
          :header="excelHeaders"
        />
      </div>
    </form>

    <n-data-table
      v-show="dataTable.length > 0"
      size="small"
      ref="table"
      :row-class-name="rowClassName"
      :columns="columns"
      :data="dataTable"
      :max-height="600"
      :scroll-x="1200"
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
import { getGcpReport } from "@/api/report";

const ischange = inject("ischange");
const store = useUserStore();
const canusecitys = store.citys || [];
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

// --- 狀態管理 ---
const isLoading = ref(false);
const category = ref(null);
const city = ref(null);
const timestamp = ref(null);
const dataTable = ref([]);
const columns = ref([]);
const excelName = ref("營運管理月報");

// --- 🚀 計算屬性：自動從 columns 中取出標題作為 Excel 表頭 ---
const excelHeaders = computed(() => {
  return columns.value.map(col => col.title);
});

// --- 選項定義 ---
const sysOptions = [
  { label: "1.0", value: "1" },
  { label: "2.0", value: "2" },
  { label: "2.0E", value: "2E" },
];

const cityOptions = computed(() => {
  if (!category.value) return [];
  const suffix = category.value === "1" ? "" : category.value === "2" ? "2" : "2E";
  const map = [
    { label: "台北市", baseValue: "Taipei", auth: 2 },
    { label: "新北市", baseValue: "Newtaipei", auth: 3 },
    { label: "桃園市", baseValue: "Taoyuan", auth: 4 },
    { label: "新竹市", baseValue: "Hsinchu", auth: 5 },
    { label: "新竹縣", baseValue: "Hsinchu_Country", auth: 6 },
    { label: "竹科", baseValue: "HsinchuScience", auth: 20 },
    { label: "苗栗縣", baseValue: "Miaoli", auth: 7 },
    { label: "台中市", baseValue: "Taichung", auth: 8 },
    { label: "嘉義市", baseValue: "Chiayi", auth: 12 },
    { label: "嘉義縣", baseValue: "Chiayi_Country", auth: 13 },
    { label: "台南市", baseValue: "Tainan", auth: 14 },
    { label: "高雄市", baseValue: "Kaohsiung", auth: 15 },
    { label: "屏東縣", baseValue: "Pingtung", auth: 16 },
    { label: "台東縣", baseValue: "Taitung", auth: 19 },
  ];

  if (category.value === "1") {
    return map.filter(c => ["Newtaipei", "Taoyuan", "Miaoli"].includes(c.baseValue) && canusecitys.includes(c.auth))
               .map(c => ({ label: c.label, value: c.baseValue }));
  }
  return map.filter(c => canusecitys.includes(c.auth))
            .map(c => ({ label: c.label, value: `${c.baseValue}${suffix}` }));
});

const disableDate = (ts) => {
  const year = new Date(ts).getFullYear();
  const nowYear = new Date().getFullYear();
  return year < 2020 || year > nowYear;
};

// --- 🚀 API 請求與資料處理 ---
const getDate = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: `monthly_report_query${category.value}`,
      city: city.value,
      date: timestamp.value,
    };

    const res = await getGcpReport(params);
    const data = res.data?.data || [];

    if (data.length === 0) {
      columns.value = [];
      dataTable.value = [];
      return;
    }

    // 1. 動態建立 Columns
    const colObj = data[0];
    const newCols = [
      { key: "item1", align: "center", fixed: "left", width: 200, title: colObj.item },
      { key: "item2", align: "center", title: colObj.year1 },
    ];
    for (let i = 1; i <= 12; i++) {
      newCols.push({ key: `item${i + 2}`, align: "center", title: colObj[`month${i}`] });
    }
    newCols.push({ key: "item15", align: "center", title: colObj.year2 });
    columns.value = newCols;

    // 2. 🚀 資料轉換 (消滅手寫對應)
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const element = data[i];
      const rowObj = {
        item1: element.item ?? "",
        item2: element.year1 ?? "",
      };
      for (let j = 1; j <= 12; j++) {
        rowObj[`item${j + 2}`] = element[`month${j}`] ?? "";
      }
      rowObj.item15 = element.year2 ?? "";
      rows.push(rowObj);
    }
    dataTable.value = rows;

    // 💡 修正點：移除原有的 makeExecl 呼叫，不再自動下載
    excelName.value = `${category.value === '1' ? '1.0' : category.value === '2' ? '2.0' : '2.0E'}_營運管理月報`;

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
  if (!timestamp.value) return NotCityAlert("請選擇年份");
  getDate();
};

const rowClassName = (row) => {
  const highlightItems = [
    "場站資訊", "租借資訊", "收入資訊", "妥善率資訊", "票卡資訊",
    "租賃收入明細", "各時段使用資訊", "營運資訊", "租賃時間使用資訊",
    "維護管理", "騎乘距離分析", "保險投保數量", "註冊票卡淨增加數"
  ];
  if (
    highlightItems.includes(row.item1) ||
    (row.item1 === "當月租借車次" && !row.item2 && !row.item3 && !row.item4 && !row.item5 && !row.item6)
  ) {
    return "too-old";
  }
  return "";
};
</script>

<style scoped>
:deep(.too-old td) {
  background-color: rgba(225, 232, 23, 0.75) !important;
}
</style>