<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">客服每月話務報</h1>
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
          />
        </div>
      </div>

      <div style="width: 120px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="year"
          :actions="null"
          :input-readonly="true"
          :is-date-disabled="disableDate"
          placeholder="請選擇年份"
          value-format="yyyy"
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

    <div class="row mx-0 px-3 py-2" v-if="monthlyData.length > 0">
      <div class="d-flex gap-1 flex-nowrap overflow-x-auto pb-1">
        <button
          v-for="(month, index) in monthlyData"
          :key="index"
          type="button"
          class="btn btn-sm"
          style="font-weight: bold; padding: 4px 10px; font-size: 13px; white-space: nowrap;"
          :class="currentMonthIndex === index ? 'btn-success' : 'btn-outline-success'"
          @click="switchMonth(index)"
        >
          {{ month.monthName }}
        </button>
      </div>
    </div>

    <div style="height: calc(100vh - 220px); padding-bottom: 10px;">
      <n-data-table
        ref="table"
        size="small"
        v-show="dataTable.length > 0"
        :columns="columns"
        :data="dataTable"
        :scroll-x="3200"  
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

const ischange = inject("ischange");
const swal = inject("$swal");
const store = useUserStore();
const canusecitys = store.citys || [];

const NotCityAlert = (text) => swal({ icon: "error", title: text, showConfirmButton: false });

const table = ref(null);
const city = ref(null);
const timestamp = ref(null);
const isLoading = ref(false);
const cityConfig = ref([]);

const columns = ref([]);
const dataTable = ref([]);
const monthlyData = ref([]);
const currentMonthIndex = ref(0);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🌟 初始化載入縣市設定 ---
const loadCities = async () => {
  try {
    const res = await getCityList();
    const allCitiesFromDB = res.data.data || [];
    // 只保留該員工有權限的縣市 ID
    cityConfig.value = allCitiesFromDB.filter(c => canusecitys.includes(c.id));
  } catch (error) {
    console.error("載入縣市清單失敗", error);
  }
};

onMounted(() => {
  loadCities();
});

// --- 🌟 動態城市選單 (根據權限 ID 組合分組) ---
const cityOptions = computed(() => {
  if (cityConfig.value.length === 0) return [];

  const groups = {};

  // 💡 GCP 後端 API 嚴格要求的變數名稱，我們用 ID 來精準映射
  const gcpApiKeys = {
    1: "Taipei_NewTaipei",
    2: "Taoyuan_Hsinchu_Miaoli",
    3: "Taichung",
    4: "Chiayi",
    5: "Tainan_Kaohsiung_Pingtung"
  };

  cityConfig.value.forEach(city => {
    // 抓取資料庫的群組 ID
    const groupId = city.report_group_id; 
    
    // 如果該縣市沒有分配群組，就不處理
    if (!groupId) return; 

    // 建立該群組的選單選項
    if (!groups[groupId]) {
      groups[groupId] = {
        // 🌟 畫面顯示：直接吃你剛剛後端 JOIN 出來的 report_group_name
        label: city.report_group_name || `區域 ${groupId}`,
        // 🌟 底層傳送：對應 GCP 需要的英文變數
        value: gcpApiKeys[groupId] 
      };
    }
  });

  // Object.values 會把物件轉回 Naive UI 需要的陣列格式
  return Object.values(groups);
});

// --- 🌟 斑馬紋顏色 ---
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'table-row-white' : 'table-row-gray';
};

// --- 日期防呆 ---
const disableDate = (ts) => {
  const year = new Date(ts).getFullYear();
  const nowYear = new Date().getFullYear();
  return year < 2023 || year > nowYear;
};

// --- 匯出 Excel ---
const buildExcelData = (resdata) => {
  const arr = resdata.map((item) => {
    const obj = { item1: item.item };
    for (let i = 1; i <= 31; i++) {
      obj[`item${i + 1}`] = item[`date${i}`] ?? "";
    }
    obj.item33 = item.total ?? "";
    obj.item34 = item.percent === ".00%" ? "0%" : (item.percent ?? "");
    return obj;
  });

  exceldata = arr.slice(1);
  excelename = `客服每月話務報_${city.value}_${timestamp.value}`;

  excelecolumn = [];
  if (arr.length > 0) {
    for (let i = 1; i <= 34; i++) {
      excelecolumn.push(arr[0][`item${i}`]);
    }
  }
};

const switchMonth = (index) => {
  currentMonthIndex.value = index;
  updateTableDisplay();
};

const updateTableDisplay = () => {
  if (monthlyData.value.length === 0) return;
  const chunk = monthlyData.value[currentMonthIndex.value];

  // 🚀 關鍵修改：把 item1 (項目) 的 align 改成 "left"
  const newCols = [
    { key: "item1", align: "left", title: "項目", fixed: "left", width: 180 } 
  ];
  
  // 後面的日期與數字欄位，保持置中比較容易閱讀
  for (let i = 1; i <= 31; i++) {
    const dateStr = chunk.headerRow[`date${i}`];
    if (dateStr) { 
      newCols.push({ key: `item${i + 1}`, align: "center", title: dateStr, width: 85 });
    }
  }
  
  newCols.push({ key: "item33", align: "center", title: chunk.headerRow.total || "合計", width: 100 });
  newCols.push({ key: "item34", align: "center", title: chunk.headerRow.percent || "比例", width: 100 });

  columns.value = newCols;

  dataTable.value = chunk.rows.map(item => {
    const obj = { item1: item.item };
    for (let i = 1; i <= 31; i++) {
      if (chunk.headerRow[`date${i}`]) {
        obj[`item${i + 1}`] = item[`date${i}`] ?? "";
      }
    }
    obj.item33 = item.total ?? "";
    obj.item34 = item.percent === ".00%" ? "0%" : (item.percent ?? "");
    return obj;
  });
};

