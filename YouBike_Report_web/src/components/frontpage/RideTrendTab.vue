<template>
  <div>
    <div class="row">
      <div class="px-1 py-1">
        <CityBarcharComponent :data="data1" :date="date1" name="騎乘次數(近七天)" />
      </div>
    </div>
    <div class="row">
      <div class="px-1 py-1">
        <CityBarcharComponent :data="data2" :date="date2" name="騎乘次數(近四週)" />
      </div>
    </div>
    <div class="row">
      <div class="px-1 py-1">
        <CityBarcharComponent :data="data3" :date="date3" name="平日騎乘次數(近四週)" />
      </div>
    </div>
    <div class="row">
      <div class="px-1 py-1">
        <CityBarcharComponent :data="data4" :date="date4" name="假日騎乘次數(近四週)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getCityList } from "@/api/station"; 
import { getGcpReport } from "@/api/report"; 
import CityBarcharComponent from "../CityBarcharComponent.vue";
import { useUserStore } from "../../stores/userdata";

const store = useUserStore();
const canusecitys = store.citys || [];

const cityMap = {}; 
const baseCities = ref([]);

const data1 = ref([]); const date1 = ref([]);
const data2 = ref([]); const date2 = ref([]);
const data3 = ref([]); const date3 = ref([]);
const data4 = ref([]); const date4 = ref([]);

