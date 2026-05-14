<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">欠費統計 (金額區分)</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <div style="width: 130px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="year"
          :actions="null"
          clearable
          placeholder="選擇年份"
          value-format="yyyy"
          :is-date-disabled="disablePreviousDate"
        />
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 150px;">
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇"
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
          :data="data"
          :name="excelName"
          :header="excelHeaders"
        />
      </div>
    </form>

    <n-data-table
      v-show="data.length > 0"
      ref="dataTableRef"
      size="small"
      :data="data"
      :columns="currentColumns"
      :pagination="{ pageSize: 25 }" 
      :max-height="600"
      :scroll-x="1200"
      :bordered="false"
      :single-line="false"
      striped
      :row-class-name="rowClassName"
    />
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from "vue";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import OutputExcel from "../../components/OutputExcel.vue";
import { useUserStore } from "../../stores/userdata";
import { getCityList } from "@/api/station";
import { getGcpReport } from "@/api/report";

const swal = inject("$swal");
const ischange = inject("ischange");
const store = useUserStore();
const canusecitys = store.citys || [];

const NotCityAlert = (text) => swal({ icon: "error", title: text, showConfirmButton: false });

// --- 狀態管理 ---
const isLoading = ref(false);
const dataTableRef = ref(null);
const city = ref(null);
const timestamp = ref(null);
const data = ref([]);
const excelName = ref("欠費統計");
const cityConfig = ref([]); 

// --- 初始化載入縣市設定 ---
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

// 🌟 修改：動態產生縣市下拉選單 (不再區分 2.0 / 2.0E)
const cityOptions = computed(() => {
  if (cityConfig.value.length === 0) return [];

  const options = [];
  cityConfig.value.forEach(cityData => {
    if (!cityData.codes) return;

    const codes = cityData.codes.split(',').map(c => c.trim());
    const code2 = codes.find(c => c.endsWith("2"));
    
    // 只要有 2.0 的城市，就直接顯示乾淨的城市名稱 (例如：台北市)
    if (code2) {
      options.push({ label: cityData.name, value: code2 });
    }
  });

  return options;
});

// --- 輔助函式 ---
const disablePreviousDate = (ts) => {
  const selectedYear = new Date(ts).getFullYear();
  const currentYear = new Date().getFullYear();
  return selectedYear < 2013 || selectedYear > currentYear;
};

// 🌟 新增：表格斑馬紋邏輯 (單數白、雙數灰)
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// 🌟 修改：直接寫死 2.0 版本需要的欄位，刪除冗餘判斷
const currentColumns = [
  { key: "num1", align: "center", fixed: "left", title: "欠費級距(元)", width: 160 },
  { key: "num2", align: "center", title: "特殊筆數" },
  { key: "num3", align: "center", title: "特殊欠款" },
  { key: "num4", align: "center", title: "特殊狀況筆數" },
  { key: "num5", align: "center", title: "特殊狀況欠款" },
  { key: "num6", align: "center", title: "市府應收款(10元)" },
  { key: "num7", align: "center", title: "市府應收款(5元)" },
  { key: "num8", align: "center", title: "市府應收款(2元)" },
  { key: "num9", align: "center", title: "合計市府應收款" },
  { key: "num10", align: "center", title: "合計欠費" },
];

const excelHeaders = computed(() => currentColumns.map(col => col.title));

const amtRangeMap = [
  "0", "5", "10", "15", "20", "25", "30", "35", "40", "45", "50",
  "55-100", "105-200", "205-500", "505-1000", "1005-5000", "5005-9995",
  "9999以上", "臺大專區(200元以下)", "臺大專區(201元以上)", "總計"
];

// --- 取得資料 ---
const getData = async () => {
  try {
    isLoading.value = true;
    
    // 🌟 修改：直接將 table_id 綁定為 arrearsall_report2
    const params = {
      dataset_id: "data_analysis",
      year: timestamp.value,
      city: city.value,
      table_id: "arrearsall_report2" 
    };

    const res = await getGcpReport(params);
    const resData = res.data?.data || [];

    data.value = resData.map((el) => {
      return {
        num1: amtRangeMap[el.amt_range] || "未知級距",
        num2: el.CNT_real ?? 0,
        num3: el.Total_real ?? 0,
        num4: el.CNT_special ?? 0,
        num5: el.Total_special ?? 0,
        num6: el.gov10 ?? 0,
        num7: el.gov5 ?? 0,
        num8: el.gov2 ?? 0,
        num9: el.gov ?? 0,
        num10: el.total_arrearsall ?? 0
      };
    });

    excelName.value = `欠費統計_${city.value}_${timestamp.value}`;
    if (dataTableRef.value?.page) dataTableRef.value.page(1);

  } catch (error) {
    console.error(error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!timestamp.value) return NotCityAlert("請選擇年份");
  if (!city.value) return NotCityAlert("請選擇城市");
  getData();
};
</script>

<style scoped>
/* 🌟 強制覆蓋單雙數行的背景色，包含固定在左側的欄位 */
:deep(.table-row-white) > td {
  background-color: #ffffff !important;
}

:deep(.table-row-gray) > td {
  background-color: #e8e8e8 !important; /* 舒服的淺灰色 */
}

/* 🌟 滑鼠游標經過時的高亮顏色 */
:deep(.n-data-table-tr:hover) > td {
  background-color: #e6f7ff !important; /* 淺藍色 */
}
</style>