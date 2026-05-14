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

    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <!-- 城市選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 120px;">
          <!-- 🚀 升級為 n-select -->
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇"
          />
        </div>
      </div>

      <!-- 場站選擇 (全選 + 虛擬滾動下拉) -->
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

      <!-- 區間選擇 -->
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

      <!-- 類型選擇 -->
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

      <!-- 日期選擇 (限制星期一) -->
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

      <!-- 按鈕 -->
      <div style="display: flex; flex-shrink: 0;">
        <button
          type="button"
          class="btn btn-primary text-light"
          style="white-space: nowrap;"
          @click="search"
        >
          搜尋匯出
        </button>
      </div>
    </form>

    <!-- 提示區塊 -->
    <n-result class="mt-5" status="info" title="此頁面只供下載 EXCEL，無網頁資料表預覽">
    </n-result>
  </div>
</template>

<script setup>
import { ref, inject, watch, computed, onMounted } from "vue";
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDatePicker, NSelect, NResult, NCheckbox } from "naive-ui";
import * as XLSX from "xlsx";
// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

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
let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🚀 區間與類型選項定義 ---
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

// --- 🚀 城市選單 (資料驅動 Computed) ---
const cityOptions = computed(() => {
  const map = [
    { label: "台北市", value: "台北市", auth: 2 },
    { label: "新北市", value: "新北市", auth: 3 },
    { label: "桃園市", value: "桃園市", auth: 4 },
    { label: "新竹市", value: "新竹市", auth: 5 },
    { label: "新竹縣", value: "新竹縣", auth: 6 },
    { label: "竹科", value: "竹科", auth: 20 },
    { label: "苗栗縣", value: "苗栗縣", auth: 7 },
    { label: "台中市", value: "台中市", auth: 8 },
    { label: "嘉義市", value: "嘉義市", auth: 12 },
    { label: "嘉義縣", value: "嘉義縣", auth: 13 },
    { label: "台南市", value: "台南市", auth: 14 },
    { label: "高雄市", value: "高雄市", auth: 15 },
    { label: "屏東縣", value: "屏東縣", auth: 16 },
    { label: "台東縣", value: "台東縣", auth: 19 }
  ];
  return map.filter(c => canusecitys.includes(c.auth));
});

// --- 日期防呆 (限制只能選禮拜一，且 >= 2024年) ---
function disableDate(ts) {
  const date = new Date(ts);
  const now = new Date();
  
  // 找出本週的星期一
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = today.getDay() || 7; // 將日轉為 7
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() - day + 1);

  // 條件 1: 禁用本週一以後的日期
  if (date >= currentWeekMonday) return true;
  // 條件 2: 只能選星期一
  if (date.getDay() !== 1) return true;
  // 條件 3: 禁用 2024 以前
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
  
  // 根據選擇的城市過濾站點
  const arr = StationValue
    .filter(s => newCity.includes(s.city))
    .map(s => ({
      label: s.s_name_tw,
      value: `${s.s_no}-${s.city}`
    }));

  options.value = arr;

  // 清除不屬於該城市的已選站點
  selectstationvalue.value = selectstationvalue.value.filter(val => 
    newCity.includes(val.split("-")[1])
  );
});

// --- 產生動態 7 天表頭 ---
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

// --- 自訂 Excel 匯出邏輯 ---
const makeExecl = (nowdata, nowcolumn, name) => {
  if (!nowdata || nowdata.length === 0) {
    return errorAlert("查詢結果為空，無法匯出");
  }

  const workbook = XLSX.utils.book_new();
  // 💡 使用 skipHeader 防止 JSON keys (item1, item3...) 變成表頭
  const worksheet = XLSX.utils.json_to_sheet(nowdata, { skipHeader: true });
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  
  // 💡 將自訂的中文表頭插入第一列 (A1)
  XLSX.utils.sheet_add_aoa(worksheet, [nowcolumn], { origin: "A1" });
  XLSX.writeFile(workbook, `${name}.xlsx`);
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

    // 🚀 使用共用 API，解決 401 問題
    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 整理成供 Excel 匯出的格式 (保持原本的 item 對應順序)
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

    const dynamicColumns = getDynamicColumns();
    const fileName = `${item.value === "all_day" ? "全天" : "6-24點"}_見車率統計週報`;

    makeExecl(formattedData, dynamicColumns, fileName);

  } catch (error) {
    console.error("API Error:", error);
    errorAlert("查詢或匯出失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

// 🚀 改用 onMounted 進行初始化，取代舊版的立即執行函式
onMounted(() => {
  getStationData();
});
</script>

<style scoped>
/* 避免污染全域 CSS，加上 scoped */
</style>