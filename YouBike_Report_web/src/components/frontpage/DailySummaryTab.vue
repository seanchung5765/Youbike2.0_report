<template>
  <div class="container-fluid px-0">
    <div class="row">
      <div class="col-md-6 px-1 py-1">
        <TreecharComponent
          title="2.0場站數"
          :date="yesterdaydate"
          :treetitle="title_station20"
          :data="data_station20"
        ></TreecharComponent>
      </div>
      <div class="col-md-6 px-1 py-1">
        <TreecharComponent
          title="2.0E場站數"
          :date="yesterdaydate"
          :treetitle="title_station20E"
          :data="data_station20E"
        ></TreecharComponent>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 px-1 py-1">
        <TreecharComponent
          title="2.0車輛數"
          :date="yesterdaydate"
          :treetitle="title_bike20"
          :data="data_bike20"
        ></TreecharComponent>
      </div>
      <div class="col-md-6 px-1 py-1">
        <TreecharComponent
          title="2.0E車輛數"
          :date="yesterdaydate"
          :treetitle="title_bike20E"
          :data="data_bike20E"
        ></TreecharComponent>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 px-1 py-1">
        <TreecharComponent
          title="2.0車柱數"
          :date="yesterdaydate"
          :treetitle="title_pole"
          :data="data_pole"
        ></TreecharComponent>
      </div>
      <div class="col-md-6 px-1 py-1">
        <TreecharComponent
          title="2.0E車柱數"
          :date="yesterdaydate"
          :treetitle="title_pole"
          :data="data_pole"
        ></TreecharComponent>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 px-1 py-1">
        <PiechartComponent
          :data="data_pie_all"
          title="騎乘次數(全系統)"
          :secondtitle="yesterdaydate"
        ></PiechartComponent>
      </div>
      <div class="col-md-6 px-1 py-1">
        <PiechartComponent
          :data="data_pie_20"
          title="騎乘次數(2.0)"
          :secondtitle="yesterdaydate"
        ></PiechartComponent>
      </div>
      <div class="col-md-6 px-1 py-1">
        <PiechartComponent
          :data="data_pie_20E"
          title="騎乘次數(2.0E)"
          :secondtitle="yesterdaydate"
        ></PiechartComponent>
      </div>
    </div>

    <div class="row">
      <div class="px-1 py-1">
        <BarchartComponent :data="data_bar" :date="date_bar"></BarchartComponent>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "../../stores/userdata";
import PiechartComponent from "../../components/PiechartComponent.vue";
import BarchartComponent from "../../components/BarcharComponent.vue";
import TreecharComponent from "../../components/TreecharComponent.vue";
import "vue-loading-overlay/dist/css/index.css";
// 引入封裝好的 API
import { getCityList } from "@/api/station";
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];

const yesterdaydate = ref("");

// 🚀 重新命名變數，讓邏輯更清晰，對應圖片的雙欄設計
const data_station20 = ref([]); const title_station20 = ref("");
const data_station20E = ref([]); const title_station20E = ref("");

const data_bike20 = ref([]); const title_bike20 = ref("");
const data_bike20E = ref([]); const title_bike20E = ref("");

const data_pole = ref([]); const title_pole = ref("");

const data_pie_all = ref([]); 
const data_pie_20 = ref([]); 
const data_pie_20E = ref([]); 

const data_bar = ref([]); const date_bar = ref([]);

