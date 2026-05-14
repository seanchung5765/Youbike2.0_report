<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">YouBike2.0 騎乘時間查詢</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <!-- 系統別 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">系統別:</label>
        <div style="width: 100px;">
          <n-select v-model:value="category" :options="categoryOptions" @update:value="city = null" placeholder="請選擇" />
        </div>
      </div>

      <!-- 城市 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 140px;">
          <n-select v-model:value="city" :options="cityOptions" placeholder="請選擇" :disabled="!category" />
        </div>
      </div>

      <!-- 項目 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">項目:</label>
        <div style="width: 160px;">
          <n-select v-model:value="optionsvalue" multiple :options="itemOptions" :max-tag-count="1" placeholder="請選擇" />
        </div>
      </div>

      <!-- 日期區間 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <div style="width: 140px;">
          <n-date-picker v-model:formatted-value="starttimestamp" type="date" value-format="yyyy-MM-dd" placeholder="開始日期" :is-date-disabled="disableStartDate" clearable />
        </div>
        <span class="fw-bold">至</span>
        <div style="width: 140px;">
          <n-date-picker v-model:formatted-value="endtimestamp" type="date" value-format="yyyy-MM-dd" placeholder="結束日期" :is-date-disabled="disableEndDate" clearable />
        </div>
      </div>

      <!-- 按鈕群組 -->
      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-info text-light" style="white-space: nowrap;" @click="cleardate">清空日期</button>
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
      v-show="data.length > 0"
      ref="dataTable"
      size="small"
      :data="data"
      :columns="columnDefs"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="800"
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
const category = ref(null);
const city = ref(null);
const optionsvalue = ref([]);
const starttimestamp = ref(null);
const endtimestamp = ref(null);
const data = ref([]);
const dataTable = ref(null);

// 🚀 Excel 響應式變數
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// --- 🚀 選單選項 (資料驅動) ---
const categoryOptions = [
  { label: "2.0", value: "2.0" },
  { label: "2.0E", value: "2.0E" }
];

const itemOptions = [
  { label: "同站借還", value: "同站借還" },
  { label: "跨站借還", value: "跨站借還" }
];

const cityOptions = computed(() => {
  if (!category.value) return [];
  const map = [
    { label: "台北市", value: "台北市", auth: 2 }, { label: "新北市", value: "新北市", auth: 3 },
    { label: "桃園市", value: "桃園市", auth: 4 }, { label: "新竹市", value: "新竹市", auth: 5 },
    { label: "新竹縣", value: "新竹縣", auth: 6 }, { label: "竹科", value: "竹科", auth: 20 },
    { label: "苗栗縣", value: "苗栗縣", auth: 7 }, { label: "台中市", value: "台中市", auth: 8 },
    { label: "嘉義市", value: "嘉義市", auth: 12 }, { label: "嘉義縣", value: "嘉義縣", auth: 13 },
    { label: "台南市", value: "台南市", auth: 14 }, { label: "高雄市", value: "高雄市", auth: 15 },
    { label: "屏東縣", value: "屏東縣", auth: 16 }, { label: "台東縣", value: "台東縣", auth: 19 }
  ];
  return map.filter(c => canusecitys.includes(c.auth));
});

// --- 表頭定義 ---
const columnDefs = [
  { key: "num1", align: "center", fixed: "left", width: 100, title: "縣市" },
  { key: "num2", align: "center", title: "鄉鎮市區" },
  { key: "num3", align: "center", title: "同站／跨站" },
  { key: "num4", align: "center", title: "費率別" },
  { key: "num5", align: "center", title: "騎乘時間" },
  { key: "num6", align: "center", title: "次數" },
];

// --- 🚀 日期防呆 (限制 30 天) ---
const MIN_DATE = new Date(2023, 0, 1).getTime();
const getTodayStart = () => new Date().setHours(0, 0, 0, 0);

const disableStartDate = (ts) => ts < MIN_DATE || ts >= getTodayStart() || (endtimestamp.value && (ts > new Date(endtimestamp.value).getTime() || ts < new Date(endtimestamp.value).getTime() - 30 * 86400000));
const disableEndDate = (ts) => ts < MIN_DATE || ts >= getTodayStart() || (starttimestamp.value && (ts < new Date(starttimestamp.value).getTime() || ts > new Date(starttimestamp.value).getTime() + 30 * 86400000));

const cleardate = () => { starttimestamp.value = null; endtimestamp.value = null; };

// --- 🚀 API 請求與資料處理 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "rent_minute_report2",
      begin_date: starttimestamp.value,
      end_date: endtimestamp.value,
      city: `${city.value}${category.value}`,
      item: optionsvalue.value,
    };

    const res = await getGcpReport(params);
    const rawData = res.data?.data || [];

    // 🚀 資料合併與轉換邏輯 (Grouping)
    const processed = [];
    rawData.forEach((element) => {
      const last = processed[processed.length - 1];
      
      // 判斷是否與上一筆相同 (需要合併次數)
      const isSameGroup = last && 
        last.num2 === element.SxPSArea && 
        last.num3 === element.same_station && 
        last.num4 === element.rate_info && 
        last.num5 === element.rent_minute;

      if (isSameGroup) {
        last.num6 += element.times;
      } else {
        processed.push({
          num1: element.city ?? "",
          num2: element.SxPSArea ?? "",
          num3: element.same_station ?? "",
          num4: element.rate_info ?? "",
          num5: element.rent_minute ?? "",
          num6: element.times ?? 0,
        });
      }
    });

    data.value = processed;
    
    // 更新 Excel
    exceldata.value = [...processed];
    excelename.value = "yb2騎乘時間查詢";
    excelecolumn.value = columnDefs.map(c => c.title);

    if (dataTable.value?.page) dataTable.value.page(1);

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
  if (!optionsvalue.value.length) return NotCityAlert("請選擇項目");
  if (!starttimestamp.value || !endtimestamp.value) return NotCityAlert("請選擇完整日期區間");
  getData();
};
</script>