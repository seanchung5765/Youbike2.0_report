<template>
  <div class="container-fluid p-0">
    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <TreecharComponent
          title="2.0 場站數"
          :date="yesterdaydate"
          :treetitle="treetitle7"
          :data="data7"
        ></TreecharComponent>
      </div>
      <div class="col-md-6">
        <TreecharComponent
          title="2.0 車柱數"
          :date="yesterdaydate"
          :treetitle="treetitle12"
          :data="data12"
        ></TreecharComponent>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <TreecharComponent
          title="2.0 車輛數"
          :date="yesterdaydate"
          :treetitle="treetitle9"
          :data="data9"
        ></TreecharComponent>
      </div>
      <div class="col-md-6">
        <TreecharComponent
          title="2.0E 車輛數"
          :date="yesterdaydate"
          :treetitle="treetitle10"
          :data="data10"
        ></TreecharComponent>
      </div>
    </div>

    <hr class="my-4" />

    <div class="row g-3 mb-4">
      <div class="col-12 mb-2">
        <PiechartComponent
          :data="data1"
          title="騎乘次數 (全系統總計)"
          :secondtitle="yesterdaydate"
        ></PiechartComponent>
      </div>
      <div class="col-md-6">
        <PiechartComponent
          :data="data3"
          title="2.0 騎乘分佈"
          :secondtitle="yesterdaydate"
        ></PiechartComponent>
      </div>
      <div class="col-md-6">
        <PiechartComponent
          :data="data4"
          title="2.0E 騎乘分佈"
          :secondtitle="yesterdaydate"
        ></PiechartComponent>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-12">
        <BarchartComponent :data="data5" :date="date5"></BarchartComponent>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useUserStore } from "../../stores/userdata";
import PiechartComponent from "../../components/PiechartComponent.vue";
import BarchartComponent from "../../components/BarcharComponent.vue";
import TreecharComponent from "../../components/TreecharComponent.vue";

const store = useUserStore();
const canusecitys = store.citys;
const yesterdaydate = ref("");

// --- 響應式數據定義 ---
const data1 = ref([]), data3 = ref([]), data4 = ref([]); // 圓餅圖
const data5 = ref([]), date5 = ref([]); // 長條圖
const data7 = ref([]), treetitle7 = ref(""); // 2.0 場站
const data9 = ref([]), treetitle9 = ref(""); // 2.0 車輛
const data10 = ref([]), treetitle10 = ref(""); // 2.0E 車輛
const data12 = ref([]), treetitle12 = ref(""); // 2.0 車柱

