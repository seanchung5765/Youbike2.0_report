<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">電話掛斷通數統計表</h1>
    </div>

    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0;">
        <label class="fw-bolder me-2 mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 140px;">
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇"
            filterable
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
          placeholder="請選擇日期"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disableStartDate"
        />
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0;">
        <button
          type="button"
          class="btn btn-success text-light fw-bold"
          style="white-space: nowrap;"
          @click="search"
        >
          搜尋
        </button>
        <output-excel
          class="btn btn-primary text-light fw-bold"
          style="white-space: nowrap;"
          :data="exceldata"
          :name="excelename"
          :header="excelecolumn"
        />
      </div>
    </form>

    <n-data-table
      ref="dataTable"
      size="small"
      v-show="totaldata.length > 0"
      :pagination="{ pageSize: 17 }"
      :columns="columns"
      :data="totaldata"
      :max-height="600"
      :scroll-x="700"
      :bordered="false"
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
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";

// 🚀 引入共用的 GCP 報表 API 與縣市 API
import { getCityList } from "@/api/station";
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const dataTable = ref(null);
const city = ref(null); 
const isLoading = ref(false);
const totaldata = ref([]);
const timestamp = ref(null);
const cityConfig = ref([]);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🌟 初始化載入縣市設定 ---
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

// --- 🌟 資料驅動選單 (動態 API 產生) ---
const cityOptions = computed(() => {
  if (cityConfig.value.length === 0) return [];
  const options = [];

  cityConfig.value.forEach(cityData => {
    if (!cityData.codes) return;

    // 🌟 刻意排除：不需要出現的縣市直接跳過
    const excludeList = ["嘉義縣", "竹科", "新竹科學園區"];
    if (excludeList.some(name => cityData.name.includes(name))) {
      return; 
    }

    const codes = cityData.codes.split(',').map(c => c.trim());
    const code2 = codes.find(c => c.endsWith("2"));

    if (code2) {
      // 💡 精準對應舊版 API 需要的 2.0 參數 (這支報表的 key 命名又有點不同)
      let valKey = code2;
      if (code2 === "Taipei2") valKey = "TP_two";
      if (code2 === "Newtaipei2") valKey = "NTP_two";
      if (code2 === "Taoyuan2") valKey = "Taoyuan_two";
      if (code2 === "Hsinchu2") valKey = "Hsinchu_two";
      if (code2 === "Hsinchu_Country2") valKey = "HsinchuCountry"; // 舊版沒寫 _two
      if (code2 === "Miaoli2") valKey = "Miaoli_two";
      if (code2 === "Taichung2") valKey = "Taichung_two";
      if (code2 === "Chiayi2") valKey = "Chiayi";
      if (code2 === "Tainan2") valKey = "Tainan";
      if (code2 === "Kaohsiung2") valKey = "Kaohsiung";
      if (code2 === "Pingtung2") valKey = "Pingtung";
      
      options.push({ label: cityData.name, value: valKey });
    }
  });
  return options;
});

// --- 🌟 斑馬紋設定 ---
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// --- 日期防呆優化 ---
const disableStartDate = (ts) => {
  const date = new Date(ts).setHours(0, 0, 0, 0);
  const minDate = new Date(2023, 7, 8).setHours(0, 0, 0, 0); // 2023-08-08
  const today = new Date().setHours(0, 0, 0, 0);
  return date < minDate || date >= today;
};

// --- 固定表頭 ---
const columns = ref([
  { key: "item1", align: "center", title: "來電號碼" },
  { key: "item2", align: "center", title: "要求技能" },
  { key: "item3", align: "center", title: "來電時間" },
  { key: "item4", align: "center", title: "掛斷時間" },
  { key: "item5", align: "center", title: "諮詢客服小組" },
]);

const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = nowcolumn.map(item => item.title);
};

// --- API 請求與資料處理 ---
const getdata = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "CTI_hangup_detail",
      date: timestamp.value,
      city: city.value,
      sys: "2.0", // 🌟 強制寫死為 2.0 系統
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    totaldata.value = resdata.map((item) => ({
      item1: item.mobile,
      item2: item.SKILLS,
      item3: item.income,
      item4: item.hang_up,
      item5: item.PID,
    }));

    makeExecl(totaldata.value, columns.value, `電話掛斷通數統計表_${city.value}`);
    
    if (dataTable.value) {
      dataTable.value.page(1);
    }

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
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
/* 🌟 強制覆蓋斑馬紋顏色 */
:deep(.table-row-white) > td {
  background-color: #ffffff !important;
}

:deep(.table-row-gray) > td {
  background-color: #e8e8e8 !important; /* 翔宇指定的深灰色 */
}

/* 滑鼠經過高亮 */
:deep(.n-data-table-tr:hover) > td {
  background-color: #e6f7ff !important;
}
</style>