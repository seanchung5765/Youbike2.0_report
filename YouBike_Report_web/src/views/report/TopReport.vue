<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">TOP50 排名週報</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 180px;">
          <n-select
            v-model:value="cityvalue"
            placeholder="請選擇"
            multiple
            clearable
            :options="cityOptions"
            :max-tag-count="1"
          />
        </div>
        <button type="button" class="btn btn-sm btn-success text-light" style="white-space: nowrap;" @click="setAllCity">全選</button>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">借/還:</label>
        <div style="width: 130px;">
          <n-select
            v-model:value="sendvalue"
            placeholder="請選擇"
            multiple
            :options="sendOptions"
            :max-tag-count="1"
          />
        </div>
      </div>

      <div style="width: 160px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="date"
          placeholder="請選週一"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disableMondayDate"
          update-value-on-close
        />
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
        v-show="data.length > 0"
        size="small"
        ref="dataTableRef"
        :data="data"
        :columns="columns"
        :scroll-x="1200"
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
import { ref, inject, computed, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NSelect, NDatePicker } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";
import { getGcpReport } from "@/api/report";
import { getAllCities } from "@/api/admin";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

const isLoading = ref(false);
const dataTableRef = ref(null);
const timestamp = ref(null);
const data = ref([]);
const cityvalue = ref([]);
const sendvalue = ref([]);

const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

async function errorAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false, timer: 1500 });
}

// --- 🚀 城市選單 (API 動態載入) ---
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];
    const options = [];
    
    dbCities.forEach(c => {
      if (c.status === 'active' && canusecitys.includes(c.city_id)) {
        // 洗乾淨原始代碼，產生 2.0 與 2.0E 組合
        let rawCode = c.codes ? c.codes.split(',')[0].trim() : '';
        let cleanBaseCode = rawCode.replace(/2E$/i, '').replace(/2$/i, '');
        
        options.push({ label: `${c.city_name} 2.0`, value: `${cleanBaseCode}2` });
        options.push({ label: `${c.city_name} 2.0E`, value: `${cleanBaseCode}2E` });
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

const sendOptions = [
  { label: "借", value: "rent" },
  { label: "還", value: "return" }
];

const columns = [
  { key: "item1", align: "center", title: "借/還", width: 80, fixed: "left" },
  { key: "item2", align: "center", title: "城市", width: 100 },
  { key: "item3", align: "center", title: "場站名稱", width: 250 },
  { key: "item4", align: "center", title: "開站時間", width: 120 },
  { key: "item5", align: "center", title: "本週次數", width: 100 },
  { key: "item6", align: "center", title: "本週排名", width: 100 },
  { key: "item7", align: "center", title: "上週次數", width: 100 },
  { key: "item8", align: "center", title: "上週排名", width: 100 },
  { key: "item9", align: "center", title: "成長率", width: 100 },
];

const disableMondayDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentWeekMonday = new Date(todayStart);
  currentWeekMonday.setDate(todayStart.getDate() - (todayStart.getDay() || 7) + 1);

  if (d >= currentWeekMonday) return true;
  if (d.getDay() !== 1) return true;
  if (d.getFullYear() < 2023) return true;
  return false;
};

const setAllCity = () => {
  cityvalue.value = cityOptions.value.map(o => o.value);
};

// 🚀 斑馬紋樣式 (#e8e8e8)
const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

// --- API 請求 ---
const getRankingData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "weekly_rank",
      item: sendvalue.value,
      city: cityvalue.value,
      date: timestamp.value,
    };

    const res = await getGcpReport(params);
    const resList = res.data?.data || [];

    data.value = resList.map(item => ({
      item1: item.item_ch ?? "",
      item2: item.city_ch ?? "",
      item3: item.station_name ?? "",
      item4: item.start_time ?? "",
      item5: item.times_this_week ?? 0,
      item6: item.rank_this_week ?? "",
      item7: item.times_last_week ?? 0,
      item8: item.rank_last_week ?? "",
      item9: item.growth_rate ?? "0%",
    }));

    exceldata.value = [...data.value];
    excelename.value = `Top50_排名週報_${timestamp.value}`;
    excelecolumn.value = columns.map(c => c.title);

  } catch (error) {
    console.error("API Error:", error);
    errorAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!sendvalue.value.length) return errorAlert("請選擇借/還");
  if (!cityvalue.value.length) return errorAlert("請選擇城市");
  if (!timestamp.value) return errorAlert("請選擇日期");
  getRankingData();
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