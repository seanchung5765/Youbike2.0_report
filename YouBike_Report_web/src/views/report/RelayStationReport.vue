<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">友愛接力場站明細</h1>
    </div>

    <form
      @submit.prevent
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 6px;">
        <span class="text-danger fw-bold">*</span>
        <label class="fw-bolder mb-0" style="white-space: nowrap;">縣市:</label>
        <div style="width: 140px;">
          <n-select 
            v-model:value="cityValue" 
            :options="cityOptions" 
            placeholder="請選擇..." 
            clearable 
          />
        </div>
      </div>

      <!-- 🚀 拆分成兩個獨立的日期選擇器 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <span class="text-danger fw-bold">*</span>
        <label class="fw-bolder mb-0" style="white-space: nowrap;">查詢區間:</label>
        <div style="width: 140px;">
          <n-date-picker
            v-model:formatted-value="begin_time"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="開始日期"
            :is-date-disabled="disableStartDate"
            clearable
          />
        </div>
        <span class="fw-bold">至</span>
        <div style="width: 140px;">
          <n-date-picker
            v-model:formatted-value="end_time"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="結束日期"
            :is-date-disabled="disableEndDate"
            clearable
          />
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-info text-light fw-bold" style="white-space: nowrap;" @click="clearForm">清空</button>
        <button type="button" class="btn btn-success text-light fw-bold" style="white-space: nowrap;" @click="search">搜尋</button>
        <output-excel
          class="btn btn-primary text-light fw-bold"
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
          :max-height="2000"
          :bordered="false"
          :single-line="false"
          striped
          flex-height
          :scroll-x="1400" 
          :pagination="{ pageSize: 100 }"  style="height: 100%;"
          :class="{ 'dark-mode-table': ischange }"
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
import OutputExcel from "../../components/OutputExcel.vue";
import { useUserStore } from "../../stores/userdata";

// 引入 API
import { getCityList } from "@/api/station";
import { getRelayStationReport } from "@/api/report"; 

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

const isLoading = ref(false);
const cityValue = ref(null); 
const begin_time = ref(null); // 🚀 獨立的開始時間
const end_time = ref(null);   // 🚀 獨立的結束時間
const cityConfig = ref([]);

const datatable = ref([]);
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

const columns = ref([
  { key: "item1", align: "center", title: "日期", width: 120 }, 
  { key: "item2", align: "center", title: "縣市", width: 100 }, 
  { key: "item3", align: "center", title: "行政區", width: 120 },
  { key: "item4", align: "center", title: "場站名稱", minWidth: 200 },
  { key: "item5", align: "center", title: "柱位數", width: 100 },
  { key: "item6", align: "center", title: "滿借券數", width: 100 },
  { key: "item7", align: "center", title: "還車次數", width: 100 },
  { key: "item8", align: "center", title: "見位率", width: 100 },
  { key: "item9", align: "center", title: "空還券數", width: 100 },
  { key: "item10", align: "center", title: "借車次數", width: 100 },
  { key: "item11", align: "center", title: "見車率", width: 100 }
]);

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
    if (!cityData.name) return;
    options.push({ 
      label: cityData.name, 
      value: cityData.name 
    });
  });

  const uniqueOptions = Array.from(new Set(options.map(a => a.value)))
    .map(name => { return options.find(a => a.value === name) });
    
  return uniqueOptions;
});

// --- 🚀 日期防呆控制 ---
const getTodayStart = () => new Date().setHours(0, 0, 0, 0);

const getMidnightTime = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr.replace(/-/g, '/')).setHours(0, 0, 0, 0);
};

const disableStartDate = (ts) => {
  // 1. 不包含今日，大於等於今天的一律鎖住
  if (ts >= getTodayStart()) return true;
  
  const endTs = getMidnightTime(end_time.value);
  if (endTs) {
    // 2. 開始日期不能大於結束日期，且往回推不能超過 30 天
    if (ts > endTs || ts < endTs - 30 * 86400000) {
      return true;
    }
  }
  return false;
};

const disableEndDate = (ts) => {
  // 1. 不包含今日，大於等於今天的一律鎖住
  if (ts >= getTodayStart()) return true;
  
  const startTs = getMidnightTime(begin_time.value);
  if (startTs) {
    // 2. 結束日期不能小於開始日期，且往後推不能超過 30 天
    if (ts < startTs || ts > startTs + 30 * 86400000) {
      return true;
    }
  }
  return false;
};

const clearForm = () => {
  cityValue.value = null;
  begin_time.value = null;
  end_time.value = null;
  datatable.value = [];
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  // 防呆：如果解析失敗，就回傳原本的字串
  if (isNaN(date.getTime())) return dateStr; 
  
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'row-even' : 'row-odd';
};

// --- API 請求 ---
const search = async () => {
  if (!cityValue.value) {
    return swal({ icon: "warning", title: "請選擇縣市", showConfirmButton: false, timer: 1500 });
  }
  // 🚀 檢查兩個日期是否都有填寫
  if (!begin_time.value || !end_time.value) {
    return swal({ icon: "warning", title: "請選擇完整查詢區間", showConfirmButton: false, timer: 1500 });
  }

  try {
    isLoading.value = true;
    
    const params = {
      report_name: '友愛接力場站明細',
      city: cityValue.value,
      begin_time: begin_time.value,
      end_time: end_time.value
    };

    const res = await getRelayStationReport(params);
    const resData = res.data?.data || res.data || []; 

    let mappedData = resData.map((item) => ({
      item1: formatDate(item['日期']),
      item2: item['縣市'] || '',
      item3: item['行政區'] || '',
      item4: item['場站名稱'] || '',
      item5: item['柱位數'] || '',
      item6: item['滿借券數'] || '',
      item7: item['還車次數'] || '',
      item8: item['見位率'] || '',
      item9: item['空還券數'] || '',
      item10: item['借車次數'] || '',
      item11: item['見車率'] || ''
    }));

    datatable.value = mappedData;

    exceldata.value = mappedData.map((row) => {
      const cleanRow = {};
      columns.value.forEach((col) => {
        cleanRow[col.title] = row[col.key]; 
      });
      return cleanRow;
    });

    excelename.value = `友愛接力場站明細_${cityValue.value}_${begin_time.value}至${end_time.value}`;
    excelecolumn.value = columns.value.map(c => c.title);

    if (datatable.value.length === 0) {
       swal({ icon: "info", title: "查無明細資料", showConfirmButton: false, timer: 1500 });
    }

  } catch (error) {
    console.error("API 查詢失敗完整錯誤:", error);
    if (error.response && error.response.status === 404) {
      swal({ icon: "error", title: "找不到 API 路由", text: "請確認 Node.js 後端是否有重啟！", showConfirmButton: true });
    } else {
      swal({ icon: "error", title: "查詢失敗，請確認連線", showConfirmButton: false, timer: 1500 });
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
:deep(.n-data-table-td) {
  white-space: normal !important; 
  word-break: break-word;        
}

:deep(.row-even td) {
  background-color: #ffffff !important;
}

:deep(.row-odd td) {
  background-color: #f9f9f9 !important;
}

:deep(.n-data-table-tr:hover td) {
  background-color: #e6f7ff !important; 
}

:deep(.dark-mode-table .row-even td) {
  background-color: #18181c !important; 
}
:deep(.dark-mode-table .row-odd td) {
  background-color: #2c2c32 !important; 
}
:deep(.dark-mode-table .n-data-table-tr:hover td) {
  background-color: #3b3b45 !important; 
}
</style>