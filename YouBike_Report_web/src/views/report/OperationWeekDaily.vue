<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">營運管理週報</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">系統別:</label>
        <div style="width: 120px;">
          <n-select
            v-model:value="category"
            :options="sysOptions"
            @update:value="city = null"
            placeholder="請選擇"
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 140px;">
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇"
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
          placeholder="請選每週一日期"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disablestartDate"
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
          :data="totaldata"
          :name="excelName"
          :header="excelHeaders"
        />
      </div>
    </form>

    <div style="height: calc(100vh - 180px); padding-bottom: 10px; margin-top: 10px;">
      <n-data-table
        v-show="totaldata.length > 0 && totaldata[0].item1"
        ref="dataTable"
        size="small"
        :row-class-name="rowClassName"
        :pagination="{ pageSize: 100 }"
        :columns="columns"
        :data="totaldata"
        :scroll-x="1200"
        :bordered="false"
        :single-line="false"
        striped
        flex-height
        style="height: 100%;"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { useUserStore } from "../../stores/userdata";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
import { getGcpReport } from "@/api/report";
// 🚀 引入 API
import { getAllCities } from "@/api/admin";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false, timer: 1500 });
}

// --- 狀態管理 ---
const isLoading = ref(false);
const category = ref(null);
const city = ref(null);
const timestamp = ref(null);
const totaldata = ref([]);
const columns = ref([]);
const excelName = ref("營運管理週報");

// --- 🚀 計算屬性：自動從 columns 中取出標題作為 Excel 表頭 ---
const excelHeaders = computed(() => {
  return columns.value.map(col => col.title);
});

// --- 🚀 選項定義 (移除 1.0) ---
const sysOptions = [
  { label: "2.0", value: "2" },
  { label: "2.0E", value: "2E" },
];

// --- 🚀 城市選單 (資料庫動態撈取) ---
const dbCities = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const data = res.data.data || [];
    dbCities.value = data.filter(c => c.status === 'active' && canusecitys.includes(c.city_id));
  } catch (error) {
    console.error("載入縣市失敗:", error);
  }
};

const cityOptions = computed(() => {
  if (!category.value) return [];
  const suffix = category.value === "2" ? "2" : "2E";

  return dbCities.value.map(c => {
    // 正則表達式洗乾淨：還原 BaseCode 再加上字尾
    let rawCode = c.codes ? c.codes.split(',')[0].trim() : '';
    let cleanBaseCode = rawCode.replace(/2E$/i, '').replace(/2$/i, '');
    
    return {
      label: c.city_name,
      value: cleanBaseCode + suffix
    };
  }).filter(c => c.value !== '2' && c.value !== '2E');
});

onMounted(() => {
  loadCities();
});

// --- 日期限制 ---
const disablestartDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() - (today.getDay() || 7) + 1);
  if (d >= currentWeekMonday) return true;
  if (d.getDay() !== 1) return true;
  if (d.getFullYear() < 2023) return true;
  return false;
};

// --- 資料矩陣處理 ---
const processMatrixData = (rawData) => {
  if (!rawData || rawData.length === 0) {
    columns.value = [];
    totaldata.value = [];
    return;
  }

  const reorderedData = rawData.filter((_, index) => index !== 4);
  if (rawData[4]) reorderedData.push(rawData[4]);

  columns.value = reorderedData.map((colData, index) => {
    const colDef = {
      key: `item${index + 1}`,
      align: "center",
      title: colData[2] ?? `欄位${index + 1}`
    };
    if (index === 0) {
      colDef.fixed = "left";
      colDef.width = 180;
    }
    return colDef;
  });

  const rowCount = reorderedData[0].length;
  const rows = [];
  for (let rowIndex = 3; rowIndex < rowCount; rowIndex++) {
    const rowObj = {};
    reorderedData.forEach((colData, colIndex) => {
      rowObj[`item${colIndex + 1}`] = colData[rowIndex] ?? "";
    });
    rows.push(rowObj);
  }
  totaldata.value = rows;
};

// --- API 請求 ---
const getdata = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: `weekly_report_query${category.value}`,
      date: timestamp.value,
      // 🚀 兇手就是這裡！週報的後端嚴格要求必須傳陣列，所以要把中括號加回來！
      city: [city.value], 
    };

    const res = await getGcpReport(params);
    const rawMatrixData = res.data?.data?.[0] || [];
    
    if (rawMatrixData.length === 0) {
      totaldata.value = [];
      NotCityAlert("該區間查無資料");
      return;
    }

    processMatrixData(rawMatrixData);
    excelName.value = `${category.value === '2' ? '2.0' : '2.0E'}_營運管理週報`;

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = async () => {
  if (!category.value) return NotCityAlert("請選擇系統別");
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  await getdata();
};

// --- 🚀 斑馬紋與高亮樣式判斷 ---
const rowClassName = (row, index) => {
  const highlightItems = [
    "場站資訊", "租借資訊", "收入資訊", "妥善率資訊", "票卡資訊",
    "當週租借車次", "各時段使用資訊", "租賃收入明細", "租賃時間使用資訊",
    "維護管理", "調度管理", "營運資訊", "騎乘距離分析", "當日租借車次"
  ];
  if (
    highlightItems.includes(row.item1) ||
    (row.item1 === "註冊票卡淨增加數" && !row.item2) ||
    (row.item1 === "當週/日租借車次" && !row.item2)
  ) {
    return "too-old";
  }
  return index % 2 === 1 ? 'gray-row' : '';
};
</script>

<style scoped>
/* 🚀 大標題高亮樣式 */
:deep(.too-old td) {
  background-color: rgba(225, 232, 23, 0.75) !important;
  font-weight: bold;
}

/* 🚀 灰色行的背景顏色 (#e8e8e8) */
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

/* 滑鼠經過高亮 */
:deep(.n-data-table .n-data-table-tr.gray-row:hover td) {
  background-color: #d1d1d1 !important;
}
:deep(.n-data-table .n-data-table-tr.too-old:hover td) {
  background-color: rgba(225, 232, 23, 0.9) !important;
}
</style>