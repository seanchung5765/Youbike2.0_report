<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">調度週報</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">表別:</label>
        <div style="width: 130px;">
          <n-select v-model:value="type" :options="typeOptions" placeholder="請選擇" />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 140px;">
          <n-select v-model:value="city" :options="cityOptions" placeholder="請選擇" />
        </div>
      </div>

      <div style="width: 140px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="請選週一"
          :is-date-disabled="disableMondayDate"
          update-value-on-close
        />
      </div>

      <div v-if="type === '調度排名週報'" style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">項目:</label>
        <div style="width: 200px;">
          <n-select v-model:value="item" :options="itemOptions" placeholder="請選擇" />
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
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

    <div style="height: calc(100vh - 180px); padding-bottom: 10px; margin-top: 10px;">
      <n-data-table
        v-show="datatable.length > 0"
        size="small"
        ref="dataTableRef"
        :data="datatable"
        :columns="columns"
        :row-class-name="rowClassName"
        :max-height="600"
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
import { ref, inject, computed, watch, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { useUserStore } from "../../stores/userdata";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
import { getGcpReport } from "@/api/report";
import { getAllCities } from "@/api/admin";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false, timer: 1500 });
}

const isLoading = ref(false);
const type = ref("調度週報"); // 預設值
const city = ref(null);
const timestamp = ref(null);
const item = ref(null);
const datatable = ref([]);
const columns = ref([]);

const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// --- 選項資料 ---
const typeOptions = [
  { label: "調度週報", value: "調度週報" },
  { label: "調度排名週報", value: "調度排名週報" }
];

const itemOptions = [
  { label: "無位可還5分鐘以上次數", value: "無位可還5分鐘以上次數" },
  { label: "無位可還10分鐘以上次數", value: "無位可還10分鐘以上次數" },
  { label: "無車可借10分鐘以上次數", value: "無車可借10分鐘以上次數" },
  { label: "無車綁車10分鐘以上次數", value: "無車綁車10分鐘以上次數" }
];

// --- 🚀 城市選單 (API 動態載入) ---
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];
    const options = [];

    // 增加「雙北」合併選項邏輯
    if (canusecitys.includes(2) && canusecitys.includes(3)) {
      options.push({ label: "雙北", value: "TaipeiNewtaipei2" });
    }

    dbCities.forEach(c => {
      if (c.status === 'active' && canusecitys.includes(c.city_id)) {
        let rawCode = c.codes ? c.codes.split(',')[0].trim() : '';
        let cleanBaseCode = rawCode.replace(/2E$/i, '').replace(/2$/i, '');
        options.push({ label: c.city_name, value: cleanBaseCode + '2' });
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

// --- 日期防呆 ---
const disableMondayDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentWeekMonday = new Date(todayStart);
  currentWeekMonday.setDate(todayStart.getDate() - (todayStart.getDay() || 7) + 1);

  if (d >= currentWeekMonday) return true; 
  if (d.getDay() !== 1) return true; 
  const limitDate = type.value === "調度週報" ? new Date(2023, 8, 4) : new Date(2023, 8, 11);
  return d < limitDate;
};

// --- 🚀 處理一般週報 ---
const processWeeklyMatrix = (rawData) => {
  if (!rawData?.length) return;
  
  columns.value = rawData.map((col, idx) => ({
    key: `item${idx + 1}`,
    align: "center",
    title: col[2] ?? "",
    fixed: idx === 0 ? "left" : undefined,
    width: idx === 0 ? 180 : 120
  }));

  const rows = [];
  const dataLen = rawData[0].length;
  for (let r = 3; r < dataLen; r++) {
    const rowObj = {};
    rawData.forEach((col, cIdx) => { rowObj[`item${cIdx + 1}`] = col[r] ?? ""; });
    rows.push(rowObj);

    // 插入分類標題
    if (rowObj.item1 === "溫度") rows.push({ item1: "基本資訊" });
    else if (rowObj.item1 === "週/日達成率") rows.push({ item1: "無位可還" });
    else if (rowObj.item1 === "10分鐘無位可還每萬次發生率") rows.push({ item1: "無車可借" });
  }
  datatable.value = rows;
};

// --- 🚀 處理排名週報 ---
const processRankData = (rawData) => {
  columns.value = [
    { key: "item1", align: "center", title: "排名", width: 80 },
    { key: "item2", align: "center", title: "場站名稱", width: 250 },
    { key: "item3", align: "center", title: "分區", width: 150 },
    { key: "item4", align: "center", title: "次數", width: 100 },
    { key: "item5", align: "center", title: "上週次數", width: 100 }
  ];
  datatable.value = rawData.map(i => ({
    item1: i.rank,
    item2: i.station_name,
    item3: i.responsible_area,
    item4: i.times,
    item5: i.times_last_week
  }));
};

// --- API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const isBasic = type.value === "調度週報";
    const params = {
      dataset_id: "report",
      // 🚀 系統別拿掉，統一固定使用 2 系列
      table_id: isBasic ? 'weekly_report_maintain_query2' : 'weekly_report_maintain_rank2',
      date: timestamp.value,
      city: city.value
    };
    if (!isBasic) params.item = [item.value];

    const res = await getGcpReport(params);
    const resData = res.data?.data || [];

    if (isBasic) processWeeklyMatrix(resData);
    else processRankData(resData);

    exceldata.value = [...datatable.value];
    excelename.value = type.value;
    excelecolumn.value = columns.value.map(c => c.title);

  } catch (error) {
    console.error(error);
    NotCityAlert("查詢失敗");
  } finally {
    isLoading.value = false;
  }
};

watch(type, () => { timestamp.value = null; datatable.value = []; });

// --- 🚀 斑馬紋與分類高亮 ---
const rowClassName = (row, index) => {
  const dividers = ["基本資訊", "無位可還", "無車可借"];
  if (dividers.includes(row.item1)) return "too-old";
  return index % 2 === 1 ? 'gray-row' : '';
};

const search = () => {
  if (!type.value) return NotCityAlert("請選擇表別");
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  if (type.value === "調度排名週報" && !item.value) return NotCityAlert("請選擇項目");
  getData();
};
</script>

<style scoped>
/* 🚀 灰色行的背景顏色 (#e8e8e8) */
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

/* 🚀 分類標題高亮 */
:deep(.too-old td) {
  background-color: rgba(225, 232, 23, 0.75) !important;
  font-weight: bold;
}

/* 滑鼠經過高亮 */
:deep(.n-data-table .n-data-table-tr.gray-row:hover td) {
  background-color: #d1d1d1 !important;
}
</style>