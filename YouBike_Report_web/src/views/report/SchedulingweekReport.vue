<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">調度週報</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <!-- 表別 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">表別:</label>
        <div style="width: 130px;">
          <n-select v-model:value="type" :options="typeOptions" placeholder="請選擇" />
        </div>
      </div>

      <!-- 系統別 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">系統別:</label>
        <div style="width: 120px;">
          <n-select v-model:value="category" :options="sysOptions" @update:value="city = null" placeholder="請選擇" />
        </div>
      </div>

      <!-- 城市 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 140px;">
          <n-select v-model:value="city" :options="cityOptions" placeholder="請選擇" :disabled="!category" />
        </div>
      </div>

      <!-- 日期 -->
      <div style="width: 140px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="請選週一"
          :is-date-disabled="disableMondayDate"
          update-value-on-close
        />
      </div>

      <!-- 項目 (僅限排名週報) -->
      <div v-if="type === '調度排名週報'" style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">項目:</label>
        <div style="width: 180px;">
          <n-select v-model:value="item" :options="itemOptions" placeholder="請選擇" />
        </div>
      </div>

      <!-- 按鈕群組 -->
      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
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
      v-show="datatable.length > 0"
      size="small"
      ref="dataTableRef"
      :data="datatable"
      :columns="columns"
      :row-class-name="rowClassName"
      :pagination="pagination"
      :max-height="600"
      :scroll-x="1000"
      :bordered="false"
      :single-line="false"
      striped
    />
  </div>
</template>

<script setup>
import { ref, inject, computed, watch } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { useUserStore } from "../../stores/userdata";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
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
const type = ref(null);
const category = ref(null);
const city = ref(null);
const timestamp = ref(null);
const item = ref(null);
const datatable = ref([]);
const columns = ref([]);
const dataTableRef = ref(null);

// 🚀 Excel 響應式變數
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// --- 🚀 分頁設定 ---
const pagination = ref({ pageSize: 15 });

// --- 🚀 選項資料 ---
const typeOptions = [
  { label: "調度週報", value: "調度週報" },
  { label: "調度排名週報", value: "調度排名週報" }
];

const sysOptions = [
  { label: "1.0", value: "1" },
  { label: "2.0+2.0E", value: "2" }
];

const itemOptions = [
  { label: "無位可還5分鐘以上次數", value: "無位可還5分鐘以上次數" },
  { label: "無位可還10分鐘以上次數", value: "無位可還10分鐘以上次數" },
  { label: "無車可借10分鐘以上次數", value: "無車可借10分鐘以上次數" },
  { label: "無車綁車10分鐘以上次數", value: "無車綁車10分鐘以上次數" }
];

const cityOptions = computed(() => {
  if (!category.value) return [];
  const baseMap = [
    { label: "台北市", value: "Taipei", auth: 2 }, { label: "新北市", value: "Newtaipei", auth: 3 },
    { label: "桃園市", value: "Taoyuan", auth: 4 }, { label: "新竹市", value: "Hsinchu", auth: 5 },
    { label: "新竹縣", value: "Hsinchu_Country", auth: 6 }, { label: "竹科", value: "HsinchuScience", auth: 20 },
    { label: "苗栗縣", value: "Miaoli", auth: 7 }, { label: "台中市", value: "Taichung", auth: 8 },
    { label: "嘉義市", value: "Chiayi", auth: 12 }, { label: "嘉義縣", value: "Chiayi_Country", auth: 13 },
    { label: "台南市", value: "Tainan", auth: 14 }, { label: "高雄市", value: "Kaohsiung", auth: 15 },
    { label: "屏東縣", value: "Pingtung", auth: 16 }, { label: "台東縣", value: "Taitung", auth: 19 }
  ];

  if (category.value === "1") {
    return baseMap.filter(c => ["Newtaipei", "Taoyuan", "Miaoli"].includes(c.value) && canusecitys.includes(c.auth));
  } else {
    const options = [];
    if (canusecitys.includes(2) && canusecitys.includes(3)) options.push({ label: "雙北", value: "TaipeiNewtaipei2" });
    baseMap.forEach(c => { if (canusecitys.includes(c.auth)) options.push({ label: c.label, value: `${c.value}2` }); });
    return options;
  }
});

