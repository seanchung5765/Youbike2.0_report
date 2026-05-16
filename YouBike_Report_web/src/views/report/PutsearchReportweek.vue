<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">投保率分析週報</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
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
        v-show="data?.length > 0"
        ref="dataTable"
        :data="data"
        :columns="column"
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
const data = ref([]);
const city = ref([]);
const date = ref([]);

const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// --- 🚀 城市選單 (API 動態載入) ---
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];
    
    // 過濾出 active 且有權限的城市
    const options = dbCities
      .filter(c => c.status === 'active' && canusecitys.includes(c.city_id))
      .map(c => ({
        label: c.city_name,
        value: c.city_name 
      }));

    // 加入全公司選項
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

// --- 星期一日期選單動態生成 ---
const dateOptions = computed(() => {
  const arr = [];
  let currentMonday = new Date(2018, 0, 1);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  while (currentMonday <= now) {
    const y = currentMonday.getFullYear();
    const m = String(currentMonday.getMonth() + 1).padStart(2, "0");
    const d = String(currentMonday.getDate()).padStart(2, "0");
    const val = `${y}-${m}-${d}`;
    arr.push({ label: val, value: val });
    
    currentMonday.setDate(currentMonday.getDate() + 7);
  }
  return arr.reverse();
});

const setAllDate = () => { date.value = dateOptions.value.map(d => d.value); };

// --- 🚀 斑馬紋樣式 (#e8e8e8) ---
const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

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

    const res = await getGcpReport(params);
    const saultdata = res.data?.data || [];

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