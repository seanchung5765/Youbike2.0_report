<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">每小時明細表</h1>
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
import { ref, inject, computed, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";
import { getCityList } from "@/api/station";
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

const NotCityAlert = (text) => swal({ icon: "error", title: text, showConfirmButton: false });

const dataTable = ref(null);
const city = ref(null); 
const isLoading = ref(false);
const totaldata = ref([]);
const timestamp = ref(null);
const columns = ref([]);
const cityConfig = ref([]); 

let excelename = "";
let excelecolumn = [];

// --- 初始化載入縣市設定 ---
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

// --- 🌟 動態城市選單 (嚴格對齊 GCP 舊版參數) ---
const cityOptions = computed(() => {
  if (cityConfig.value.length === 0) return [];
  const options = [];

  cityConfig.value.forEach(cityData => {
    if (!cityData.codes) return;
    const codes = cityData.codes.split(',').map(c => c.trim());
    const code2 = codes.find(c => c.endsWith("2"));

    if (code2) {
      // 💡 嚴格對應舊版 API 需要的 Key
      let valKey = code2;
      if (code2 === "Taipei2") valKey = "TP";
      if (code2 === "Newtaipei2") valKey = "NTP2";
      if (code2 === "Taoyuan2") valKey = "Taoyuan_two";
      if (code2 === "Miaoli2") valKey = "Miaoli_two";
      if (code2 === "Hsinchu2") valKey = "Hsinchu2";
      if (code2 === "Hsinchu_Country2") valKey = "Hsinchu_Country";
      if (code2 === "Taichung2") valKey = "Taichung2";
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

// --- 表頭對應表 ---
const buildCol = (title2, title3, title4) => [
  { key: "item1", align: "center", fixed: "left", title: "日期/時段", width: 120 },
  { key: "item2", align: "center", title: title2, width: 130 },
  { key: "item3", align: "center", title: title3, width: 130 },
  { key: "item4", align: "center", title: title4, width: 130 }
];

const columnMap = {
  TP: [
    ...buildCol("台北2.0進線數", "台北2.0掛斷數", "台北2.0接通數"),
    { key: "item5", align: "center", title: "1999進線數", width: 120 },
    { key: "item6", align: "center", title: "1999掛斷數", width: 120 },
    { key: "item7", align: "center", title: "1999接通數", width: 120 },
    { key: "item8", align: "center", title: "5511進線數", width: 120 },
    { key: "item9", align: "center", title: "5511掛斷數", width: 120 },
    { key: "item10", align: "center", title: "5511接通數", width: 120 }
  ],
  Kaohsiung: [
    ...buildCol("高雄2.0進線數", "高雄2.0掛斷數", "高雄2.0接通數"),
    { key: "item5", align: "center", title: "0800進線數", width: 120 },
    { key: "item6", align: "center", title: "0800掛斷數", width: 120 },
    { key: "item7", align: "center", title: "0800接通數", width: 120 }
  ],
  NTP2: buildCol("新北2.0進線數", "新北2.0掛斷數", "新北2.0接通數"),
  Taoyuan_two: buildCol("桃園2.0進線數", "桃園2.0掛斷數", "桃園2.0接通數"),
  Hsinchu2: buildCol("新竹2.0進線數", "新竹2.0掛斷數", "新竹2.0接通數"),
  Hsinchu_Country: buildCol("竹縣2.0進線數", "竹縣2.0掛斷數", "竹縣2.0接通數"),
  Miaoli_two: buildCol("苗栗2.0進線數", "苗栗2.0掛斷數", "苗栗2.0接通數"),
  Chiayi: buildCol("嘉義進線數", "嘉義掛斷數", "嘉義接通數"),
  Taichung2: buildCol("台中2.0進線數", "台中2.0掛斷數", "台中2.0接通數"),
  Tainan: buildCol("台南2.0進線數", "台南2.0掛斷數", "台南2.0接通數"),
  Pingtung: buildCol("屏東2.0進線數", "屏東2.0掛斷數", "屏東2.0接通數"),
  Taitung: buildCol("台東2.0進線數", "台東2.0掛斷數", "台東2.0接通數")
};

// --- 斑馬紋設定 ---
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

// --- 🌟 API 請求與資料處理 (完美還原舊版資料結構) ---
const getdata = async () => {
  try {
    isLoading.value = true;
    columns.value = columnMap[city.value] || [];

    const params = {
      dataset_id: "report",
      table_id: "CTI_inline_detail",
      date: timestamp.value,
      city: city.value,
      sys: "2.0", // 🌟 硬編碼為 2.0
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    totaldata.value = resdata.map((element) => {
      // 💡 針對台北與高雄，抓取 _two 的欄位；其他縣市雖然是 2.0，但後端給的是沒後綴的 total
      if (city.value === "TP") {
        return {
          item1: element.time_range,
          item2: element.total_two ?? 0,
          item3: element.hangup_two ?? 0,
          item4: element.answer_two ?? 0,
          item5: element.total_1999 ?? 0, 
          item6: element.hangup_1999 ?? 0, 
          item7: element.answer_1999 ?? 0,
          item8: element.total_5511 ?? 0, 
          item9: element.hangup_5511 ?? 0, 
          item10: element.answer_5511 ?? 0,
        };
      } else if (city.value === "Kaohsiung") {
        return {
          item1: element.time_range,
          item2: element.total_two ?? 0,
          item3: element.hangup_two ?? 0,
          item4: element.answer_two ?? 0,
          item5: element.total_0800 ?? 0, 
          item6: element.hangup_0800 ?? 0, 
          item7: element.answer_0800 ?? 0,
        };
      } else {
        return {
          item1: element.time_range,
          item2: element.total ?? 0,   // 🌟 舊版關鍵：其他縣市吃的是 total
          item3: element.hangup ?? 0,  // 🌟 舊版關鍵：其他縣市吃的是 hangup
          item4: element.answer ?? 0,  // 🌟 舊版關鍵：其他縣市吃的是 answer
        };
      }
    });

    excelename = `每小時明細表_${city.value}_${timestamp.value}`;
    excelecolumn = columns.value.map(item => item.title);

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