<template>
  <div class="container-fluid px-0" style="display: flex; flex-direction: column; height: calc(100vh - 60px);">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    
    <div class="flex-shrink-0">
      <div class="row mx-0">
        <h1 class="report-h1 fw-bold">經營日報</h1>
      </div>

      <form
        class="mx-0 py-3 px-3"
        :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
        style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
      >
        <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
          <label class="fw-bolder mb-0" style="white-space: nowrap;">類別:</label>
          <div style="width: 220px;">
            <n-select
              v-model:value="category"
              :options="categoryOptions"
              placeholder="請選擇"
            />
          </div>
        </div>

        <div style="width: 140px; flex-shrink: 0;">
          <n-date-picker
            v-model:formatted-value="timestamp"
            type="date"
            :actions="null"
            :disabled="!category"
            update-value-on-close
            :is-date-disabled="disablePreviousDate"
            placeholder="選擇日期"
            value-format="yyyy-MM-dd"
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
    </div>

    <div class="flex-grow-1 mx-3 mt-3 mb-2" style="min-height: 0;">
      <n-data-table
        v-show="data.length > 0"
        :key="category"
        ref="dataTable"
        size="small"
        :data="data"
        :columns="currentColumns"
        style="height: 100%;"
        flex-height
        :scroll-x="currentScrollX"
        :bordered="false"
        :single-line="false"
        :row-class-name="rowClassName"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
import { getGcpReport } from "@/api/report";

const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false, timer: 1500 });
}

const isLoading = ref(false);
const category = ref(null);
const timestamp = ref(null);
const data = ref([]);
const dataTable = ref(null);

const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// 🚀 動態給予每行 Class (單數行白、雙數行灰)
const rowClassName = (row, index) => {
  return index % 2 === 0 ? "row-white" : "row-gray";
};

const reportConfigs = {
  TurnoverData: {
    label: "上線周轉率排序",
    tableId: "daily_turnover_rank",
    columns: [
      { key: "city", align: "center", fixed: "left", title: "城市", width: 100 },
      { key: "num1", align: "center", title: "騎乘次數" },
      { key: "num2", align: "center", title: "周轉率" },
    ],
    mapData: (row) => ({ city: row.city, num1: row.rent_number, num2: row.turnover })
  },
  TurnoverTaiwanData: {
    label: "實際周轉率排序(台灣)",
    tableId: "daily_turnover_rank_real",
    columns: [
      { key: "city", align: "center", fixed: "left", title: "城市", width: 100 },
      { key: "num1", align: "center", title: "實際營運車輛數" },
      { key: "num2", align: "center", title: "周轉率" },
    ],
    mapData: (row) => ({ city: row.city, num1: row.rent_number, num2: row.turnover })
  },
  TotalData: {
    label: "詳細資訊(台灣)",
    tableId: "daily_summary_Taiwan",
    isRange: true, 
    columns: [
      { key: "city", align: "center", fixed: "left", title: "城市", width: 100 },
      { key: "num1", align: "center", title: "騎乘次數" },
      { key: "num2", align: "center", title: "場站數" },
      { key: "num3", align: "center", title: "上線車輛數" },
      { key: "num4", align: "center", title: "上線周轉率" },
      { key: "num5", align: "center", title: "月累計騎乘次數" },
    ],
    mapData: (row) => ({ 
      city: row.city, 
      num1: row.rent_number, 
      num2: row.current_station, 
      num3: row.bike_number, 
      num4: row.turnover, 
      num5: row.monthly_rent_number 
    })
  }
};

const categoryOptions = Object.keys(reportConfigs).map(key => ({
  label: reportConfigs[key].label,
  value: key
}));

const currentColumns = computed(() => reportConfigs[category.value]?.columns || []);

const currentScrollX = computed(() => {
  const cols = reportConfigs[category.value]?.columns || [];
  return cols.length * 160; 
});

const disablePreviousDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const minDate = new Date("2023-01-01");
  return d < minDate || d > yesterday;
};

const prepareExcel = (nowdata, config) => {
  exceldata.value = [...nowdata];
  excelename.value = config.label;
  excelecolumn.value = config.columns.map(c => c.title);
};

const getData = async () => {
  const config = reportConfigs[category.value];
  if (!config) return;

  try {
    isLoading.value = true;
    data.value = []; 
    
    const params = {
      dataset_id: "founder_report",
      table_id: config.tableId,
      city: ["all"]
    };

    if (config.isRange) {
      params.begin_date = timestamp.value;
      params.end_date = timestamp.value;
    } else {
      params.date = timestamp.value;
    }

    const res = await getGcpReport(params);
    const resData = res.data?.data || [];

    data.value = resData.map(config.mapData);
    prepareExcel(data.value, config);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!category.value) return NotCityAlert("請選擇類別");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  getData();
};
</script>

<style scoped>
:deep(.n-data-table-wrapper) {
  height: 100% !important;
}

/* 🚀 一灰一白的終極 CSS 控制 */
:deep(.row-white td) {
  background-color: #ffffff !important;
}

:deep(.row-gray td) {
  background-color: #f4f6f8 !important; /* 這裡的灰色你可以自己調，目前用的是很舒服的淡灰色 */
}

/* 如果滑鼠移過去想保留 highlight 效果，可以加上這段 (非必填) */
:deep(.n-data-table-tr:hover td) {
  background-color: #e6f7ff !important;
}
</style>