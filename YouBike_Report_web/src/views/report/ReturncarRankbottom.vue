<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">借還車場站排名 (每月10號更新資料)</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">排名:</label>
        <div style="width: 120px;">
          <n-select
            v-model:value="rankType"
            placeholder="請選擇"
            :options="rankOptions"
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 16px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">借/還:</label>
        <div style="width: 120px;">
          <n-select
            v-model:value="Borrow"
            placeholder="請選擇"
            multiple
            :options="Borrowoptions"
            :max-tag-count="1"
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 180px;">
          <n-select
            v-model:value="city"
            placeholder="請選擇"
            multiple
            clearable
            :options="cityOptions"
            :max-tag-count="1"
          />
        </div>
        <button type="button" class="btn btn-sm btn-success text-light" style="white-space: nowrap;" @click="setAllCity">
          全選
        </button>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 16px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">日期:</label>
        <div style="width: 140px;">
          <n-date-picker
            v-model:formatted-value="timestamp"
            type="month"
            placeholder="選擇月份"
            value-format="yyyy-MM"
            :is-date-disabled="disablePreviousDate"
            update-value-on-close
          />
        </div>
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
        size="small"
        :data="data"
        ref="dataTable"
        :columns="columns"
        :scroll-x="1000"
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
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NSelect, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
import { getGcpReport } from "@/api/report";
import { getAllCities } from "@/api/admin";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

const isLoading = ref(false);
const timestamp = ref(null);
const Borrow = ref([]);
const city = ref([]);
const data = ref([]);
const dataTable = ref(null);

const rankType = ref("rent_return_rank_top");

const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

// --- 選單定義 ---
const rankOptions = [
  { label: "正數", value: "rent_return_rank_top" },
  { label: "倒數", value: "rent_return_rank_bottom" }
];

const Borrowoptions = [
  { label: "借", value: "借" },
  { label: "還", value: "還" }
];

// --- 🚀 城市選單動態載入 (還原保留 2.0E) ---
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];
    
    const options = [];
    dbCities.forEach(c => {
      // 確保啟用中且有權限
      if (c.status === 'active' && canusecitys.includes(c.city_id)) {
        options.push({ label: `${c.city_name}2.0`, value: `${c.city_name}2.0` });
        options.push({ label: `${c.city_name}2.0E`, value: `${c.city_name}2.0E` }); // 🚀 2.0E 保留加回來了
      }
    });
    
    cityOptions.value = options;
  } catch (error) {
    console.error("載入縣市失敗:", error);
  }
};

onMounted(() => {
  loadCities();
});

const setAllCity = () => {
  city.value = cityOptions.value.map(o => o.value);
};

// --- 表頭與樣式 ---
const columns = [
  { key: "num1", align: "center", fixed: "left", title: "名次", width: 70 },
  { key: "num2", align: "center", title: "借/還", width: 80 },
  { key: "num3", align: "center", title: "城市", width: 120 },
  { key: "num4", align: "center", title: "場站代碼", width: 100 },
  { key: "num5", align: "center", title: "場站名稱", width: 250 },
  { key: "num6", align: "center", title: "借車/還車次數", width: 120 },
];

const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

const disablePreviousDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const minDate = new Date(2023, 5, 1); 
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return d < minDate || d >= currentMonthStart;
};

// --- API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "marketing_report",
      table_id: rankType.value,
      item: Borrow.value,
      city: city.value,
      date: `${timestamp.value}-01`,
    };

    const res = await getGcpReport(params);
    const resData = res.data?.data || [];

    data.value = resData.map(element => ({
      num1: element.rank ?? "",
      num2: element.rent_return ?? "",
      num3: element.city ?? "",
      num4: element.station_no ?? "",
      num5: element.station_name ?? "",
      num6: element.times ?? 0,
    }));

    exceldata.value = [...data.value];
    excelename.value = rankType.value === 'rent_return_rank_top' ? "借還車場站排名(前幾名)" : "借還車場站排名(倒數)";
    excelecolumn.value = columns.map(c => c.title);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!rankType.value) return NotCityAlert("請選擇排名方式");
  if (Borrow.value.length === 0) return NotCityAlert("請選擇借/還");
  if (city.value.length === 0) return NotCityAlert("請選擇城市");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
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