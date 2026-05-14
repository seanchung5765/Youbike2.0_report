<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">客服每日來電詢問內容</h1>
    </div>
    
    <form
      class="d-flex flex-nowrap align-items-center gap-3 mx-0 py-2 px-3 overflow-x-auto"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="d-flex align-items-center">
        <label class="col-form-label fw-bolder me-2 text-nowrap">城市:</label>
        <div style="width: 140px; flex-shrink: 0;">
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇城市"
            filterable
          />
        </div>
      </div>

      <div style="width: 150px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="starttimestamp"
          type="date"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="開始日期"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disablestartDate"
        />
      </div>

      <div style="width: 150px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="endtimestamp"
          type="date"
          :actions="null"
          :input-readonly="true"
          :is-date-disabled="disableEndDate"
          :update-value-on-close="true"
          placeholder="結束日期"
          value-format="yyyy-MM-dd"
        />
      </div>

      <div class="d-flex gap-2 flex-shrink-0">
        <button type="button" class="btn btn-info text-light text-nowrap" @click="cleardate">
          清空日期
        </button>
        <button type="button" class="btn btn-success text-light text-nowrap" @click="search">
          搜尋
        </button>
        <output-excel
          class="btn btn-primary text-light text-nowrap"
          :data="exceldata"
          :name="excelename"
          :header="excelecolumn"
        />
      </div>
    </form>

    <div style="height: calc(100vh - 180px); padding-bottom: 20px;">
      <n-data-table
        v-show="data.length > 0"
        size="small"
        :data="data"
        ref="dataTable"
        :columns="columns"
        :scroll-x="tableScrollX" 
        :bordered="false"
        :single-line="false"
        striped
        :row-class-name="rowClassName"
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
import { NDataTable, NDatePicker, NSelect } from "naive-ui"; 
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

const isLoading = ref(false);
const data = ref([]);
const columns = ref([]);
const dataTable = ref(null);

const city = ref(null);
const starttimestamp = ref(null);
const endtimestamp = ref(null);
const cityConfig = ref([]); 

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// 🌟 自動計算橫向滾軸所需寬度 (前兩欄 300px + 每多一天加 110px)
const tableScrollX = computed(() => {
  return columns.value.length > 0 ? 300 + (columns.value.length - 2) * 110 : 1000;
});

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

const cityOptions = computed(() => {
  if (cityConfig.value.length === 0) return [];
  
  const options = [];
  cityConfig.value.forEach(cityData => {
    if (!cityData.codes) return;
    
    const codes = cityData.codes.split(',').map(c => c.trim());
    const codeV1 = codes.find(c => !c.includes("2")); 
    const codeV2 = codes.find(c => c.endsWith("2"));  
    
    if (codeV2) {
      const validValue = codeV1 || codeV2.replace(/2$/, '');
      options.push({ label: cityData.name, value: validValue });
    }
  });

  return options;
});

const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = nowcolumn.map(item => item.title);
};

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

// --- 日期防呆邏輯 ---
const getMidnightTime = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).setHours(0, 0, 0, 0);
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const disablestartDate = (ts) => {
  const selectedTime = new Date(ts).setHours(0, 0, 0, 0);
  const todayTime = new Date().setHours(0, 0, 0, 0);
  if (selectedTime >= todayTime) return true;

  const endTime = getMidnightTime(endtimestamp.value);
  if (endTime && (selectedTime > endTime || selectedTime < (endTime - THIRTY_DAYS_MS))) {
    return true;
  }
  return false;
};

const disableEndDate = (ts) => {
  const selectedTime = new Date(ts).setHours(0, 0, 0, 0);
  const todayTime = new Date().setHours(0, 0, 0, 0);
  if (selectedTime >= todayTime) return true;

  const startTime = getMidnightTime(starttimestamp.value);
  if (startTime && (selectedTime < startTime || selectedTime > (startTime + THIRTY_DAYS_MS))) {
    return true;
  }
  return false;
};

const convertToYYYYMMDD = (dateString) => {
  const date = new Date(dateString);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
};

// --- 資料與欄位組裝 ---
const processTableData = (resdata) => {
  if (!resdata || resdata.length === 0 || !resdata[0]) {
    columns.value = [];
    data.value = [];
    return;
  }

  // 🌟 設定前兩欄固定在左邊並設定寬度 (維持空白標題)
  const newCols = [
    { key: "item1", align: "center", title: "", fixed: "left", width: 120 }, 
    { key: "item2", align: "center", title: "", fixed: "left", width: 180 },
  ];

  // 🌟 給每天的日期欄位加上固定寬度，確保不會擠在一起
  resdata.forEach((dayData, index) => {
    newCols.push({
      key: `item${index + 3}`,
      align: "center",
      title: convertToYYYYMMDD(dayData[0].date),
      width: 110 // 設定日期欄位寬度
    });
  });

  const currentRules = { 0: 3, 3: 5, 8: 12, 20: 3, 23: 3, 26: 2, 28: 5, 33: 3 };

  newCols[0].rowSpan = (rowData, rowIndex) => currentRules[rowIndex] || 1;

  const newData = resdata[0].map(item => ({
    item1: item.category,
    item2: item.service,
    item3: item.total,
  }));

  for (let i = 1; i < resdata.length; i++) {
    resdata[i].forEach((item, rowIndex) => {
      if (newData[rowIndex]) newData[rowIndex][`item${i + 3}`] = item.total;
    });
  }

  columns.value = newCols;
  data.value = newData;
};

// --- API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "CTI_daily_detail",
      begin_date: starttimestamp.value,
      end_date: endtimestamp.value,
      city: city.value,
      sys: "2.0", 
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    processTableData(resdata);
    makeExecl(data.value, columns.value, `客服來電統計_${city.value}`);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!starttimestamp.value) return NotCityAlert("請選擇開始時間");
  if (!endtimestamp.value) return NotCityAlert("請選擇結束時間");
  
  getData();
};
</script>

<style scoped>
/* 🌟 強制覆蓋單雙數行的背景色，包含固定在左側的欄位 */
:deep(.table-row-white) > td {
  background-color: #ffffff !important;
}

:deep(.table-row-gray) > td {
  background-color: #f4f5f7 !important; /* 舒服的淺灰色 */
}

/* 🌟 滑鼠游標經過時的高亮顏色 */
:deep(.n-data-table-tr:hover) > td {
  background-color: #e6f7ff !important; /* 淺藍色 */
}

/* 🌟 合併儲存格(rowSpan)垂直置中 (讓左邊的大分類字體不會浮在頂端) */
:deep(.n-data-table-td) {
  vertical-align: middle !important;
}
</style>