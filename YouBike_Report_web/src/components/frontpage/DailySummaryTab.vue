<template>
  <div class="container-fluid p-0">
    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <TreecharComponent title="2.0 場站數" :date="yesterdaydate" :treetitle="treetitle7" :data="data7" />
      </div>
      <div class="col-md-6">
        <TreecharComponent title="2.0 車柱數" :date="yesterdaydate" :treetitle="treetitle12" :data="data12" />
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <TreecharComponent title="2.0 車輛數" :date="yesterdaydate" :treetitle="treetitle9" :data="data9" />
      </div>
      <div class="col-md-6">
        <TreecharComponent title="2.0E 車輛數" :date="yesterdaydate" :treetitle="treetitle10" :data="data10" />
      </div>
    </div>

    <hr class="my-4" />

    <div class="row g-3 mb-4">
      <div class="col-12 mb-2">
        <PiechartComponent :data="data1" title="騎乘次數 (全系統總計)" :secondtitle="yesterdaydate" />
      </div>
      <div class="col-md-6">
        <PiechartComponent :data="data3" title="2.0 騎乘分佈" :secondtitle="yesterdaydate" />
      </div>
      <div class="col-md-6">
        <PiechartComponent :data="data4" title="2.0E 騎乘分佈" :secondtitle="yesterdaydate" />
      </div>
    </div>

    <div class="row g-3">
      <div class="col-12">
        <BarchartComponent :data="data5" :date="date5" />
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
import { getCityList } from "@/api/station";
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];
const yesterdaydate = ref("");

const data1 = ref([]); const data3 = ref([]); const data4 = ref([]); 
const data5 = ref([]); const date5 = ref([]); 
const data7 = ref([]); const treetitle7 = ref(""); 
const data9 = ref([]); const treetitle9 = ref(""); 
const data10 = ref([]); const treetitle10 = ref(""); 
const data12 = ref([]); const treetitle12 = ref(""); 

const getday = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const CITY_MAP = ref({});
const validCityLabels = ref([]); 
const validCityKeys = ref([]);   

const loadCityConfig = async () => {
  try {
    const res = await getCityList(); // 🌟 改用封裝的 API
    const allCitiesFromDB = res.data.data || [];

    allCitiesFromDB.forEach(city => {
      if (city.codes) {
        CITY_MAP.value[city.codes] = city.name;
      }

      if (canusecitys.includes(city.id)) {
        validCityLabels.value.push(`${city.name}2.0`, `${city.name}2.0E`); 
        if (city.codes) {
          validCityKeys.value.push(city.codes);
        }
      }
    });

  } catch (error) {
    console.error("無法載入縣市設定檔:", error);
  }
};

const editName = (name) => CITY_MAP.value[name] || name;

const buildTreeData = (list, key, suffix) => {
  const data = list.map(i => ({ name: `${i.city.replace(suffix, "")}:${i[key]}` }));
  const total = list.reduce((sum, item) => sum + item[key], 0);
  return { data, total };
};

const fetchData = async () => {
  yesterdaydate.value = getday(1);

  if (validCityLabels.value.length === 0) return;

  try {
    // 🌟 改用封裝的 API
    const [resSummary, resTrend, resPole] = await Promise.all([
      getGcpReport({ dataset_id: "founder_report", table_id: "daily_summary_Taiwan", begin_date: getday(1), end_date: getday(1), city: validCityLabels.value }),
      getGcpReport({ dataset_id: "founder_report", table_id: "daily_summary_Taiwan", begin_date: getday(7), end_date: getday(1), city: ["台灣合計"] }),
      getGcpReport({ dataset_id: "report", table_id: "daily_report_query2", begin_date: getday(1), end_date: getday(1), city: validCityKeys.value })
    ]);

    const rawData = resSummary.data.data || [];
    const data20List = rawData.filter(i => i.city.includes("2.0") && !i.city.includes("2.0E"));
    const data20EList = rawData.filter(i => i.city.includes("2.0E"));

    const total20 = data20List.reduce((sum, i) => sum + i.rent_number, 0);
    const total20E = data20EList.reduce((sum, i) => sum + i.rent_number, 0);
    
    data1.value = [{ name: "YB2.0", value: total20 }, { name: "YB2.0E", value: total20E }];
    data3.value = data20List.map(i => ({ name: i.city.replace("2.0", ""), value: i.rent_number }));
    data4.value = data20EList.map(i => ({ name: i.city.replace("2.0E", ""), value: i.rent_number }));

    const tree7 = buildTreeData(data20List, "current_station", "2.0");
    data7.value = tree7.data;
    treetitle7.value = `總站數:${tree7.total}`;

    const tree9 = buildTreeData(data20List, "bike_number", "2.0");
    data9.value = tree9.data;
    treetitle9.value = `總車輛數:${tree9.total}`;

    const tree10 = buildTreeData(data20EList, "bike_number", "2.0E");
    data10.value = tree10.data;
    treetitle10.value = `總車輛數:${tree10.total}`;

    const trendData = resTrend.data.data || [];
    data5.value = trendData.map(i => i.rent_number);
    date5.value = trendData.map(i => {
      const d = new Date(i.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });

    const poleRaw = resPole.data.data || [];
    if (poleRaw.length > 1) {
      const idx = poleRaw[0].indexOf("總停車位");
      if (idx !== -1) {
        const poleData = poleRaw.slice(1).map(item => ({
          name: `${editName(item[1])}:${item[idx]}`,
          value: item[idx] || 0
        }));
        data12.value = poleData;
        treetitle12.value = `總車柱數:${poleData.reduce((sum, item) => sum + item.value, 0)}`;
      }
    }

  } catch (err) {
    console.error("Fetch error:", err);
  }
};

onMounted(async () => {
  await loadCityConfig();
  await fetchData();
});
</script>