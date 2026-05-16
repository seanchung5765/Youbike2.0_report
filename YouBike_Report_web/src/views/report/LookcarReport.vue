<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">見車率統計週報</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 120px;">
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇"
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 12px;">
        <n-checkbox v-model:checked="stationAll" size="large" style="white-space: nowrap;">
          場站全選
        </n-checkbox>
        <div style="width: 240px; flex-shrink: 0;">
          <el-select-v2
            :disabled="stationAll"
            v-model="selectstationvalue"
            filterable
            :options="options"
            placeholder="請選擇場站名稱"
            style="width: 100%;" 
            class="text-light"
            multiple
            collapse-tags
            collapse-tags-tooltip
            clearable
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">區間:</label>
        <div style="width: 120px;">
          <n-select
            v-model:value="item"
            :options="intervalOptions"
            placeholder="請選擇"
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">類型:</label>
        <div style="width: 180px;">
          <n-select
            v-model:value="category"
            placeholder="請選擇"
            multiple
            :options="statusOptions"
            :max-tag-count="1"
          />
        </div>
      </div>

      <div style="width: 160px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="date"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="選擇週一日期"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disableDate"
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
          :data="exceldata"
          :name="excelename"
          :header="excelecolumn"
        />
      </div>
    </form>

    <div style="height: calc(100vh - 180px); padding-bottom: 10px; margin-top: 10px;">
      <n-data-table
        v-show="totaldata.length > 0"
        ref="dataTable"
        size="small"
        :columns="tableColumns"
        :data="totaldata"
        :pagination="{ pageSize: 50 }"
        :scroll-x="1500"
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
import { ref, inject, watch, onMounted } from "vue";
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NDatePicker, NSelect, NCheckbox } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";

// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";
import { getAllCities } from "@/api/admin";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function errorAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const isLoading = ref(false);
const city = ref(null);
const category = ref([]);
const timestamp = ref(null);
const item = ref(null);

const stationAll = ref(true);
const selectstationvalue = ref([]);
const options = ref([]);

let StationValue = []; // 儲存所有站點原始資料
const totaldata = ref([]);
const tableColumns = ref([]); // 動態表格欄位
const dataTable = ref(null);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 區間與類型選項定義 ---
const intervalOptions = [
  { label: "全天", value: "all_day" },
  { label: "6-24點", value: "6_to_24_hour" }
];

const statusOptions = [
  { label: "無車", value: "無車" },
  { label: "無位", value: "無位" },
  { label: "見車率", value: "見車率" },
  { label: "見位率", value: "見位率" },
];

// --- 🚀 城市選單 (由 API 動態載入) ---
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];

    cityOptions.value = dbCities
      .filter(c => c.status === 'active')
      .map(c => ({
        label: c.city_name,
        value: c.city_name,
        disabled: !canusecitys.includes(c.city_id)
      }));
  } catch (error) {
    console.error("載入縣市失敗:", error);
  }
};

// --- 一灰一白斑馬紋設定 (#e8e8e8) ---
const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

// --- 日期防呆 (限制只能選禮拜一，且 >= 2024年) ---
function disableDate(ts) {
  const date = new Date(ts);
  const now = new Date();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = today.getDay() || 7; 
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() - day + 1);

  if (date >= currentWeekMonday) return true;
  if (date.getDay() !== 1) return true;
  if (date.getFullYear() < 2024) return true;

  return false;
}

// --- 取得場站與連動邏輯 ---
const getStationData = async () => {
  try {
    const res = await getGcpReport({ dataset_id: "yb2", table_id: "station" });
    StationValue = res.data?.data || [];
  } catch (error) {
    console.error("Fetch Station Error:", error);
  }
};

watch(city, (newCity) => {
  if (!newCity) {
    options.value = [];
    selectstationvalue.value = [];
    return;
  }
  
  const arr = StationValue
    .filter(s => newCity.includes(s.city))
    .map(s => ({
      label: s.s_name_tw,
      value: `${s.s_no}-${s.city}`
    }));

  options.value = arr;

  selectstationvalue.value = selectstationvalue.value.filter(val => 
    newCity.includes(val.split("-")[1])
  );
});

// --- 🚀 產生動態 7 天表頭 (給匯出用) ---
function getDynamicColumns() {
  const initialDate = new Date(timestamp.value);
  const dateArray = [];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(initialDate);
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dateArray.push(`${year}-${month}-${day}`);
  }

  return [
    "責任區", "場站代號", "站名", "車位數", "狀態",
    ...dateArray,
    "總計"
  ];
}

// --- 🚀 設定網頁資料表的動態 Columns ---
function updateTableColumns() {
  const dynamicHeaders = getDynamicColumns();
  
  // 對應到 formattedData 裡的 key
  const keys = [
    "item1", "item3", "item4", "item5", "item6",
    "item7", "item8", "item9", "item10", "item11", "item12", "item13",
    "item14"
  ];

  tableColumns.value = dynamicHeaders.map((title, index) => ({
    title: title,
    key: keys[index],
    align: "center",
    width: index < 5 ? 120 : 100, // 前面的欄位稍微寬一點
    fixed: index < 3 ? 'left' : false // 把「責任區、代號、站名」固定在左側
  }));
}

// --- 準備 OutputExcel 元件所需資料 ---
const makeExecl = (nowdata, dynamicColumns, name) => {
  exceldata = nowdata;
  excelename = name;
  excelecolumn = dynamicColumns;
};

// --- API 請求與資料處理 ---
const search = async () => {
  if (!city.value) return errorAlert("請選擇城市");
  if (!stationAll.value && selectstationvalue.value.length === 0) return errorAlert("請選擇場站");
  if (!item.value) return errorAlert("請選擇區間");
  if (category.value.length === 0) return errorAlert("請選擇類型");
  if (!timestamp.value) return errorAlert("請選擇日期");

  try {
    isLoading.value = true;
    const params = {
      dataset_id: "data_analysis",
      table_id: "weekly_empty_full_station",
      station: stationAll.value ? ["all"] : selectstationvalue.value.map(val => parseInt(val.split("-")[0])),
      date: timestamp.value,
      item: item.value,
      city: [city.value],
      status: category.value,
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    const formattedData = resdata.map(element => ({
      item1: element.responsible_area ?? "",
      item3: element.s_no ?? "",
      item4: element.s_name ?? "",
      item5: element.s_total ?? 0,
      item6: element.status ?? "",
      item7: element.day1 ?? "",
      item8: element.day2 ?? "",
      item9: element.day3 ?? "",
      item10: element.day4 ?? "",
      item11: element.day5 ?? "",
      item12: element.day6 ?? "",
      item13: element.day7 ?? "",
      item14: element.total ?? "",
    }));

    totaldata.value = formattedData;
    updateTableColumns(); // 建立網頁表格的動態欄位

    const dynamicColumns = getDynamicColumns();
    const fileName = `${item.value === "all_day" ? "全天" : "6-24點"}_見車率統計週報`;

    makeExecl(formattedData, dynamicColumns, fileName);

    if (dataTable.value) {
      dataTable.value.page(1);
    }

  } catch (error) {
    console.error("API Error:", error);
    errorAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getStationData();
  loadCities();
});
</script>

<style scoped>
/* 🚀 灰色行的背景顏色 (#e8e8e8) */
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

/* 確保滑鼠移過去時有回饋顏色 (避免被強制蓋掉) */
:deep(.n-data-table .n-data-table-tr.gray-row:hover td) {
  background-color: #d1d1d1 !important;
}
</style>