const getDate = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "CTI_monthly_report",
      date: timestamp.value,
      city: city.value,
    };

    const res = await getGcpReport(params);
    let resdata = res.data?.data || [];

    if (resdata.length === 0) {
      monthlyData.value = [];
      dataTable.value = [];
      columns.value = [];
      return;
    }

    // ==========================================
    // 🚀 關鍵絕招：資料過濾與名稱轉換器 (白名單)
    // ==========================================
    
    // 💡 1. 建立翻譯字典：左邊是「後端傳來的原名」，右邊是「你想在畫面上顯示的新名字」
    // （你隨時可以在這裡自由增減、修改你想保留的欄位與名稱）
    const itemMapping = {
      // 標題列絕對不能刪
      "日期": "日期", 

      "北區(1.0+2.0)進電數":"雙北市 進電數",
      "北區(1.0+2.0)掛斷數(大於6秒)":"雙北市 掛斷數",
      "台北2.0進電數":"台北市 進電數",
      "台北2.0掛斷數(大於6秒)":"台北市 掛斷數(>6秒)",
      "新北2.0進電數":"新北市 進電數",
      "新北2.0掛斷數(大於6秒)":"新北市 掛斷數(>6秒)",


      "桃園2.0進電數":"桃園市 進電數",
      "桃園2.0掛斷數(大於6秒)": "桃園市 掛斷數(>6秒)",
      "新竹市2.0進電數": "新竹市 進電數",
      "新竹市2.0掛斷數(大於6秒)": "新竹市 掛斷數(>6秒)",
      "新竹縣2.0進電數": "新竹縣 進電數",
      "新竹縣2.0掛斷數(大於6秒)": "新竹縣 掛斷數(>6秒)",
      "苗栗2.0進電數": "苗栗縣 進電數",
      "苗栗2.0掛斷數(大於6秒)": "苗栗縣 掛斷數(>6秒)",

      "台中市2.0進電數": "台中市 進電數",
      "台中市2.0掛斷數(大於6秒)": "台中市 掛斷數(>6秒)",

      "嘉義2.0進電數": "嘉義市 進電數",
      "嘉義2.0掛斷數(大於6秒)": "嘉義市 掛斷數(>6秒)",
      "嘉義縣2.0進電數": "嘉義縣 進電數",
      "嘉義縣2.0掛斷數(大於6秒)": "嘉義縣 掛斷數(>6秒)",

      "高雄2.0進電數": "高雄市 進電數",
      "高雄2.0掛斷數(大於6秒)": "高雄市 掛斷數(>6秒)",
      "台南2.0進電數": "台南市 進電數",
      "台南2.0掛斷數(大於6秒)": "台南市 掛斷數(>6秒)",
      "屏東2.0進電數": "屏東縣 進電數",
      "屏東2.0掛斷數(大於6秒)": "屏東縣 掛斷數(>6秒)",
      
      "台東2.0進電數": "台東縣 進電數",
      "台東2.0掛斷數(大於6秒)": "台東縣 掛斷數(>6秒)",
      

      
      // ⚠️ 注意：沒有寫在這個字典裡的項目，就會被「直接丟棄不顯示」！
    };

    // 💡 2. 執行過濾與重新命名
    resdata = resdata
      .filter(row => itemMapping[row.item] !== undefined) // 只保留有在字典裡出現的項目
      .map(row => {
        return {
          ...row, 
          item: itemMapping[row.item] // 把舊名字替換成我們自己定義的新名字
        };
      });

    // ==========================================

    buildExcelData(resdata);

    const chunks = [];
    let currentChunk = null;

    resdata.forEach(row => {
      if (row.item === "日期") { // 注意：因為字典有把 "日期" 保留為 "日期"，所以這裡照常運作
        if (currentChunk) chunks.push(currentChunk);
        
        const firstDate = row.date1 || "";
        let mName = "未知月份";
        if (firstDate.includes("/")) {
          mName = parseInt(firstDate.split("/")[0]) + "月份";
        }
        
        currentChunk = {
          monthName: mName,
          headerRow: row,
          rows: []
        };
      } else {
        if (currentChunk) currentChunk.rows.push(row);
      }
    });
    if (currentChunk) chunks.push(currentChunk);

    monthlyData.value = chunks;
    currentMonthIndex.value = 0;
    updateTableDisplay();

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = async () => {
  if (!city.value) return NotCityAlert("請選擇城市分組");
  if (!timestamp.value) return NotCityAlert("請選擇年份");
  await getDate();
};
</script>

<style scoped>
/* 🌟 強制覆蓋斑馬紋顏色 (包含固定在左側的欄位) */
:deep(.table-row-white) > td {
  background-color: #ffffff !important;
}

:deep(.table-row-gray) > td {
  background-color: #e8e8e8 !important; /* 深灰色 */
}

/* 滑鼠經過高亮 */
:deep(.n-data-table-tr:hover) > td {
  background-color: #e6f7ff !important;
}
</style>