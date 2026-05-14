<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">欠費統計(年度區分)</h1>
    </div>
    
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
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
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="1000"
      :bordered="false"
      :single-line="false"
      striped
      :row-class-name="rowClassName"
    />
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
import { useUserStore } from "../../stores/userdata";
import { getCityList } from "@/api/station";
import { getGcpReport } from "@/api/report";

const ischange = inject("ischange");
const swal = inject("$swal");
const store = useUserStore();
const canusecitys = store.citys || [];

const NotCityAlert = (text) => {
  swal({ icon: "error", title: text, showConfirmButton: false });
};

// --- 狀態管理 ---
const isLoading = ref(false);
const dataTableRef = ref(null);
const city = ref(null);
const data = ref([]);
const excelName = ref("欠費統計(年度區分)");
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

// 🌟 修改：動態產生乾淨的縣市下拉選單
const cityOptions = computed(() => {
  if (cityConfig.value.length === 0) return [];

  const options = [];
  cityConfig.value.forEach(cityData => {
    if (!cityData.codes) return;

    const codes = cityData.codes.split(',').map(c => c.trim());
    const code2 = codes.find(c => c.endsWith("2"));
    
    if (code2) {
      options.push({ label: cityData.name, value: code2 });
    }
  });

  return options;
});

// 🌟 新增：表格斑馬紋邏輯
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// 🌟 修改：直接寫死 2.0 版本的欄位，移除 1.0 的判斷
const currentColumns = [
  { key: "num1", align: "center", fixed: "left", title: "欠費年度", width: 100 },
  { key: "num2", align: "center", title: "全部筆數" },
  { key: "num3", align: "center", title: "全部欠款" },
  { key: "num4", align: "center", title: "特殊狀況筆數" },
  { key: "num5", align: "center", title: "特殊狀況欠款" },
  { key: "num6", align: "center", title: "真實筆數" },
  { key: "num7", align: "center", title: "真實欠款" },
  { key: "num8", align: "center", title: "市府應收款(10元)" },
  { key: "num9", align: "center", title: "市府應收款(5元)" },
  { key: "num10", align: "center", title: "市府應收款(2元)" },
  { key: "num11", align: "center", title: "合計市府應收款" },
  { key: "num12", align: "center", title: "合計欠費" },
];

const excelHeaders = computed(() => currentColumns.map(col => col.title));

// --- 取得資料 ---
const getData = async () => {
  try {
    isLoading.value = true;
    data.value = [];

    // 🌟 修改：直接強制對接 2.0 報表 table_id
    const params = {
      dataset_id: "data_analysis",
      city: city.value,
      table_id: "arrearsall_report2"
    };

    const res = await getGcpReport(params);
    if (!res.data?.data) return;

    // 🌟 修改：直接組合 2.0 的資料，移除 if/else
    data.value = res.data.data.map((element) => ({
      num1: element.NYear,
      num2: element.CNT_all ?? 0,
      num3: element.Total_all ?? 0,
      num4: element.CNT_special ?? 0,
      num5: element.Total_special ?? 0,
      num6: element.CNT_real ?? 0,
      num7: element.Total_real ?? 0,
      num8: element.gov10 ?? 0,
      num9: element.gov5 ?? 0,
      num10: element.gov2 ?? 0,
      num11: element.gov ?? 0,
      num12: element.total_arrearsall ?? 0,
    }));

    excelName.value = `欠費統計(年度區分)_${city.value}`;

    if (dataTableRef.value?.page) dataTableRef.value.page(1);

  } catch (error) {
    console.error(error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
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