// --- 🚀 日期防呆 (僅限週一，且有起始限制) ---
const disableMondayDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  // 計算本週一
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentWeekMonday = new Date(todayStart);
  currentWeekMonday.setDate(todayStart.getDate() - (todayStart.getDay() || 7) + 1);

  if (d >= currentWeekMonday) return true; // 只能選過去的週
  if (d.getDay() !== 1) return true; // 只能選週一

  // 起始日期限制
  const limitDate = type.value === "調度週報" ? new Date(2023, 8, 4) : new Date(2023, 8, 11);
  return d < limitDate;
};

// --- 🚀 處理一般週報 (轉置 + 插入分隔行) ---
const processWeeklyMatrix = (rawData) => {
  if (!rawData?.length) return;
  
  // 1. 表頭
  columns.value = rawData.map((col, idx) => ({
    key: `item${idx + 1}`,
    align: "center",
    title: col[2] ?? "",
    fixed: idx === 0 ? "left" : undefined
  }));

  // 2. 轉置並插入分隔
  const rows = [];
  const dataLen = rawData[0].length;
  for (let r = 3; r < dataLen; r++) {
    const rowObj = {};
    rawData.forEach((col, cIdx) => { rowObj[`item${cIdx + 1}`] = col[r] ?? ""; });
    rows.push(rowObj);

    // 🚀 關鍵：根據標題插入黃色分隔行
    if (rowObj.item1 === "溫度") rows.push({ item1: "基本資訊" });
    else if (rowObj.item1 === "週/日達成率") rows.push({ item1: "無位可還" });
    else if (rowObj.item1 === "10分鐘無位可還每萬次發生率") rows.push({ item1: "無車可借" });
  }
  datatable.value = rows;
  pagination.value = { pageSize: 100 };
};

// --- 🚀 處理排名週報 (直接 Mapping) ---
const processRankData = (rawData) => {
  columns.value = [
    { key: "item1", align: "center", title: "排名" },
    { key: "item2", align: "center", title: "場站名稱" },
    { key: "item3", align: "center", title: "分區" },
    { key: "item4", align: "center", title: "次數" },
    { key: "item5", align: "center", title: "上週次數" }
  ];
  datatable.value = rawData.map(i => ({
    item1: i.rank,
    item2: i.station_name,
    item3: i.responsible_area,
    item4: i.times,
    item5: i.times_last_week
  }));
  pagination.value = { pageSize: 10 };
};

// --- API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const isBasic = type.value === "調度週報";
    const params = {
      dataset_id: "report",
      table_id: isBasic ? `weekly_report_maintain_query${category.value}` : `weekly_report_maintain_rank${category.value}`,
      date: timestamp.value,
      city: city.value
    };
    if (!isBasic) params.item = [item.value];

    const res = await getGcpReport(params);
    const resData = res.data?.data || [];

    if (isBasic) processWeeklyMatrix(resData);
    else processRankData(resData);

    // 更新 Excel
    exceldata.value = [...datatable.value];
    excelename.value = type.value;
    excelecolumn.value = columns.value.map(c => c.title);

    if (dataTableRef.value?.page) dataTableRef.value.page(1);
  } catch (error) {
    console.error(error);
    NotCityAlert("查詢失敗");
  } finally {
    isLoading.value = false;
  }
};

// 監聽類型切換，清空日期以重新觸發防呆
watch(type, () => { timestamp.value = null; datatable.value = []; });

const rowClassName = (row) => {
  const dividers = ["基本資訊", "無位可還", "無車可借"];
  return dividers.includes(row.item1) ? "too-old" : "";
};

const search = () => {
  if (!type.value) return NotCityAlert("請選擇表別");
  if (!category.value) return NotCityAlert("請選擇系統別");
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  if (type.value === "調度排名週報" && !item.value) return NotCityAlert("請選擇項目");
  getData();
};
</script>

<style scoped>
:deep(.too-old td) {
  background-color: rgba(225, 232, 23, 0.75) !important;
}
</style>