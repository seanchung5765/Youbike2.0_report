<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">接聽通數統計</h1>
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
          :data="totaldata"
          :name="excelename"
          :header="excelecolumn"
        />
      </div>
    </form>

    <div style="height: calc(100vh - 160px); padding-bottom: 10px;">
      <n-data-table
        ref="dataTable"
        size="small"
        v-show="totaldata.length > 0"
        :columns="columns"
        :data="totaldata"
        :scroll-x="2000" 
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
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";

// 引入 API
import { getCityList } from "@/api/station";
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

const NotCityAlert = (text) => {
  swal({ icon: "error", title: text, showConfirmButton: false });
};

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

// --- 🌟 動態城市選單 (嚴格對應舊版 GCP 後端參數) ---
const cityOptions = computed(() => {
  if (cityConfig.value.length === 0) return [];
  const options = [];

  cityConfig.value.forEach(cityData => {
    if (!cityData.codes) return;
    const codes = cityData.codes.split(',').map(c => c.trim());
    const code2 = codes.find(c => c.endsWith("2"));

    if (code2) {
      // 💡 這支 API 的城市參數命名很特別，手動做精準映射
      let valKey = code2;
      if (code2 === "Taipei2") valKey = "Taipei_two";
      if (code2 === "Newtaipei2") valKey = "NewTaipei_two";
      if (code2 === "Taoyuan2") valKey = "Taoyuan_two";
      if (code2 === "Hsinchu2") valKey = "Hsinchu_two";
      if (code2 === "Hsinchu_Country2") valKey = "HsinchuCountry_two";
      if (code2 === "Miaoli2") valKey = "Miaoli_two";
      if (code2 === "Taichung2") valKey = "Taichung_two";
      if (code2 === "Chiayi2") valKey = "Chiayi";
      if (code2 === "Tainan2") valKey = "Tainan";
      if (code2 === "Kaohsiung2") valKey = "Kaohsiung";
      if (code2 === "Pingtung2") valKey = "Pingtung";
      if (code2 === "Taitung2") valKey = "Taitung";
      
      options.push({ label: cityData.name, value: valKey });
    }
  });
  return options;
});

// --- 🌟 動態生成表頭 ---
const columns = [
  { key: "item1", align: "center", fixed: "left", title: "員工編號", width: 100 },
  { key: "item2", align: "center", fixed: "left", title: "姓名", width: 100 },
  ...Array.from({ length: 24 }, (_, i) => ({
    key: `item${i + 3}`,
    align: "center",
    title: `${i}-${i + 1}`,
    width: 70
  })),
  { key: "item27", align: "center", title: "合計", width: 80 },
];

const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = nowcolumn.map(item => item.title);
};

// --- 🌟 斑馬紋設定 ---
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// --- 日期防呆 ---
const disableStartDate = (ts) => {
  const date = new Date(ts).setHours(0, 0, 0, 0);
  const minDate = new Date(2023, 7, 8).setHours(0, 0, 0, 0); 
  const today = new Date().setHours(0, 0, 0, 0);
  return date < minDate || date >= today;
};

// --- API 請求與資料處理 ---
const hourKeys = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifthteen", "sixteen",
  "seventeen", "eighteen", "nineteen", "twenty", "twenty_one", "twenty_two", "twenty_three"
];

const getdata = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "yb2", 
      table_id: "CTI_person_work",
      date: timestamp.value,
      city: city.value,
      sys: "2.0", // 🌟 硬編碼為 2.0
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    totaldata.value = resdata.map((element) => {
      const row = {
        item1: element.AID,
        item2: element.name,
        item27: element.total ?? 0,
      };
      
      hourKeys.forEach((key, index) => {
        row[`item${index + 3}`] = element[key] ?? 0;
      });
      
      return row;
    });

    makeExecl(totaldata.value, columns, `接聽通數統計_${city.value}`);

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
/* 🌟 強制覆蓋斑馬紋顏色 (包含固定在左側的欄位) */
:deep(.table-row-white) > td {
  background-color: #ffffff !important;
}

:deep(.table-row-gray) > td {
  background-color: #e8e8e8 !important; /* 指定的深灰色 */
}

/* 滑鼠經過高亮 */
:deep(.n-data-table-tr:hover) > td {
  background-color: #e6f7ff !important;
}
</style>