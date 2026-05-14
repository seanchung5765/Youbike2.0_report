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
// 🌟 統一使用我們封裝好的 API 模組
import { getCityList } from "@/api/station"; 
import { getGcpReport } from "@/api/report"; 
import CityBarcharComponent from "../CityBarcharComponent.vue";
import { useUserStore } from "../../stores/userdata";

const store = useUserStore();
const canusecitys = store.citys || [];

// 🌟 動態產生的對照表與基礎縣市清單 (完全消滅手寫)
const cityMap = {}; 
const baseCities = ref([]);

const data1 = ref([]); const date1 = ref([]);
const data2 = ref([]); const date2 = ref([]);
const data3 = ref([]); const date3 = ref([]);
const data4 = ref([]); const date4 = ref([]);

// --- 幫助函式 ---
function getLastMonDateFormatted(week = 1, day = 1) {
  const date = new Date();
  date.setDate(date.getDate() - week * 7 - date.getDay() + day);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
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

// 產生空資料的模板函式 (改用動態的 baseCities)
const initChartData = (weeks = 4) => baseCities.value.map(city => ({ city, value: new Array(weeks).fill(0) }));

// --- API 與圖表處理邏輯 ---
const getonedaydata = async () => {
  let city1 = [], city2 = [], city3 = [], city4 = [];

  try {
    // 🌟 1. 從後端撈取縣市清單
    const resCities = await getCityList();
    const allCitiesFromDB = resCities.data.data || [];

    // 🌟 2. 根據權限動態組裝參數與中英對照表
    allCitiesFromDB.forEach(cityData => {
      // 如果沒權限，或是資料庫沒設英文代碼，直接跳過
      if (!canusecitys.includes(cityData.id) || !cityData.codes) return;

      // 紀錄有權限的中文縣市，確保長條圖能依序畫出
      baseCities.value.push(cityData.name); 

      // 拆解代碼 (例如: "Newtaipei,Newtaipei2")
      const codesArr = cityData.codes.split(",");
      codesArr.forEach(code => {
        code = code.trim();
        cityMap[code] = cityData.name; // 動態建立 1.0/2.0 的對照表

        if (code.endsWith("2")) {
          // 👉 這是 2.0 的代碼 (例: Taipei2)
          city3.push(code); 
          
          const code2E = `${code}E`;
          city4.push(code2E); // 自動產生 2.0E 代碼 (例: Taipei2E)
          cityMap[code2E] = cityData.name; // 將 2.0E 加入對照表

          city1.push(`${cityData.name}2.0`, `${cityData.name}2.0E`);
        } else {
          // 👉 這是 1.0 的代碼 (例: Newtaipei)
          city2.push(code); 
          city1.push(cityData.name); 
        }
      });
    });

    // 防呆：如果完全沒權限，就不要去打 GCP 了
    if (baseCities.value.length === 0) return;

    // 去除 city1 的重複項目 (保險起見)
    city1 = [...new Set(city1)];

    // 🌟 3. 打 API 取報表
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

  const sortedDates = Array.from(dateSet).sort();
  // 改用 baseCities.value
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
  // 改用 baseCities.value
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