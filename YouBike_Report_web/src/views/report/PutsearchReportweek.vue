<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">投保率分析週報</h1>
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
        <div style="width: 160px;">
          <!-- 🚀 統一為 n-select -->
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

      <!-- 日期與全選/清空 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 16px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">日期:</label>
        <div style="width: 220px;">
          <n-select
            v-model:value="date"
            placeholder="可輸入搜尋 (如: 2026-05)"
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
        <button type="button" class="btn btn-sm btn-secondary text-light" style="white-space: nowrap;" @click="date = []">
          清空
        </button>
      </div>

      <!-- 搜尋匯出按鈕 -->
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

    <n-data-table
      v-show="data?.length > 0"
      ref="dataTable"
      :data="data"
      :columns="column"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="1200"
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
// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

const ischange = inject("ischange");
const swal = inject("$swal");
const store = useUserStore();
const canusecitys = store.citys || [];

async function NotAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const isLoading = ref(false);
const dataTable = ref(null);
const data = ref([]);
const city = ref([]);
const date = ref([]);

// 🚀 改用 ref，確保 OutputExcel 元件能即時抓到資料變化
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// --- 🚀 城市選單 (資料驅動 Computed) ---
const cityOptions = computed(() => {
  const map = [
    { label: "全公司", value: "全公司", auth: [] },
    { label: "台北市", value: "台北市", auth: [2] },
    { label: "新北市", value: "新北市", auth: [3] },
    { label: "桃園市", value: "桃園市", auth: [4] },
    { label: "新竹市+竹科", value: "新竹市+竹科", auth: [5, 20] }, // 需同時具備 5 與 20
    { label: "新竹市", value: "新竹市", auth: [5] },
    { label: "新竹縣", value: "新竹縣", auth: [6] },
    { label: "竹科", value: "竹科", auth: [20] },
    { label: "苗栗縣", value: "苗栗縣", auth: [7] },
    { label: "台中市", value: "台中市", auth: [8] },
    { label: "彰化縣", value: "彰化縣", auth: [9] },
    { label: "嘉義市", value: "嘉義市", auth: [12] },
    { label: "嘉義縣", value: "嘉義縣", auth: [13] },
    { label: "台南市", value: "台南市", auth: [14] },
    { label: "高雄市", value: "高雄市", auth: [15] },
    { label: "屏東縣", value: "屏東縣", auth: [16] },
    { label: "台東縣", value: "台東縣", auth: [19] },
  ];
  return map.filter(c => c.auth.every(a => canusecitys.includes(a)));
});

const setAllCity = () => { city.value = cityOptions.value.map(c => c.value); };

// --- 🚀 星期一日期選單動態生成 (效能優化版) ---
const dateOptions = computed(() => {
  const arr = [];
  // 💡 2018-01-01 剛好就是星期一，所以我們直接從這天開始
  let currentMonday = new Date(2018, 0, 1);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 🚀 直接每次 +7 天，跳過無效的一天一天檢查，效能提升 7 倍
  while (currentMonday <= now) {
    const y = currentMonday.getFullYear();
    const m = String(currentMonday.getMonth() + 1).padStart(2, "0");
    const d = String(currentMonday.getDate()).padStart(2, "0");
    const val = `${y}-${m}-${d}`;
    arr.push({ label: val, value: val });
    
    currentMonday.setDate(currentMonday.getDate() + 7);
  }
  return arr.reverse(); // 最新日期排最上面
});

const setAllDate = () => { date.value = dateOptions.value.map(d => d.value); };

// --- 表頭定義 ---
const column = [
  { key: "item1", align: "center", fixed: "left", title: "週次", width: 150 },
  { key: "item2", align: "center", title: "縣市", width: 100 },
  { key: "item3", align: "center", title: "總會員卡數(A)" },
  { key: "item4", align: "center", title: "總騎乘次數(B)" },
  { key: "item5", align: "center", title: "有使用紀錄會員卡數(C)" },
  { key: "item6", align: "center", title: "註冊地卡數" },
  { key: "item7", align: "center", title: "非註冊地卡數" },
  { key: "item8", align: "center", title: "有使用記錄卡片占比(D=C/A)" },
  { key: "item9", align: "center", title: "有使用記錄卡片加保張數(E)" },
  { key: "item10", align: "center", title: "保險涵蓋率_卡片數(F=E/C)" },
  { key: "item11", align: "center", title: "有加保卡片的騎乘次數(G)" },
  { key: "item12", align: "center", title: "保險涵蓋率_使用次數(H=G/B)" },
];

// --- 準備給 OutputExcel 的資料 ---
const prepareExcelData = (nowdata, nowcolumn, name) => {
  exceldata.value = [...nowdata];
  excelename.value = name;
  excelecolumn.value = nowcolumn.map(c => c.title);
};

// --- API 請求與資料處理 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "weekly_report_ride_INSUR",
      date: date.value,
      city: city.value,
    };

    // 🚀 使用抽離的 API
    const res = await getGcpReport(params);
    const saultdata = res.data?.data || [];

    // 🚀 使用 .map 陣列映射防護
    data.value = saultdata.map(i => ({
      item1: i.week_range ?? "",
      item2: i.city ?? "",
      item3: i.total_card ?? 0,
      item4: i.ride_times ?? 0,
      item5: i.ride_card ?? 0,
      item6: i.ride_card_incity ?? 0,
      item7: i.ride_card_nocity ?? 0,
      item8: i.active_per ?? "0%",
      item9: i.ride_card_INSUR ?? 0,
      item10: i.ride_card_INSUR_per ?? "0%",
      item11: i.ride_times_INSUR ?? 0,
      item12: i.ride_times_INSUR_per ?? "0%",
    }));

    prepareExcelData(data.value, column, "投保率分析週報");
    
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
  if (!date.value.length) return NotAlert("請選擇每週一日期");
  getData();
};
</script>

<style scoped></style>