<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">見車率統計月報</h1>
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
        
        <!-- 🚀 解決跑版：直接在 el-select-v2 綁定 width: 240px -->
        <el-select-v2
          :disabled="stationAll"
          v-model="selectstationvalue"
          filterable
          :options="options"
          placeholder="請選擇場站名稱"
          style="width: 240px;"
          class="text-light"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
        />
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

      <!-- 月份選擇 -->
      <div style="width: 140px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="month"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="選擇月份"
          value-format="yyyy-MM"
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

    <n-result class="mt-5" status="info" title="此頁面只供下載 EXCEL，無網頁資料表預覽"></n-result>
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
const item = ref(null);

const stationAll = ref(true);
const selectstationvalue = ref([]);
const options = ref([]);

let StationValue = [];
let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🚀 月份防呆與預設值優化 ---
function getPreviousMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

const timestamp = ref(getPreviousMonth());

function disableDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const minDate = new Date(2024, 0, 1); // 限制從 2024 年開始

  // 禁用 2024 以前，以及本月(含)以後的月份
  return d < minDate || d >= currentMonthStart;
}

// --- 🚀 選項定義 (資料驅動) ---
const intervalOptions = [
  { label: "全天", value: "all_day" },
  { label: "6-24點", value: "6_to_24_hour" }
];

const statusOptions = [
  { label: "無車", value: "無車" },
  { label: "無位", value: "無位" },
  { label: "見車率", value: "見車率" },
  { label: "見位率", value: "見位率" }
];

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
  
  options.value = StationValue
    .filter(s => newCity.includes(s.city))
    .map(s => ({
      label: s.s_name_tw,
      value: `${s.s_no}-${s.city}`
    }));

  selectstationvalue.value = selectstationvalue.value.filter(val => 
    newCity.includes(val.split("-")[1])
  );
});

// --- 表頭定義 ---
const dynamicColumns = [
  "責任區", "場站代號", "站名", "車位數", "狀態",
  ...Array.from({ length: 31 }, (_, i) => `${i + 1}`), // 自動生成 1~31 天
  "總計"
];

const makeExecl = (nowdata, nowcolumn, name) => {
  if (!nowdata || nowdata.length === 0) return errorAlert("空資料不能匯出");

  const workbook = XLSX.utils.book_new();
  // 💡 加上 skipHeader: true，避免 item1, item3 變成第一行
  const worksheet = XLSX.utils.json_to_sheet(nowdata, { skipHeader: true });
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.utils.sheet_add_aoa(worksheet, [nowcolumn], { origin: "A1" });
  XLSX.writeFile(workbook, `${name}.xlsx`);
};

// --- API 請求與資料處理 ---
const search = async () => {
  if (!city.value) return errorAlert("請選擇城市");
  if (!item.value) return errorAlert("請選擇區間");
  if (!stationAll.value && selectstationvalue.value.length === 0) return errorAlert("請選擇場站");
  if (category.value.length === 0) return errorAlert("請選擇類型");
  if (!timestamp.value) return errorAlert("請選擇日期");

  try {
    isLoading.value = true;
    const params = {
      dataset_id: "data_analysis",
      table_id: "monthly_empty_full_station",
      date: `${timestamp.value}-01`,
      city: [city.value],
      item: item.value,
      status: category.value,
      station: stationAll.value ? ["all"] : selectstationvalue.value.map(val => parseInt(val.split("-")[0])),
    };

    // 🚀 使用共用 API 發送
    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 💡 🚀 透過迴圈動態整理 31 天的資料，消滅長達 50 行的 hardcode
    const formattedData = resdata.map(element => {
      const row = {
        item1: element.responsible_area ?? "",
        item3: element.s_no ?? "",
        item4: element.s_name ?? "",
        item5: element.s_total ?? 0,
        item6: element.status ?? "",
      };

      // 動態寫入 day1 ~ day31 (對應 item7 ~ item37)
      for (let i = 1; i <= 31; i++) {
        row[`item${i + 6}`] = element[`day${i}`] ?? "";
      }
      
      row.item38 = element.total ?? "";
      return row;
    });

    const fileName = `${item.value === "all_day" ? "全天" : "6-24點"}_見車率統計月報`;
    makeExecl(formattedData, dynamicColumns, fileName);

  } catch (error) {
    console.error("API Error:", error);
    errorAlert("查詢或匯出失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

// 🚀 初始化
onMounted(() => {
  getStationData();
});
</script>

<style scoped></style>