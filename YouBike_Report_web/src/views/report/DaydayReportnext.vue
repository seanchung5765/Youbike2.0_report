<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">卡片騎乘天數 (每月5號更新資料)</h1>
    </div>

    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 220px;">
          <n-select
            v-model:value="selectedCities"
            placeholder="請選擇"
            multiple
            :options="availableCityOptions"
            :max-tag-count="1"
            size="medium"
          />
        </div>
        <button
          type="button"
          class="btn btn-sm btn-success text-light fw-bold"
          style="white-space: nowrap;"
          @click="selectAllCities"
        >
          全選
        </button>
      </div>

      <div style="width: 160px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="month"
          :actions="null"
          update-value-on-close
          :is-date-disabled="disableFutureMonths"
          placeholder="選擇月份"
          value-format="yyyy-MM"
        />
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0;">
        <button
          type="button"
          class="btn btn-success text-light fw-bold"
          style="white-space: nowrap;"
          @click="search"
        >
          搜尋
        </button>
        <output-excel
          class="btn btn-primary text-light fw-bold"
          style="white-space: nowrap;"
          :data="exceldata"
          :name="excelename"
          :header="excelecolumn"
        />
      </div>
    </form>

    <div style="height: calc(100vh - 160px); padding-bottom: 10px;">
      <n-data-table
        v-show="data.length > 0"
        ref="dataTable"
        size="small"
        :columns="columns"
        :data="data"
        :scroll-x="800"
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
import { ref, inject, computed, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";

// 🚀 引入共用 API 與 縣市清單 API
import { getGcpReport } from "@/api/report";
import { getCityList } from "@/api/station";

const ischange = inject("ischange");
const swal = inject("$swal");
const store = useUserStore();
const canusecitys = store.citys || [];

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const selectedCities = ref([]);
const isLoading = ref(false);
const data = ref([]);
const dataTable = ref(null);
const timestamp = ref(null);
const cityConfig = ref([]);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🌟 載入資料庫縣市清單 ---
const loadCities = async () => {
  try {
    const res = await getCityList();
    const allCitiesFromDB = res.data.data || [];
    // 只保留該員工有權限的縣市
    cityConfig.value = allCitiesFromDB.filter(c => canusecitys.includes(c.id));
  } catch (error) {
    console.error("載入縣市清單失敗", error);
  }
};

onMounted(() => {
  loadCities();
});

// --- 🌟 城市選單優化 (完美對接資料庫與 GCP 特殊變數) ---
const availableCityOptions = computed(() => {
  if (cityConfig.value.length === 0) return [];
  
  const optionsMap = new Map();

  // 💡 這支 GCP API (tan_tan_2) 嚴格要求的對應數字
  const gcpValueMap = {
    2: "1",  // 台北
    3: "2",  // 新北
    4: "3",  // 桃園
    6: "4",  // 新竹縣
    5: "5",  // 新竹市
    20: "5", // 竹科 -> 與新竹市共用參數 5
    7: "6",  // 苗栗
    8: "7",  // 台中
    12: "9", // 嘉義市
    13: "9", // 嘉義縣 -> 與嘉義市共用參數 9
    15: "10", // 高雄
    14: "11", // 台南
    16: "12", // 屏東
    19: "13"  // 台東
  };

  cityConfig.value.forEach(city => {
    const gcpVal = gcpValueMap[city.id];
    if (!gcpVal) return;

    // 確保不會重複推入 (例如同時有新竹市跟竹科的權限時，只出現一個選項)
    if (!optionsMap.has(gcpVal)) {
      let displayLabel = city.name;
      
      // 針對合併區域進行名稱美化
      if (gcpVal === "5") displayLabel = "新竹市+竹科";
      if (gcpVal === "9") displayLabel = "嘉義";
      if (gcpVal === "1") displayLabel = "臺北";
      if (gcpVal === "2") displayLabel = "新北";
      if (gcpVal === "3") displayLabel = "桃園";
      if (gcpVal === "7") displayLabel = "臺中";

      optionsMap.set(gcpVal, { label: displayLabel, value: gcpVal });
    }
  });

  // 按照 value 排序，讓選單看起來整齊
  return Array.from(optionsMap.values()).sort((a, b) => Number(a.value) - Number(b.value));
});

// 全選功能
const selectAllCities = () => {
  selectedCities.value = availableCityOptions.value.map(c => c.value);
};

// --- 🌟 斑馬紋設定 ---
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// --- 日期防呆優化 ---
const disableFutureMonths = (ts) => {
  const date = new Date(ts);
  const now = new Date();
  const minDate = new Date(2022, 0, 1); 
  
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return date < minDate || date >= currentMonthStart;
};

// --- 固定表頭 ---
const columns = [
  { key: "city", align: "center", fixed: "left", title: "城市", width: 120 },
  { key: "month", align: "center", title: "月份", width: 100 },
  { key: "rideday", align: "center", title: "騎乘天數" },
  { key: "cardnum", align: "center", title: "卡片數量" },
];

const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = nowcolumn.map(item => item.title);
};

// --- API 請求與資料處理 ---
const fetchData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "data_analysis",
      table_id: "tan_tan_2",
      city: selectedCities.value,
      date: timestamp.value,
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    data.value = resdata.map((item) => ({
      city: item.city ?? "",
      month: item.date ?? "",
      rideday: item.times ?? 0,
      cardnum: item.card_number ?? 0,
    }));

    makeExecl(data.value, columns, "卡片騎乘天數");

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (selectedCities.value.length === 0) return NotCityAlert("請選擇城市");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  fetchData();
};
</script>

<style scoped>
/* 🌟 強制覆蓋斑馬紋顏色 (包含固定在左側的欄位) */
:deep(.table-row-white) > td {
  background-color: #ffffff !important;
}

:deep(.table-row-gray) > td {
  background-color: #e8e8e8 !important; /* 翔宇指定的深灰色 */
}

/* 滑鼠經過高亮 */
:deep(.n-data-table-tr:hover) > td {
  background-color: #e6f7ff !important;
}
</style>