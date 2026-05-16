<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">遺失車報表</h1>
    </div>

    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 160px;">
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇"
          />
        </div>
      </div>

      <div style="width: 150px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="date"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="請選擇日期"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disableStartDate"
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

    <div style="height: calc(100vh - 180px); padding-bottom: 10px;">
      <n-data-table
        ref="dataTable"
        size="small"
        v-show="totaldata.length > 0"
        :columns="columns"
        :data="totaldata"
        :max-height="600"
        :scroll-x="1000"
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
import { ref, inject, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";
import { getGcpReport } from "@/api/report";
import { getAllCities } from "@/api/admin";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const dataTable = ref(null);
const city = ref(null);
const timestamp = ref(null);
const isLoading = ref(false);
const totaldata = ref([]);
const cityOptions = ref([]);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🚀 1. 縣市 API 載入與智慧組合邏輯 ---
const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];

    // 先過濾出使用者有權限的縣市
    const authorized = dbCities.filter(c => canusecitys.includes(c.city_id));

    // 判斷是否要出現「雙北」選項 (必須同時擁有 台北 2 和 新北 3)
    const hasTaipei = canusecitys.includes(2);
    const hasNewTaipei = canusecitys.includes(3);

    const options = [];
    
    // 如果有雙北權限，加入組合包
    if (hasTaipei && hasNewTaipei) {
      options.push({ label: "雙北", value: "Taipei+NewTaipei" });
    }

    // 加入個別縣市
    authorized.forEach(c => {
      // 取得 GCP Python 那邊認得的英文字串 (codes 欄位的第一個)
      const gcpCode = c.codes ? c.codes.split(',')[0].trim() : "";
      if (gcpCode) {
        options.push({
          label: c.city_name,
          value: gcpCode,
          original_name: c.city_name // 存一下中文名，供後續對照
        });
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

// --- 🚀 2. 斑馬紋樣式設定 (#e8e8e8) ---
const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

// --- 日期防呆優化 ---
const disableStartDate = (ts) => {
  const date = new Date(ts);
  const minDate = new Date(2023, 7, 30); 
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < minDate || date >= today;
};

// --- 表頭定義 ---
const columns = [
  { key: "item1", align: "center", title: "城市", width: 120 },
  { key: "item2", align: "center", title: "系統", width: 100 },
  { key: "item3", align: "center", title: "待協尋車輛數", width: 150 },
  { key: "item4", align: "center", title: "狀態", width: 150 },
  { key: "item5", align: "center", title: "車號" },
];

const makeExecl = (nowdata, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = columns.map(col => col.title);
};

// --- API 請求與資料處理 ---
const getdata = async () => {
  try {
    isLoading.value = true;
    
    // 處理雙北特殊參數
    const cityParams = city.value === "Taipei+NewTaipei" ? ["Taipei", "NewTaipei"] : [city.value];

    const params = {
      dataset_id: "report",
      table_id: "daily_lost",
      date: timestamp.value,
      city: cityParams,
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 💡 整理資料並執行合併儲存格視覺優化
    let arr = [];
    resdata.forEach((item, index) => {
      // 從我們的 options 裡面找出對應的中文名
      const matchedCity = cityOptions.value.find(opt => opt.value === item.city);
      const currentCityStr = matchedCity ? matchedCity.label : item.city;
      
      const statusStr = item.status === "new_lost" ? "新增報案車輛" : (item.status === "recovered" ? "今日尋回車輛" : item.status);

      if (index === 0) {
        arr.push({
          item1: currentCityStr,
          item2: item.sys ?? "",
          item3: item.total ?? "",
          item4: statusStr,
          item5: item.asset_no ?? "",
        });
      } else {
        const prev = resdata[index - 1];
        const isSameCity = item.city === prev.city;
        const isSameSys = isSameCity && item.sys === prev.sys;
        const isSameTotal = isSameSys && item.total === prev.total;

        arr.push({
          item1: isSameCity ? "" : currentCityStr,
          item2: isSameSys ? "" : (item.sys ?? ""),
          item3: isSameTotal ? "" : (item.total ?? ""),
          item4: statusStr,
          item5: item.asset_no ?? "",
        });
      }
    });

    totaldata.value = arr;
    makeExecl(totaldata.value, "遺失車報表");

    if (dataTable.value?.page) dataTable.value.page(1);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗");
  } finally {
    isLoading.value = false;
  }
};

const search = async () => {
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  await getdata();
};
</script>

<style scoped>
/* 🚀 灰色行樣式 (#e8e8e8) */
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

/* 確保滑鼠移過去的高亮色 */
:deep(.n-data-table .n-data-table-tr.gray-row:hover td) {
  background-color: #e6f7ff !important;
}
</style>