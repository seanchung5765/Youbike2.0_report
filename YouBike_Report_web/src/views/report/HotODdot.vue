<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">平日、假日熱門的OD點 (每月10號更新資料)</h1>
    </div>

    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">平日/假日:</label>
        <div style="width: 140px;">
          <n-select
            v-model:value="isweek"
            placeholder="請選擇"
            multiple
            :options="isWeekoptions"
            :max-tag-count="1"
            size="medium"
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 240px;">
          <n-select
            v-model:value="city"
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
          @click="setallcity"
        >
          全選
        </button>
      </div>

      <div style="width: 140px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="month"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="選擇月份"
          value-format="yyyy-MM"
          :is-date-disabled="disablePreviousDate"
        />
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0;">
        <button
          type="button"
          class="btn btn-success text-light fw-bold"
          @click="search"
        >
          搜尋
        </button>
        <output-excel
          class="btn btn-primary text-light fw-bold"
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
        :scroll-x="1400"
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
import { NDataTable, NSelect, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
import { useUserStore } from "../../stores/userdata";

// 🚀 引入 API
import { getGcpReport } from "@/api/report";
import { getCityList } from "@/api/station";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const isLoading = ref(false);
const dataTable = ref(null);
const data = ref([]);
const isweek = ref([]);
const city = ref([]);
const timestamp = ref(null);
const cityConfig = ref([]);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

const isWeekoptions = [
  { label: "平日", value: "是" },
  { label: "假日", value: "否" },
];

// --- 🌟 載入資料庫縣市清單 ---
const loadCities = async () => {
  try {
    const res = await getCityList();
    const allCitiesFromDB = res.data.data || [];
    cityConfig.value = allCitiesFromDB.filter(c => canusecitys.includes(c.id));
  } catch (error) {
    console.error("載入縣市清單失敗", error);
  }
};

onMounted(() => {
  loadCities();
});

// --- 🌟 城市選項優化：排除 1.0 與 2.0E，僅保留動態 2.0 ---
const availableCityOptions = computed(() => {
  return cityConfig.value.map(c => {
    // 統一加上 2.0 字眼以符合 GCP API 需求
    const cityName = c.name.includes("竹科") ? "竹科" : c.name;
    const gcpValue = `${cityName}2.0`;
    
    return {
      label: gcpValue,
      value: gcpValue
    };
  });
});

const setallcity = () => {
  city.value = availableCityOptions.value.map(c => c.value);
};

// --- 🌟 斑馬紋設定 ---
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// --- 日期防呆 ---
const disablePreviousDate = (ts) => {
  const date = new Date(ts);
  const now = new Date();
  const minDate = new Date(2023, 5, 1); 
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return date < minDate || date >= currentMonthStart;
};

const columns = [
  { key: "num1", align: "center", fixed: "left", title: "名次", width: 80 },
  { key: "num2", align: "center", title: "平日/假日", width: 100 },
  { key: "num3", align: "center", title: "城市", width: 140 },
  { key: "num4", align: "center", title: "借車站代碼", width: 120 },
  { key: "num5", align: "center", title: "借車站", width: 250 },
  { key: "num6", align: "center", title: "還車站代碼", width: 120 },
  { key: "num7", align: "center", title: "還車站", width: 250 },
  { key: "num8", align: "center", title: "租借次數", width: 120 },
];

const makeExecl = (nowdata, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = columns.map(col => col.title);
};

// --- API 請求與資料處理 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "marketing_report",
      table_id: "OD_rank",
      item: isweek.value,
      city: city.value,
      date: `${timestamp.value}-01`,
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    data.value = resdata.map((item) => ({
      num1: item.rank ?? "-",
      num2: item.weekday === "是" ? "平日" : "假日",
      num3: item.city ?? "未提供",
      num4: item.rent_s_no ?? "-",
      num5: item.rent_s_name ?? "未知站點",
      num6: item.s_no ?? "-",
      num7: item.s_name ?? "未知站點",
      num8: item.times ?? 0,
    }));

    makeExecl(data.value, `平日、假日熱門的OD點`);
  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (isweek.value.length === 0) return NotCityAlert("請選擇平日/假日");
  if (city.value.length === 0) return NotCityAlert("請選擇城市");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  getData();
};
</script>

<style scoped>
/* 🌟 強制覆蓋斑馬紋顏色 */
:deep(.table-row-white) > td {
  background-color: #ffffff !important;
}

:deep(.table-row-gray) > td {
  background-color: #e8e8e8 !important; /* 深灰色 */
}

/* 滑鼠經過高亮 */
:deep(.n-data-table-tr:hover) > td {
  background-color: #e6f7ff !important;
}
</style>