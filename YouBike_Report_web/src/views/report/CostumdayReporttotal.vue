<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">話務統計表</h1>
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

    <div style="height: calc(100vh - 160px); padding-bottom: 10px;">
      <n-data-table
        ref="dataTable"
        size="small"
        v-show="totaldata.length > 0"
        :columns="columns"
        :data="totaldata"
        :scroll-x="1800" 
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
const columns = ref([]);
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
      // 💡 精準對應舊版 API 需要的 2.0 參數 (話務統計表的命名也很特別)
      let valKey = code2;
      if (code2 === "Taipei2") valKey = "TP";
      if (code2 === "Newtaipei2") valKey = "NTP2";
      if (code2 === "Taoyuan2") valKey = "Taoyuan_two";
      if (code2 === "Hsinchu2") valKey = "Hsinchu_two";
      if (code2 === "Hsinchu_Country2") valKey = "HsinchuCountry"; // 舊版沒寫 _two
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

// --- 日期防呆 ---
const disableStartDate = (ts) => {
  const date = new Date(ts).setHours(0, 0, 0, 0);
  const minDate = new Date(2023, 7, 8).setHours(0, 0, 0, 0); 
  const today = new Date().setHours(0, 0, 0, 0);
  return date < minDate || date >= today;
};

// --- 🌟 斑馬紋設定 ---
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// --- 🚀 神級優化：動態表頭與資料 Key 映射工廠 (省下 600 多行) ---
const getCityConfig = (cityValue) => {
  // 特例：台北市 (TP) 有 19 個欄位
  if (cityValue === "TP") {
    return {
      keys: ["time_range", "total", "total_percentage", "TP_two_total", "TP_5511_total", "TP_1999_total", "answer", "answer_percentage", "TP_two_answer", "TP_5511_answer", "TP_1999_answer", "avg_person_counts", "hangup", "hangup_gt_six", "hangup_le_six", "hangup_gt_six_percentage", "ride_times", "before_avg_duration", "avg_duration"],
      titles: [{ title: "時刻", fixed: "left" }, "進電數", "進電比例", "台北2.0進線數", "5511專線", "1999專線", "接聽數", "接聽比例", "台北2.0進線數", "5511專線", "1999專線", "平均每人接聽通數", "掛斷數", ">6掛斷數", "<=6掛斷數", ">6掛斷率", "使用次數", "接聽前平均等待時間", "平均通話時間"]
    };
  }
  // 特例：高雄市 (Kaohsiung) 有 17 個欄位
  if (cityValue === "Kaohsiung") {
    return {
      keys: ["time_range", "total", "total_percentage", "Kaohsiung_two_total", "Kaohsiung_0800_total", "answer", "answer_percentage", "Kaohsiung_two_answer", "Kaohsiung_0800_answer", "avg_person_counts", "hangup", "hangup_gt_six", "hangup_le_six", "hangup_gt_six_percentage", "ride_times", "before_avg_duration", "avg_duration"],
      titles: [{ title: "時刻", fixed: "left" }, "進電數", "進電比例", "高雄2.0進電數", "0800專線", "接聽數", "接聽比例", "高雄2.0接聽數", "0800專線", "平均每人接聽通數", "掛斷數", ">6掛斷數", "<=6掛斷數", ">6掛斷率", "使用次數", "接聽前平均等待時間", "平均通話時間"]
    };
  }

  // 常規城市 (15 個欄位)，僅保留 2.0 邏輯
  const standardMap = {
    NTP2: { p: "NTP_two", t: "新北2.0" },
    Taoyuan_two: { p: "Taoyuan_two", t: "桃園2.0" },
    Hsinchu_two: { p: "Hsinchu_two", t: "新竹2.0" },
    HsinchuCountry: { p: "HsinchuCountry_two", t: "竹縣2.0" },
    Miaoli_two: { p: "Miaoli_two", t: "苗栗2.0" },
    Chiayi: { p: "Chiayi", t: "嘉義2.0" },
    Taichung_two: { p: "Taichung_two", t: "台中2.0" },
    Tainan: { p: "Tainan", t: "台南2.0" },
    Pingtung: { p: "Pingtung", t: "屏東2.0" },
    Taitung: { p: "Taitung", t: "台東2.0" }
  };

  const c = standardMap[cityValue] || { p: "", t: "" };
  return {
    keys: ["time_range", "total", "total_percentage", `${c.p}_total`, "answer", "answer_percentage", `${c.p}_answer`, "avg_person_counts", "hangup", "hangup_gt_six", "hangup_le_six", "hangup_gt_six_percentage", "ride_times", "before_avg_duration", "avg_duration"],
    titles: [{ title: "時刻", fixed: "left" }, "進電數", "進電比例", c.t, "接聽數", "接聽比例", c.t, "平均每人接聽通數", "掛斷數", ">6掛斷數", "<=6掛斷數", ">6掛斷率", "使用次數", "接聽前平均等待時間", "平均通話時間"]
  };
};

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
      table_id: "CTI_final_table",
      date: timestamp.value,
      city: city.value,
      sys: "2.0", // 🌟 強制寫死為 2.0 系統
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 1. 動態取得該城市的欄位設定與資料 Key
    const config = getCityConfig(city.value);
    
    // 2. 將 titles 陣列轉換為 Naive UI 的 columns 格式
    columns.value = config.titles.map((t, index) => {
      const titleText = typeof t === 'string' ? t : t.title;
      
      // 💡 根據標題字數自動給予適當的寬度，拒絕尷尬斷行！
      let colWidth = 100; // 預設寬度
      if (titleText.length >= 5) colWidth = 120; // 5個字以上給 120px
      if (titleText.length >= 8) colWidth = 160; // 8個字以上給 160px 

      return {
        key: `item${index + 1}`,
        align: "center",
        title: titleText,
        width: colWidth, 
        ...(t.fixed && { fixed: t.fixed })
      };
    });

    // 3. 動態填補資料並處理百分比轉換
    const percentageKeys = ["total_percentage", "answer_percentage", "hangup_gt_six_percentage"];
    
    totaldata.value = resdata.map((element) => {
      const row = {};
      config.keys.forEach((key, index) => {
        const val = element[key];
        if (percentageKeys.includes(key)) {
          // 百分比處理：沒有值就給 0，有值就 * 100 加上 %
          row[`item${index + 1}`] = !val ? 0 : (val * 100).toFixed(2) + "%";
        } else {
          // 其他數值：處理 null 空白問題，一律補 0
          row[`item${index + 1}`] = val ?? 0;
        }
      });
      return row;
    });

    makeExecl(totaldata.value, columns.value, `話務統計表_${city.value}`);

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