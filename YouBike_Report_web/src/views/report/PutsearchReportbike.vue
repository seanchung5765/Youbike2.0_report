<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">騎乘次數明細比例</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 180px;">
          <n-select
            v-model:value="city"
            placeholder="請選擇"
            multiple
            :options="cityOptions"
            :max-tag-count="1"
            size="medium"
          />
        </div>
        <button type="button" class="btn btn-sm btn-success text-light" style="white-space: nowrap;" @click="setAllCity">
          全選
        </button>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; margin-left: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">月份:</label>
        <div style="width: 180px;">
          <n-select
            v-model:value="date"
            placeholder="請選擇"
            multiple
            :options="dateOptions"
            :max-tag-count="1"
            size="medium"
          />
        </div>
        <button type="button" class="btn btn-sm btn-success text-light" style="white-space: nowrap;" @click="setAllDate">
          全選
        </button>
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

    <n-data-table
      v-show="data.length > 0"
      ref="dataTable"
      :data="data"
      :columns="column"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="800"
      :bordered="false"
      size="small"
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
// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";
import { getAllCities } from "@/api/admin";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const isLoading = ref(false);
const dataTable = ref(null);
const data = ref([]);
const city = ref([]);
const date = ref([]);

// 🚀 修正：必須使用 ref 才能讓 OutputExcel 按鈕隨時抓到最新的資料
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// --- 🚀 城市選單 (資料庫動態 API 載入，竹科與新竹市自動分離) ---
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];
    
    // 過濾出 active 且有權限的城市 (因為是從資料庫撈，新竹市跟竹科本來就是分開的兩筆資料)
    cityOptions.value = dbCities
      .filter(c => c.status === 'active' && canusecitys.includes(c.city_id))
      .map(c => ({
        label: c.city_name,
        value: c.city_name 
      }));
  } catch (error) {
    console.error("載入縣市失敗:", error);
  }
};

onMounted(() => {
  loadCities();
});

const setAllCity = () => {
  city.value = cityOptions.value.map(c => c.value);
};

// --- 月份選單動態生成 ---
const dateOptions = computed(() => {
  const arr = [];
  const start = new Date(2018, 0, 1); // 2018-01
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1); 

  let current = new Date(start);
  while (current < end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    arr.push({ label: `${y}-${m}`, value: `${y}-${m}` });
    current.setMonth(current.getMonth() + 1);
  }
  
  return arr.reverse(); 
});

const setAllDate = () => {
  date.value = dateOptions.value.map(d => d.value);
};

// --- 表頭定義 ---
const column = [
  { key: "item1", align: "center", fixed: "left", title: "使用次數" },
  { key: "item2", align: "center", title: "未加保卡數" },
  { key: "item3", align: "center", title: "已加保卡數" },
  { key: "item4", align: "center", title: "卡數合計" },
  { key: "item5", align: "center", title: "未加保比例" },
  { key: "item6", align: "center", title: "已加保比例" },
];

// --- 🚀 修正：移除強制下載邏輯，只負責綁定資料給按鈕 ---
const prepareExcel = (nowdata, name) => {
  exceldata.value = [...nowdata];
  excelename.value = name;
  excelecolumn.value = column.map(c => c.title);
};

// 斑馬紋樣式 (#e8e8e8)
const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

// 將 ["2023-05", "2023-06"] 轉為 ["202305", "202306"] 給 GCP
const removeHyphensFromArray = (datesArray) => datesArray.map(date => date.replace(/-/g, ""));

// --- API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "alluse2",
      date: removeHyphensFromArray(date.value),
      city: city.value,
    };

    const res = await getGcpReport(params);
    const saultdata = res.data?.data || [];

    data.value = saultdata.map(i => ({
      item1: i.usetime ?? "",
      item2: i.N ?? 0,
      item3: i.Y ?? 0,
      item4: i.Card_CNT ?? 0,
      item5: i.N_prop ?? "0%",
      item6: i.Y_prop ?? "0%",
    }));

    // 🚀 準備好匯出資料，交給 OutputExcel 組件，不直接觸發下載
    prepareExcel(data.value, "騎乘次數明細比例");

    if (dataTable.value?.page) dataTable.value.page(1);

  } catch (error) {
    console.error("API Error:", error);
    NotAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!city.value.length) return NotAlert("請選擇城市");
  if (!date.value.length) return NotAlert("請選擇月份"); 
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