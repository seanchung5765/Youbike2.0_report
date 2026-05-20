<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">擋柱綁車</h1>
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
          v-model:formatted-value="startDate"
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
          v-model:formatted-value="endDate"
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
        <button type="button" class="btn btn-info text-light text-nowrap" @click="clearDate">
          清空日期
        </button>
        <button type="button" class="btn btn-success text-light text-nowrap" @click="searchData">
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
        v-show="dataList.length > 0"
        size="small"
        :data="dataList"
        ref="dataTable"
        :columns="columns"
        :scroll-x="2200" 
        :bordered="false"
        :single-line="false"
        striped
        :row-class-name="rowClassName"
        flex-height
        style="height: 100%;"
      />

      <div v-show="dataList.length === 0" class="d-flex flex-column justify-content-center align-items-center bg-white" style="height: 100%;">
        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style="width: 60px; height: 60px;">
          <i class="bi bi-info-lg" style="font-size: 2rem;"></i>
        </div>
        <h4 class="fw-bold text-dark">請選擇城市與日期範圍後，點擊「搜尋」</h4>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NDatePicker, NSelect } from "naive-ui"; 
import OutputExcel from "@/components/OutputExcel.vue";
import { useUserStore } from "@/stores/userdata";

// 🚀 換回最原始正確的 API，確保抓得到城市
import { getAllCities } from "@/api/admin";
import { getGcpReport } from "@/api/report";

const ischange = inject("ischange");
const swal = inject("$swal");
const store = useUserStore();
const canusecitys = store.citys || [];

const NotCityAlert = (text) => {
  swal({ icon: "error", title: text, showConfirmButton: false, timer: 1500 });
};

const isLoading = ref(false);
const dataList = ref([]);
const columns = ref([]);
const dataTable = ref(null);

const city = ref(null);
const startDate = ref(null);
const endDate = ref(null);
const cityConfig = ref([]); 

const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

const formatHeader = (key) => {
  const dict = { date: '日期', country_name: '縣市', s_no: '場站代號', s_name: '場站名稱', area_name: '責任區' };
  return dict[key] || key; 
};

// 🚀 完全復原：老老實實拿 city_id 篩選
const loadCities = async () => {
  try {
    const res = await getAllCities();
    const allCitiesFromDB = res.data.data || [];
    cityConfig.value = allCitiesFromDB.filter(c => c.status === 'active' && canusecitys.includes(c.city_id));
  } catch (error) {
    console.error("載入縣市清單失敗", error);
  }
};

onMounted(() => {
  const today = new Date();
  const formatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  startDate.value = formatted;
  endDate.value = formatted;
  loadCities();
});

// 🚀 完全復原：直接回傳中文，不亂改英文代碼
const cityOptions = computed(() => {
  if (cityConfig.value.length === 0) return [];
  return cityConfig.value.map(c => ({
    label: c.city_name,
    value: c.city_name
  }));
});

const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata.value = [...nowdata];
  excelename.value = name;
  excelecolumn.value = nowcolumn.map(item => item.title);
};

const clearDate = () => {
  startDate.value = null;
  endDate.value = null;
};

// --- 日期防呆邏輯 ---
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// 🚀 安全的時間轉換：把 YYYY-MM-DD 轉成 YYYY/MM/DD，避免時區跳轉錯誤
const getMidnightTime = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr.replace(/-/g, '/')).setHours(0, 0, 0, 0);
};

const disablestartDate = (ts) => {
  const todayTime = new Date().setHours(0, 0, 0, 0);
  
  // 🚨 修正 1：改為「大於 (>)」今天才禁用，這樣今天 (等於) 就能選了！
  if (ts > todayTime) return true;

  const endTime = getMidnightTime(endDate.value);
  if (endTime) {
    // 🚨 修正 2：開始日期不能「大於」結束日期 (允許等於，所以能選單日！)
    if (ts > endTime || ts < (endTime - THIRTY_DAYS_MS)) {
      return true;
    }
  }
  return false;
};

const disableEndDate = (ts) => {
  const todayTime = new Date().setHours(0, 0, 0, 0);
  
  // 🚨 修正 1：結束日期同樣不允許選擇未來的日子
  if (ts > todayTime) return true;

  const startTime = getMidnightTime(startDate.value);
  if (startTime) {
    // 🚨 修正 2：結束日期不能「小於」開始日期 (允許等於，所以能選單日！)
    if (ts < startTime || ts > (startTime + THIRTY_DAYS_MS)) {
      return true;
    }
  }
  return false;
};

// --- API 請求與資料處理 ---
const searchData = async () => {
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!startDate.value || !endDate.value) return NotCityAlert("請選擇完整的日期範圍");

  try {
    isLoading.value = true;
    const params = {
      dataset_id: "yb2",
      table_id: "daily_block_pillar",
      begin_date: startDate.value,
      end_date: endDate.value,
      city: [city.value],
    };

    const res = await getGcpReport(params);
    const rawData = res.data?.data || [];

    if (rawData.length === 0) {
      dataList.value = [];
      NotCityAlert("該區間查無資料");
      return;
    }

    const baseKeys = ['date', 'country_name', 's_no', 's_name', 'area_name'];
    const timeKeys = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')); 
    const orderedKeys = [...baseKeys, ...timeKeys];

    const formattedData = rawData.map(row => {
      const newRow = {};
      orderedKeys.forEach(key => {
        if (key === 'date' && row[key]) {
          const d = new Date(row[key]);
          if (!isNaN(d.getTime())) {
            newRow[key] = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          } else {
            newRow[key] = row[key];
          }
        } else if (timeKeys.includes(key)) {
          newRow[key] = row[key] !== null && row[key] !== undefined ? row[key] : 0;
        } else {
          newRow[key] = row[key] !== null && row[key] !== undefined ? row[key] : '-';
        }
      });
      return newRow;
    });

    columns.value = orderedKeys.map((item, index) => {
      let colDef = {
        key: item,
        align: "center",
        title: formatHeader(item)
      };

      if (index < 5) {
        colDef.fixed = "left";
        colDef.width = item === 's_name' ? 170 : 100;
      } else {
        colDef.width = 60;
      }
      return colDef;
    });

    dataList.value = formattedData;
    makeExecl(dataList.value, columns.value, `擋柱綁車_${city.value}`);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 🌟 對齊樣式 */
:deep(.table-row-white) > td {
  background-color: #ffffff !important;
}

:deep(.table-row-gray) > td {
  background-color: #f4f5f7 !important; 
}

:deep(.n-data-table-tr:hover) > td {
  background-color: #e6f7ff !important; 
}

:deep(.n-data-table-td) {
  vertical-align: middle !important;
}
</style>