// --- 核心工具函數 ---
const getday = (daysAgo) => {
  let d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const CITY_MAP = {
  'Taipei2': '台北市', 'Newtaipei2': '新北市', 'Taoyuan2': '桃園市',
  'Hsinchu_Country2': '新竹縣', 'Hsinchu2': '新竹市', 'HsinchuScience2': '竹科',
  'Miaoli2': '苗栗縣', 'Taichung2': '台中市', 'Chiayi_Country2': '嘉義縣',
  'Chiayi2': '嘉義市', 'Tainan2': '台南市', 'Kaohsiung2': '高雄市',
  'Pingtung2': '屏東縣', 'Taitung2': '台東縣'
};

const editName = (name) => CITY_MAP[name] || name;

// --- 資料抓取與處理 ---
const fetchData = async () => {
  yesterdaydate.value = getday(1);
  const cityLabels = [], cityKeys3 = [];

  // 根據權限組合城市清單 (排除 1.0)
  const configMap = {
    2: { label: ["台北市2.0", "台北市2.0E"], key: "Taipei2" },
    3: { label: ["新北市2.0", "新北市2.0E"], key: "Newtaipei2" },
    4: { label: ["桃園市2.0", "桃園市2.0E"], key: "Taoyuan2" },
    6: { label: ["新竹縣2.0", "新竹縣2.0E"], key: "Hsinchu_Country2" },
    5: { label: ["新竹市2.0", "新竹市2.0E"], key: "Hsinchu2" },
    20:{ label: ["竹科2.0", "竹科2.0E"], key: "HsinchuScience2" },
    7: { label: ["苗栗縣2.0", "苗栗縣2.0E"], key: "Miaoli2" },
    8: { label: ["台中市2.0", "台中市2.0E"], key: "Taichung2" },
    12:{ label: ["嘉義市2.0", "嘉義市2.0E"], key: "Chiayi_Country2" },
    13:{ label: ["嘉義縣2.0", "嘉義縣2.0E"], key: "Chiayi2" },
    14:{ label: ["台南市2.0", "台南市2.0E"], key: "Tainan2" },
    15:{ label: ["高雄市2.0", "高雄市2.0E"], key: "Kaohsiung2" },
    16:{ label: ["屏東縣2.0", "屏東縣2.0E"], key: "Pingtung2" },
    19:{ label: ["台東縣2.0", "台東縣2.0E"], key: "Taitung2" }
  };

  canusecitys.forEach(id => {
    if (configMap[id]) {
      cityLabels.push(...configMap[id].label);
      cityKeys3.push(configMap[id].key);
    }
  });

  const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;

  try {
    const [resSummary, resTrend, resPole] = await Promise.all([
      axios.get(url, { params: { dataset_id: "founder_report", table_id: "daily_summary_Taiwan", begin_date: getday(1), end_date: getday(1), city: cityLabels } }),
      axios.get(url, { params: { dataset_id: "founder_report", table_id: "daily_summary_Taiwan", begin_date: getday(7), end_date: getday(1), city: ["台灣合計"] } }),
      axios.get(url, { params: { dataset_id: "report", table_id: "daily_report_query2", begin_date: getday(1), end_date: getday(1), city: cityKeys3 } })
    ]);

    const rawData = resSummary.data.data;

    // 1. 處理全系統圓餅圖 (僅留 2.0 / 2.0E)
    const total20 = rawData.filter(i => i.city.includes("2.0") && !i.city.includes("2.0E")).reduce((a, b) => a + b.rent_number, 0);
    const total20E = rawData.filter(i => i.city.includes("2.0E")).reduce((a, b) => a + b.rent_number, 0);
    data1.value = [{ name: "YB2.0", value: total20 }, { name: "YB2.0E", value: total20E }];

    // 2. 處理 2.0 騎乘與 2.0E 騎乘分佈
    data3.value = rawData.filter(i => i.city.includes("2.0") && !i.city.includes("2.0E")).map(i => ({ name: i.city.replace("2.0", ""), value: i.rent_number }));
    data4.value = rawData.filter(i => i.city.includes("2.0E")).map(i => ({ name: i.city.replace("2.0E", ""), value: i.rent_number }));

    // 3. 處理 2.0 場站與車輛數 (Tree圖)
    const data20List = rawData.filter(i => i.city.includes("2.0") && !i.city.includes("2.0E"));
    data7.value = data20List.map(i => ({ name: `${i.city.replace("2.0","")}:${i.current_station}` }));
    treetitle7.value = `總站數:${data20List.reduce((a, b) => a + b.current_station, 0)}`;

    data9.value = data20List.map(i => ({ name: `${i.city.replace("2.0","")}:${i.bike_number}` }));
    treetitle9.value = `總車輛數:${data20List.reduce((a, b) => a + b.bike_number, 0)}`;

    // 4. 處理 2.0E 車輛數
    const data20EList = rawData.filter(i => i.city.includes("2.0E"));
    data10.value = data20EList.map(i => ({ name: `${i.city.replace("2.0E","")}:${i.bike_number}` }));
    treetitle10.value = `總車輛數:${data20EList.reduce((a, b) => a + b.bike_number, 0)}`;

    // 5. 處理趨勢圖
    data5.value = resTrend.data.data.map(i => i.rent_number);

        // 強制轉換為 yyyy-mm-dd
    date5.value = resTrend.data.data.map(i => {
      const d = new Date(i.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    // 6. 處理 2.0 車柱 (Pole)
    const poleRaw = resPole.data.data;
    if (poleRaw.length > 1) {
      const idx = poleRaw[0].indexOf("總停車位");
      const poleData = poleRaw.slice(1).map(item => ({
        name: `${editName(item[1])}:${item[idx]}`,
        value: item[idx]
      }));
      data12.value = poleData;
      treetitle12.value = `總車柱數:${poleData.reduce((a, b) => a + b.value, 0)}`;
    }

  } catch (err) {
    console.error("Fetch error:", err);
  }
};

onMounted(fetchData);
</script>