// --- 幫助函式 ---
// 🚀 關鍵修正 1：月份跟日期強制補零，避免字串排序時 '10' 排在 '3' 前面
function getLastMonDateFormatted(week = 1, day = 1) {
  const date = new Date();
  date.setDate(date.getDate() - week * 7 - date.getDay() + day);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${d}`;
}

const getday = (whatday) => {
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - whatday);
  let year = yesterday.getFullYear();
  let month = String(yesterday.getMonth() + 1).padStart(2, "0");
  let day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const chineseCharacters = (text) => text.match(/[\u4e00-\u9fa5]+/g)?.[0] || text;
const isWeekend = (item) => item[3] === "日" || item[3] === "六";

const initChartData = (weeks = 4) => baseCities.value.map(city => ({ city, value: new Array(weeks).fill(0) }));

// --- API 與圖表處理邏輯 ---
const getonedaydata = async () => {
  let city1 = [], city2 = [], city3 = [], city4 = [];

  try {
    const resCities = await getCityList();
    const allCitiesFromDB = resCities.data.data || [];

    allCitiesFromDB.forEach(cityData => {
      if (!canusecitys.includes(cityData.id) || !cityData.codes) return;

      baseCities.value.push(cityData.name); 

      const codesArr = cityData.codes.split(",");
      codesArr.forEach(code => {
        code = code.trim();
        cityMap[code] = cityData.name; 

        if (code.endsWith("2")) {
          city3.push(code); 
          const code2E = `${code}E`;
          city4.push(code2E); 
          cityMap[code2E] = cityData.name; 
          city1.push(`${cityData.name}2.0`, `${cityData.name}2.0E`);
        } else {
          city2.push(code); 
          city1.push(cityData.name); 
        }
      });
    });

    if (baseCities.value.length === 0) return;

    city1 = [...new Set(city1)];

    const res = await Promise.all([
      getGcpReport({ dataset_id: "founder_report", table_id: "daily_summary_Taiwan", begin_date: getday(7), end_date: getday(1), city: city1 }),
      getGcpReport({ dataset_id: "report", table_id: `weekly_report_query1`, date: getLastMonDateFormatted(), city: city2 }),
      getGcpReport({ dataset_id: "report", table_id: `weekly_report_query2`, date: getLastMonDateFormatted(), city: city3 }),
      getGcpReport({ dataset_id: "report", table_id: `weekly_report_query2E`, date: getLastMonDateFormatted(), city: city4 }),
      getGcpReport({ dataset_id: "report", table_id: "daily_report_query1", begin_date: getLastMonDateFormatted(4, 1), end_date: getLastMonDateFormatted(1, 7), city: city2 }),
      getGcpReport({ dataset_id: "report", table_id: "daily_report_query2", begin_date: getLastMonDateFormatted(4, 1), end_date: getLastMonDateFormatted(1, 7), city: city3 }),
      getGcpReport({ dataset_id: "report", table_id: "daily_report_query2E", begin_date: getLastMonDateFormatted(4, 1), end_date: getLastMonDateFormatted(1, 7), city: city4 }),
    ]);

    setBarimg1(res[0].data.data);
    setBarimg2(res[1].data.data, res[2].data.data, res[3].data.data);
    setBarimg3(res[4].data.data, res[5].data.data, res[6].data.data);
    setBarimg4(res[4].data.data, res[5].data.data, res[6].data.data);

  } catch (error) {
    console.error("騎乘數據載入失敗:", error);
  }
};

onMounted(() => { getonedaydata(); });

// 圖表 1：近七天騎乘次數
const setBarimg1 = (data) => {
  if (!data?.length) return;
  const grouped = {};
  const dateSet = new Set();

  data.forEach(item => {
    dateSet.add(item.date);
    const cName = chineseCharacters(item.city);
    if (!grouped[cName]) grouped[cName] = {};
    grouped[cName][item.date] = (grouped[cName][item.date] || 0) + item.rent_number;
  });

  // 🚀 關鍵修正 2：強制用時間戳記來算大小，避免一切字串排序造成的錯亂
  const sortedDates = Array.from(dateSet).sort((a, b) => new Date(a) - new Date(b));
  
  data1.value = baseCities.value.map(city => {
    if (!grouped[city]) return null;
    const values = sortedDates.map(date => grouped[city][date] || 0);
    return values.some(v => v > 0) ? { city, value: values } : null;
  }).filter(Boolean);

  date1.value = sortedDates.map(d => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  });
};

// 共用日期格式 (近四週)
const getFourWeekLabels = () => [
  `${getLastMonDateFormatted(4, 1)}~${getLastMonDateFormatted(4, 7)}`,
  `${getLastMonDateFormatted(3, 1)}~${getLastMonDateFormatted(3, 7)}`,
  `${getLastMonDateFormatted(2, 1)}~${getLastMonDateFormatted(2, 7)}`,
  `${getLastMonDateFormatted(1, 1)}~${getLastMonDateFormatted(1, 7)}`,
];

// 圖表 2：近四周騎乘次數
const setBarimg2 = (...datasets) => {
  let totalarr = initChartData(4);

  datasets.forEach(data => {
    if (!data?.length || data.length <= 1) return;
    const headerRow = data[0][0] || data[0];
    const idx = headerRow.indexOf("當週/日租借車次");
    if (idx === -1) return;

    data.forEach((item, index) => {
      if (index === 0 || !item[1]) return;
      const mappedCity = cityMap[item[1][1]];
      if (mappedCity) {
        const target = totalarr.find(t => t.city === mappedCity);
        if (target) {
          [1, 2, 3, 4].forEach(week => {
            target.value[week - 1] += item[week]?.[idx] || 0;
          });
        }
      }
    });
  });

  data2.value = totalarr.filter(item => item.value.some(v => v > 0));
  date2.value = getFourWeekLabels();
};

// 處理平日 / 假日共用邏輯
const processDailyData = (datasets, isWeekendMode) => {
  let tempMap = {};
  baseCities.value.forEach(c => (tempMap[c] = []));

  datasets.forEach(data => {
    if (!data?.length || data.length <= 1) return;
    const idx = data[0].indexOf("當日租借車次");
    if (idx === -1) return;

    data.forEach((item, index) => {
      if (index === 0) return;
      const mappedCity = cityMap[item[1]];
      if (mappedCity && ((isWeekendMode && isWeekend(item)) || (!isWeekendMode && !isWeekend(item)))) {
        tempMap[mappedCity].push(item[idx] || 0);
      }
    });
  });

  let totalarr = initChartData(4);
  const chunkSize = isWeekendMode ? 2 : 5; 

  totalarr.forEach(target => {
    tempMap[target.city].forEach((val, i) => {
      const weekIndex = Math.floor(i / chunkSize);
      if (weekIndex >= 0 && weekIndex < 4) {
        target.value[weekIndex] += val;
      }
    });
  });

  return totalarr.filter(item => item.value[0] !== 0);
};

// 圖表 3：平日騎乘次數
const setBarimg3 = (...datasets) => {
  data3.value = processDailyData(datasets, false);
  date3.value = getFourWeekLabels();
};

// 圖表 4：假日騎乘次數
const setBarimg4 = (...datasets) => {
  data4.value = processDailyData(datasets, true);
  date4.value = getFourWeekLabels();
};
</script>