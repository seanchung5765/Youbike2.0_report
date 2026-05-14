<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">2.0E電池狀況查詢</h1>
    </div>
    
    <!-- 🚀 優化：套用強制不換行 + 橫向捲軸的排版 -->
    <form
      class="d-flex flex-nowrap align-items-center gap-3 mx-0 py-2 px-3 overflow-x-auto"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <!-- 城市選擇 -->
      <div class="d-flex align-items-center">
        <label class="col-form-label fw-bolder me-2 text-nowrap">城市:</label>
        <div style="width: 140px; flex-shrink: 0;">
          <!-- 🚀 優化：換成 n-select，消滅原本寫死的 v-if -->
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇城市"
            filterable
          />
        </div>
      </div>

      <!-- 開始日期 -->
      <div style="width: 150px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="starttimestamp"
          type="date"
          :actions="null"
          :is-date-disabled="disablestartDate"
          update-value-on-close
          placeholder="開始日期"
          value-format="yyyy-MM-dd"
        />
      </div>

      <!-- 結束日期 -->
      <div style="width: 150px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="endtimestamp"
          type="date"
          :actions="null"
          :is-date-disabled="disableEndDate"
          update-value-on-close
          placeholder="結束日期"
          value-format="yyyy-MM-dd"
        />
      </div>

      <!-- 按鈕群組 -->
      <div class="d-flex gap-2 ">
        <button
          type="button"
          class="btn btn-info text-light text-nowrap"
          @click="cleardate"
        >
          清空日期
        </button>
        <button
          type="button"
          class="btn btn-success text-light text-nowrap"
          @click="search"
        >
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
    
    <n-data-table
      v-show="data.length > 0"
      ref="dataTable"
      :data="data"
      :columns="columns"
      size="small"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="1500"
      :bordered="false"
      :single-line="false"
      striped
      :row-class-name="rowClassName"
    />
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from "vue";
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";

// 🌟 引入我們封裝好的兩個 API
import { getCityList } from "@/api/station";
import { getGcpReport } from "@/api/report";

const ischange = inject("ischange");
const store = useUserStore();
const canusecitys = store.citys || [];
const swal = inject("$swal");

const NotCityAlert = (text) => {
  swal({ icon: "error", title: text, showConfirmButton: false });
};

const isLoading = ref(false);
const data = ref([]);
const starttimestamp = ref(null);
const endtimestamp = ref(null);
const city = ref(null); 
const dataTable = ref(null);
const columns = ref([]);
const cityConfig = ref([]); // 🌟 存放從資料庫撈回來的縣市資料

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🌟 初始化載入縣市設定 ---
const loadCities = async () => {
  try {
    const res = await getCityList();
    const allCitiesFromDB = res.data.data || [];
    // 只保留該員工有權限的縣市
    cityConfig.value = allCitiesFromDB.filter(c => canusecitys.includes(c.id));
  } catch (error) {
    console.error("載入縣市清單失敗", error);
  }
};

onMounted(() => {
  loadCities();
});

// --- 🚀 動態城市選項 (動態資料庫版) ---
const cityOptions = computed(() => {
  if (cityConfig.value.length === 0) return [];
  
  const options = [];
  
  cityConfig.value.forEach(cityData => {
    if (!cityData.codes) return;
    
    // 確認這個城市有沒有 2.0 系統 (看 codes 裡面有沒有 2 結尾的)
    const hasV2 = cityData.codes.split(',').some(c => c.trim().endsWith("2"));
    
    if (hasV2) {
      // 💡 相容舊版 GCP 報表的特殊命名：新竹市叫「新竹2.0E」，新竹縣叫「竹縣2.0E」
      let valName = cityData.name;
      if (valName === "新竹市") valName = "新竹";
      if (valName === "新竹縣") valName = "竹縣";

      options.push({ 
        label: cityData.name, 
        value: `${valName}2.0E` 
      });
    }
  });

  return options;
});

// ----------------------------------------

const makeExecl = (nowdata, col, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = col.map(item => item.title);
};

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

// --- 日期防呆邏輯優化 ---
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

// --- API 與資料處理 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "data_analysis",
      table_id: "battery_analysis",
      begin_date: starttimestamp.value,
      end_date: endtimestamp.value,
      city: city.value,
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data;

    if (!resdata || resdata.length === 0) {
      data.value = [];
      columns.value = [];
      return;
    }

    const headers = resdata[0];
    
    // 🌟 修改：把 index === 1 的「項目」欄位也加上 fixed: "left"
    columns.value = headers.map((item, index) => {
      let colDef = {
        key: `item${index + 1}`,
        align: "center",
        title: item,
      };

      if (index === 0) {
        // 第一欄：日期/縣市
        colDef.fixed = "left";
        colDef.width = 100;
      } else if (index === 1) {
        // 第二欄：項目 (鎖定在左側)
        colDef.fixed = "left"; 
        colDef.width = 210;
      }

      return colDef;
    });

    data.value = resdata.slice(1).map(rowArray => {
      const rowObject = {};
      rowArray.forEach((val, i) => {
        rowObject[`item${i + 1}`] = val;
      });
      return rowObject;
    });

    makeExecl(data.value, columns.value, "2.0E電池狀況查詢");

  } catch (error) {
    console.error("查詢錯誤:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const rowClassName = (row, index) => {
  // index 是從 0 開始，所以餘數為 0 給白色，餘數為 1 給灰色
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

const search = () => {
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!starttimestamp.value) return NotCityAlert("請選擇開始日期");
  if (!endtimestamp.value) return NotCityAlert("請選擇結束日期");
  
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

/* 🌟 (可選) 滑鼠游標經過時的高亮顏色，讓使用者知道自己看到哪一行 */
:deep(.n-data-table-tr:hover) > td {
  background-color: #e6f7ff !important; /* 淺藍色 */
}
</style>