// 計算日期的共用函式
const getday = (whatday) => {
  let today = new Date();
  let yesterday = new Date(today);
  yesterday.setDate(today.getDate() - whatday);
  let year = yesterday.getFullYear();
  let month = String(yesterday.getMonth() + 1).padStart(2, "0");
  let day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 存放動態 API 查詢用的城市清單與對照表
const querySummary = ref([]);
const queryPole2 = ref([]); 
const CITY_MAP = ref({}); 

// 城市名稱對照函式 (動態版)
const editName = (code) => {
  return CITY_MAP.value[code] || code;
};

// --- 初始化與資料請求 ---
const getonedaydata = async () => {
  yesterdaydate.value = getday(1);

  try {
    // 1. 自動抓取資料庫城市並組合權限
    const cityRes = await getCityList();
    const dbCities = cityRes.data?.data || [];

    dbCities.forEach(c => {
      if (canusecitys.includes(c.id || c.city_id)) {
        const rawCode = c.codes ? c.codes.split(',')[0].trim() : '';
        const cleanBaseCode = rawCode.replace(/2E$/i, '').replace(/2$/i, ''); 
        const cityName = c.city_name || c.name;

        querySummary.value.push(cityName);
        querySummary.value.push(`${cityName}2.0`);
        querySummary.value.push(`${cityName}2.0E`);

        queryPole2.value.push(`${cleanBaseCode}2`);

        CITY_MAP.value[cleanBaseCode] = cityName;
        CITY_MAP.value[`${cleanBaseCode}2`] = cityName;
        CITY_MAP.value[`${cleanBaseCode}2E`] = cityName;
      }
    });

    if (querySummary.value.length === 0) return;

    // 2. 🚀 發送 3 支 GCP 查詢 API (拔除 1.0)
    const [resSummary1, resSummary7, resPole2] = await Promise.all([
      getGcpReport({ dataset_id: "founder_report", table_id: "daily_summary_Taiwan", begin_date: getday(1), end_date: getday(1), city: querySummary.value }),
      getGcpReport({ dataset_id: "founder_report", table_id: "daily_summary_Taiwan", begin_date: getday(7), end_date: getday(1), city: ["台灣合計"] }),
      getGcpReport({ dataset_id: "report", table_id: "daily_report_query2", begin_date: getday(1), end_date: getday(1), city: queryPole2.value }),
    ]);

    // 3. 執行資料格式化
    const summaryData1 = resSummary1.data?.data || [];
    
    // 處理圓餅圖
    setPieAll(summaryData1);
    setPie20(summaryData1);
    setPie20E(summaryData1);
    
    // 處理樹狀圖 (場站與車輛)
    setTreeStation20(summaryData1);
    setTreeStation20E(summaryData1);
    setTreeBike20(summaryData1);
    setTreeBike20E(summaryData1);

    // 處理長條圖 (趨勢)
    const summaryData7 = resSummary7.data?.data || [];
    setBarChart(summaryData7);

    // 處理樹狀圖 (車柱 - 2.0與2.0E共用)
    const pole2Data = resPole2.data?.data || [];
    setTreePole(pole2Data);

  } catch (error) {
    console.error("Dashboard 取資料失敗:", error);
  }
};

onMounted(() => {
  getonedaydata();
});

// ================= 資料格式化函式區 =================

const setPieAll = (data) => {
  let arr = [
    { value: 0, name: "YB2.0" },
    { value: 0, name: "YB2.0E" },
  ];
  data.forEach((element) => {
    if (element.city.includes("2.0E")) {
      arr[1].value += element.rent_number;
    } else if (element.city.includes("2.0")) {
      arr[0].value += element.rent_number;
    }
  });
  data_pie_all.value = [...arr];
};

const setPie20 = (data) => {
  let arr = [];
  data.forEach((item) => {
    if (!item.city.includes("2.0E") && item.city.includes("2.0")) {
      arr.push({ value: item.rent_number, name: item.city.replace("2.0", "") });
    }
  });
  data_pie_20.value = [...arr];
};

const setPie20E = (data) => {
  let arr = [];
  data.forEach((item) => {
    if (item.city.includes("2.0E")) {
      arr.push({ value: item.rent_number, name: item.city.replace("2.0E", "") });
    }
  });
  data_pie_20E.value = [...arr];
};

const setBarChart = (data) => {
  let datevalue = [];
  let datavalue = [];
  data.forEach((item) => {
    datavalue.push(item.rent_number);
    datevalue.push(item.date);
  });

  datevalue.forEach((item, index) => {
    const date = new Date(item);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    datevalue[index] = `${year}-${month}-${day}`;
  });
  data_bar.value = [...datavalue];
  date_bar.value = [...datevalue];
};

// 場站數 2.0
const setTreeStation20 = (data) => {
  let treedata = [];
  let total = 0;
  data.forEach((item) => {
    if (!item.city.includes("2.0E") && item.city.includes("2.0")) {
      let city = item.city.replace("2.0", "");
      treedata.push({ name: `${city}:${item.current_station}` });
      total += item.current_station;
    }
  });
  data_station20.value = [...treedata];
  title_station20.value = `總站數:${total}`;
};

// 場站數 2.0E
const setTreeStation20E = (data) => {
  let treedata = [];
  let total = 0;
  data.forEach((item) => {
    if (item.city.includes("2.0E")) {
      let city = item.city.replace("2.0E", "");
      treedata.push({ name: `${city}:${item.current_station}` });
      total += item.current_station;
    }
  });
  data_station20E.value = [...treedata];
  title_station20E.value = `總站數:${total}`;
};

// 車輛數 2.0
const setTreeBike20 = (data) => {
  let treedata = [];
  let total = 0;
  data.forEach((item) => {
    if (!item.city.includes("2.0E") && item.city.includes("2.0")) {
      let city = item.city.replace("2.0", "");
      treedata.push({ name: `${city}:${item.bike_number}` });
      total += item.bike_number;
    }
  });
  data_bike20.value = [...treedata];
  title_bike20.value = `總車輛數:${total}`;
};

// 車輛數 2.0E
const setTreeBike20E = (data) => {
  let treedata = [];
  let total = 0;
  data.forEach((item) => {
    if (item.city.includes("2.0E")) {
      let city = item.city.replace("2.0E", "");
      treedata.push({ name: `${city}:${item.bike_number}` });
      total += item.bike_number;
    }
  });
  data_bike20E.value = [...treedata];
  title_bike20E.value = `總車輛數:${total}`;
};

// 車柱數 (動態取代寫死陣列，2.0與2.0E共用同一個結果)
const setTreePole = (data) => {
  if (data.length <= 1) return;
  const index = data[0].indexOf("總停車位");
  let treedata = [];
  let total = 0;

  for (let i = 1; i < data.length; i++) {
    const cityName = editName(data[i][1]); 
    const val = data[i][index] || 0;

    if (val !== 0) {
      treedata.push({ name: `${cityName}:${val}` });
      total += val;
    }
  }

  data_pole.value = [...treedata];
  title_pole.value = `總車柱數:${total}`;
};
</script>

<style lang="scss" scoped></style>