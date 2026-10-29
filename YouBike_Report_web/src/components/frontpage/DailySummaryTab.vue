<template>
  <div class="container-fluid px-2 py-2">
    <!-- 上方：篩選區塊 -->
    <div class="filter-section mb-3 p-3 bg-white text-dark rounded shadow-sm border">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="mb-0 font-weight-bold" style="color: #00638a;">請選擇要在地圖視窗顯示的數據：</h5>
      </div>
      
      <!-- 單日與歷史數據勾選框 -->
      <div class="d-flex flex-wrap align-items-center mt-2">
        <div class="mr-4" style="border-right: 2px solid #eee; padding-right: 15px;">
          <span style="color: #00638a; font-weight: bold; font-size: 14px; margin-right: 10px;">單日數據:</span>
          <el-checkbox-group v-model="selectedMetrics" class="custom-checkboxes d-inline-block">
            <el-checkbox label="station">場站數</el-checkbox>
            <el-checkbox label="pole">車柱數</el-checkbox>
            <el-checkbox label="bike20">2.0 車輛數</el-checkbox>
            <el-checkbox label="bike20E">2.0E 車輛數</el-checkbox>
            <el-checkbox label="ride20">2.0 騎乘數</el-checkbox>
            <el-checkbox label="ride20E">2.0E 騎乘數</el-checkbox>
          </el-checkbox-group>
        </div>
        <div style="padding-left: 15px;">
          <span style="color: #d84485; font-weight: bold; font-size: 14px; margin-right: 10px;">歷史總計:</span>
          <el-checkbox-group v-model="selectedMetrics" class="custom-checkboxes-history d-inline-block">
            <el-checkbox label="ride7Days">近七天騎乘</el-checkbox>
            <el-checkbox label="ride4Weeks">近四週騎乘</el-checkbox>
            <el-checkbox label="ride4WeeksWeekday">近四週平日騎乘</el-checkbox>
            <el-checkbox label="ride4WeeksWeekend">近四週假日騎乘</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>

    <!-- 中間：地圖區塊 -->
    <div class="row mb-3">
      <div class="col-12 position-relative">
        <div
          ref="mapContainer"
          style="width: 100%; height: 1150px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); overflow: hidden;"
        ></div>

        <!-- 🕒 左下角：固定顯示前一天 09:10 的最後更新時間 -->
        <div
          style="position: absolute; bottom: 25px; left: 25px; z-index: 10; color: #00638a; font-weight: bold; font-size: 15px; background: rgba(255,255,255,0.95); padding: 6px 14px; border-radius: 6px; border: 1.5px solid #00638a; box-shadow: 0 2px 6px rgba(0,0,0,0.1);"
        >
          更新時間：{{ lastUpdateTime }}
        </div>
      </div>
    </div>

    <!-- 下方：近七天騎乘數長條圖 -->
    <div class="row">
      <div class="col-12">
        <div class="p-3 bg-white rounded shadow-sm border" style="border-radius: 12px;">
          <div ref="barChartContainer" style="width: 100%; height: 380px;"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, markRaw } from "vue";
import { useUserStore } from "../../stores/userdata";
import * as echarts from "echarts";
import taiwanGeoJson from "@/assets/taiwan.json"; 
import { getCityList } from "@/api/station";
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];

const mapContainer = ref(null);
const barChartContainer = ref(null); 
let myChart = null;
let barChartInstance = null; 

const selectedMetrics = ref([
  "station", "pole", "bike20", "bike20E", "ride20", "ride20E"
]);

const cityDataMap = ref({});
const lastUpdateTime = ref("");
const updateTimeStatus = ref("");
const customCardPositions = {};

const formatNum = (num) => {
  if (num === undefined || num === null) return "0";
  return Number(num).toLocaleString("en-US");
};

// 🚀 取得「前一天的 09:10」作為統一更新時間
const getYesterday0910Str = () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1); // 往前推一天
  
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day} 09:10`;
};

const getday = (whatday) => {
  let today = new Date();
  let targetDate = new Date(today);
  targetDate.setDate(today.getDate() - whatday);
  let year = targetDate.getFullYear();
  let month = String(targetDate.getMonth() + 1).padStart(2, "0");
  let day = String(targetDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function getLastMonDateFormatted(week = 1, day = 1) {
  const date = new Date();
  date.setDate(date.getDate() - week * 7 - date.getDay() + day);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${d}`;
}

const chineseCharacters = (text) => text.match(/[\u4e00-\u9fa5]+/g)?.[0] || text;
const isWeekend = (item) => item[3] === "日" || item[3] === "六";

// 🚀 時間守門員：判斷目前是否已超過 09:10
const checkTargetDayOffset = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  if (hour < 9 || (hour === 9 && minute < 10)) {
    return 2; 
  } else {
    return 1;
  }
};

const querySummary = ref([]);
const queryPole2 = ref([]);
const CITY_MAP = ref({});

const editName = (code) => {
  return CITY_MAP.value[code] || code;
};

const normalizeCityName = (name) => {
  if (!name) return "";
  return name.trim().replace("臺", "台").replace("桃園縣", "桃園市");
};

const initCityData = (cityName) => {
  const normName = normalizeCityName(cityName);
  if (!cityDataMap.value[normName]) {
    cityDataMap.value[normName] = {
      station: 0, pole: 0,
      bike20: 0, bike20E: 0,
      ride20: 0, ride20E: 0,
      ride7Days: 0, ride4Weeks: 0, 
      ride4WeeksWeekday: 0, ride4WeeksWeekend: 0
    };
  }
};

const getonedaydata = async () => {
  try {
    const dayOffset = checkTargetDayOffset();
    
    // 🚀 設定左下角統一更新時間為前一天的 09:10
    lastUpdateTime.value = getYesterday0910Str();

    const cityRes = await getCityList();
    const dbCities = cityRes.data?.data || [];
    
    let city1 = [], city2 = [], city3 = [], city4 = [];

    dbCities.forEach(c => {
      if (canusecitys.includes(c.id || c.city_id)) {
        const rawCode = c.codes ? c.codes.split(',')[0].trim() : '';
        const cleanBaseCode = rawCode.replace(/2E$/i, '').replace(/2$/i, '');
        const rawCityName = c.city_name || c.name;
        const cityName = normalizeCityName(rawCityName);

        querySummary.value.push(rawCityName);
        querySummary.value.push(`${rawCityName}2.0`);
        querySummary.value.push(`${rawCityName}2.0E`);
        queryPole2.value.push(`${cleanBaseCode}2`);

        CITY_MAP.value[cleanBaseCode] = cityName;
        CITY_MAP.value[`${cleanBaseCode}2`] = cityName;
        CITY_MAP.value[`${cleanBaseCode}2E`] = cityName;
        
        initCityData(cityName);

        if (c.codes) {
          const codesArr = c.codes.split(",");
          codesArr.forEach(code => {
            code = code.trim();
            if (code.endsWith("2")) {
              city3.push(code); 
              const code2E = `${code}E`;
              city4.push(code2E); 
              city1.push(`${rawCityName}2.0`, `${rawCityName}2.0E`);
            } else {
              city2.push(code); 
              city1.push(rawCityName); 
            }
          });
        }
      }
    });

    if (querySummary.value.length === 0) return;
    city1 = [...new Set(city1)];

    const [
      resSummary1, resPole2, resSummary7,
      resHist7Days, resHist4Weeks1, resHist4Weeks2, resHist4Weeks2E, 
      resHistDaily1, resHistDaily2, resHistDaily2E
    ] = await Promise.all([
      getGcpReport({ dataset_id: "founder_report", table_id: "daily_summary_Taiwan", begin_date: getday(dayOffset), end_date: getday(dayOffset), city: querySummary.value }),
      getGcpReport({ dataset_id: "report", table_id: "daily_report_query2", begin_date: getday(dayOffset), end_date: getday(dayOffset), city: queryPole2.value }),
      getGcpReport({ dataset_id: "founder_report", table_id: "daily_summary_Taiwan", begin_date: getday(dayOffset + 6), end_date: getday(dayOffset), city: ["台灣合計"] }),
      
      getGcpReport({ dataset_id: "founder_report", table_id: "daily_summary_Taiwan", begin_date: getday(dayOffset + 6), end_date: getday(dayOffset), city: city1 }),
      getGcpReport({ dataset_id: "report", table_id: `weekly_report_query1`, date: getLastMonDateFormatted(), city: city2 }),
      getGcpReport({ dataset_id: "report", table_id: `weekly_report_query2`, date: getLastMonDateFormatted(), city: city3 }),
      getGcpReport({ dataset_id: "report", table_id: `weekly_report_query2E`, date: getLastMonDateFormatted(), city: city4 }),
      getGcpReport({ dataset_id: "report", table_id: "daily_report_query1", begin_date: getLastMonDateFormatted(4, 1), end_date: getLastMonDateFormatted(1, 7), city: city2 }),
      getGcpReport({ dataset_id: "report", table_id: "daily_report_query2", begin_date: getLastMonDateFormatted(4, 1), end_date: getLastMonDateFormatted(1, 7), city: city3 }),
      getGcpReport({ dataset_id: "report", table_id: "daily_report_query2E", begin_date: getLastMonDateFormatted(4, 1), end_date: getLastMonDateFormatted(1, 7), city: city4 }),
    ]);

    const summaryData1 = resSummary1.data?.data || [];
    const pole2Data = resPole2.data?.data || [];
    const summaryData7 = resSummary7.data?.data || [];

    summaryData1.forEach(item => {
      let is20E = item.city.includes("2.0E");
      let is20 = !is20E && item.city.includes("2.0");
      let cityName = normalizeCityName(item.city.replace("2.0E", "").replace("2.0", ""));

      initCityData(cityName);
      cityDataMap.value[cityName].station += item.current_station || 0;
      if (is20E) {
        cityDataMap.value[cityName].bike20E += item.bike_number || 0;
        cityDataMap.value[cityName].ride20E += item.rent_number || 0;
      } else if (is20) {
        cityDataMap.value[cityName].bike20 += item.bike_number || 0;
        cityDataMap.value[cityName].ride20 += item.rent_number || 0;
      }
    });

    if (pole2Data.length > 1) {
      const index = pole2Data[0].indexOf("總停車位");
      for (let i = 1; i < pole2Data.length; i++) {
        const cityName = normalizeCityName(editName(pole2Data[i][1]));
        const val = pole2Data[i][index] || 0;
        if (cityDataMap.value[cityName]) {
          cityDataMap.value[cityName].pole += val;
        }
      }
    }

    const hist7DaysData = resHist7Days.data?.data || [];
    hist7DaysData.forEach(item => {
      const cName = normalizeCityName(chineseCharacters(item.city));
      if (cityDataMap.value[cName]) {
        cityDataMap.value[cName].ride7Days += item.rent_number || 0;
      }
    });

    const process4WeeksTotal = (...datasets) => {
      datasets.forEach(data => {
        if (!data?.length || data.length <= 1) return;
        const headerRow = data[0][0] || data[0];
        const idx = headerRow.indexOf("當週/日租借車次");
        if (idx === -1) return;

        data.forEach((item, index) => {
          if (index === 0 || !item[1]) return;
          const mappedCity = normalizeCityName(CITY_MAP.value[item[1][1]]);
          if (mappedCity && cityDataMap.value[mappedCity]) {
            let totalForCity = 0;
            [1, 2, 3, 4].forEach(week => { totalForCity += item[week]?.[idx] || 0; });
            cityDataMap.value[mappedCity].ride4Weeks += totalForCity;
          }
        });
      });
    };
    process4WeeksTotal(resHist4Weeks1.data?.data, resHist4Weeks2.data?.data, resHist4Weeks2E.data?.data);

    const processDailyTotal = (datasets, isWeekendMode) => {
      datasets.forEach(data => {
        if (!data?.length || data.length <= 1) return;
        const idx = data[0].indexOf("當日租借車次");
        if (idx === -1) return;

        data.forEach((item, index) => {
          if (index === 0) return;
          const mappedCity = normalizeCityName(CITY_MAP.value[item[1]]);
          if (mappedCity && cityDataMap.value[mappedCity]) {
            if ((isWeekendMode && isWeekend(item)) || (!isWeekendMode && !isWeekend(item))) {
              if (isWeekendMode) {
                cityDataMap.value[mappedCity].ride4WeeksWeekend += item[idx] || 0;
              } else {
                cityDataMap.value[mappedCity].ride4WeeksWeekday += item[idx] || 0;
              }
            }
          }
        });
      });
    };
    processDailyTotal([resHistDaily1.data?.data, resHistDaily2.data?.data, resHistDaily2E.data?.data], false); 
    processDailyTotal([resHistDaily1.data?.data, resHistDaily2.data?.data, resHistDaily2E.data?.data], true);  

    renderMap();
    renderBarChart(summaryData7);
  } catch (error) {
    console.error("Dashboard 取資料失敗:", error);
  }
};

const syncDraggedCardPositions = () => {
  if (!myChart) return;
  const zr = myChart.getZr();
  if (!zr || !zr.storage) return;

  const displayList = zr.storage.getDisplayList();
  const seen = new Set();

  displayList.forEach(el => {
    let curr = el;
    while (curr) {
      if (curr.draggable && curr.style && typeof curr.style.text === "string") {
        if (!seen.has(curr)) {
          seen.add(curr);
          const match = curr.style.text.match(/\{title\|([^}]+)\}/);
          if (match && match[1]) {
            customCardPositions[match[1]] = { x: curr.x, y: curr.y };
          }
        }
        break;
      }
      curr = curr.parent;
    }
  });
};

const renderBarChart = (summaryData7) => {
  if (!barChartContainer.value) return;
  if (barChartInstance) barChartInstance.dispose();
  barChartInstance = markRaw(echarts.init(barChartContainer.value));

  const sortedData = summaryData7.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const dates = [];
  const rideCounts = [];

  sortedData.forEach(item => {
    const d = new Date(item.date);
    dates.push(`${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`);
    rideCounts.push(item.rent_number || 0);
  });

  const option = {
    title: {
      text: '近七天全台騎乘次數',
      left: 'center',
      textStyle: { color: '#00638a', fontSize: 20, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#00638a',
      borderWidth: 1,
      textStyle: { color: '#333', fontWeight: 'bold' },
      formatter: function (params) {
        return `<span style="color:#00638a; font-size: 15px;">${params[0].name}</span><br/>` +
               `騎乘總數: <b style="color:#f59814; font-size:18px">${formatNum(params[0].value)}</b> 次`;
      }
    },
    grid: { left: '3%', right: '3%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: '#555', fontWeight: 'bold', fontSize: 14 },
      axisLine: { lineStyle: { color: '#ccc' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#555', fontWeight: 'bold', fontSize: 13, formatter: (val) => formatNum(val) },
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } }
    },
    series: [
      {
        data: rideCounts,
        type: 'bar',
        barWidth: '35%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f59814' }, 
            { offset: 1, color: '#ffcf87' }
          ]),
          borderRadius: [6, 6, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          color: '#00638a',
          fontWeight: 'bold',
          fontSize: 14,
          formatter: (p) => formatNum(p.value)
        }
      }
    ]
  };

  barChartInstance.setOption(option);
};

const renderMap = () => {
  if (!mapContainer.value) return;
  
  if (myChart) myChart.dispose();
  myChart = markRaw(echarts.init(mapContainer.value));
  echarts.registerMap("TAIWAN", taiwanGeoJson);

  const chartWidth = myChart.getWidth();
  const isCompact = chartWidth < 1450; 

  const hasHistorySelected = selectedMetrics.value.some(m => m.includes("Days") || m.includes("Weeks"));
  const cardWidth = hasHistorySelected ? 210 : 155; 

  const geoCoords = {
    '基隆市': [121.7419, 25.1276], '台北市': [121.5554, 25.0630], '新北市': [121.5254, 24.9657],
    '桃園市': [121.2168, 24.9632], '新竹市': [120.9675, 24.8038], '新竹縣': [121.1285, 24.7038],
    '竹科':   [121.0100, 24.7800], '苗栗縣': [120.8217, 24.5287], '台中市': [120.6770, 24.1632],
    '彰化縣': [120.4818, 23.9929], '南投縣': [120.9276, 23.8887], '雲林縣': [120.3897, 23.7179],
    '嘉義市': [120.4491, 23.4800], '嘉義縣': [120.3240, 23.4288], '台南市': [120.2113, 23.0217],
    '高雄市': [120.3014, 22.6273], '屏東縣': [120.5400, 22.5000], '宜蘭縣': [121.7195, 24.6800],
    '花蓮縣': [121.4542, 23.8500], '台東縣': [121.0550, 22.7800], '澎湖縣': [119.5664, 23.5711],
    '金門縣': [118.3109, 24.4365], '連江縣': [119.9363, 26.1505]
  };

  const leftCol1X = 250;
  const leftCol2X = hasHistorySelected ? 550 : 500; 
  
  const rightColWidth = hasHistorySelected ? 290 : 240;
  const rightCol1X = chartWidth - rightColWidth * 3 - 15; 
  const rightCol2X = chartWidth - rightColWidth * 2 - 10; 
  const rightCol3X = chartWidth - rightColWidth;          

  const defaultCardLayout = isCompact
    ? {
        '桃園市': { x: leftCol1X-220, y: '2%' },
        '新竹市': { x: leftCol2X-220, y: '2%' },
        '竹科':   { x: leftCol1X-220, y: '20%' },
        '新竹縣': { x: leftCol2X-220, y: '20%' },
        '苗栗縣': { x: leftCol1X-220, y: '38%' },
        '台中市': { x: leftCol2X-220, y: '38%' },
        '嘉義市': { x: leftCol1X-220, y: '56%' },
        '嘉義縣': { x: leftCol2X-220, y: '56%' },
        
        '新北市': { x: rightCol2X, y: '2%' },
        '台北市': { x: rightCol3X, y: '2%' },
        '台南市': { x: rightCol2X, y: '20%' },
        '高雄市': { x: rightCol3X, y: '20%' },
        '屏東縣': { x: rightCol2X, y: '38%' },
        '台東縣': { x: rightCol3X, y: '38%' },

        '基隆市': { x: rightCol3X, y: '5%' },
        '宜蘭縣': { x: rightCol3X, y: '25%' },
        '花蓮縣': { x: rightCol2X, y: '73%' }, 
        '彰化縣': { x: leftCol2X + 240, y: '50%' },
        '南投縣': { x: leftCol2X + 240, y: '27%' },
        '雲林縣': { x: leftCol2X + 240, y: '73%' }
      }
    : {
        '桃園市': { x: leftCol1X - 50, y: '5%' },
        '新竹市': { x: leftCol2X - 50, y: '5%' },
        '竹科':   { x: leftCol1X - 50, y: '28%' },
        '新竹縣': { x: leftCol2X - 50, y: '28%' },
        '苗栗縣': { x: leftCol1X - 50, y: '51%' },
        '台中市': { x: leftCol2X - 50, y: '51%' },
        '嘉義市': { x: leftCol1X - 50, y: '74%' },
        '嘉義縣': { x: leftCol2X - 50, y: '74%' },

        '台北市': { x: rightCol1X, y: '5%' },
        '新北市': { x: rightCol2X, y: '5%' },
        '台南市': { x: rightCol1X, y: '28%' },
        '高雄市': { x: rightCol2X, y: '28%' },
        '屏東縣': { x: rightCol2X, y: '51%' },
        '台東縣': { x: rightCol1X, y: '51%' },

        '基隆市': { x: rightCol3X, y: '5%' },
        '宜蘭縣': { x: rightCol3X, y: '25%' },
        '花蓮縣': { x: rightCol1X - rightColWidth, y: '68%' },
        '彰化縣': { x: leftCol2X + 190, y: '51%' },
        '南投縣': { x: leftCol2X + 190, y: '28%' },
        '雲林縣': { x: leftCol2X + 190, y: '74%' }
      };

  const mapData = []; 
  const scatterData = [];

  let totalStationAll = 0, totalPoleAll = 0, totalBike20All = 0, totalBike20EAll = 0, totalRide20All = 0, totalRide20EAll = 0;

  Object.keys(cityDataMap.value).forEach(cityName => {
    const data = cityDataMap.value[cityName];
    
    totalStationAll += data.station || 0;
    totalPoleAll += data.pole || 0;
    totalBike20All += data.bike20 || 0;
    totalBike20EAll += data.bike20E || 0;
    totalRide20All += data.ride20 || 0;
    totalRide20EAll += data.ride20E || 0;

    const allMetricsSum = (data.station || 0) + (data.pole || 0) + (data.bike20 || 0) + (data.bike20E || 0) + (data.ride20 || 0) + (data.ride20E || 0);

    const rideTotalForColor = (data.ride20 || 0) + (data.ride20E || 0);
    const colorValue = allMetricsSum === 0 ? 0 : (rideTotalForColor > 0 ? rideTotalForColor : 1);

    const pushMapColor = (targetName) => {
      mapData.push({
        name: targetName,
        value: colorValue,
        silent: allMetricsSum === 0,
        ...(allMetricsSum === 0 ? { itemStyle: { areaColor: '#e2e8f0', borderColor: '#ffffff' } } : {})
      });
    };

    pushMapColor(cityName);
    if (cityName === '桃園市') pushMapColor('桃園縣');
    if (cityName === '新北市') pushMapColor('台北縣');
    if (cityName === '台中市') pushMapColor('台中縣');
    if (cityName === '台南市') pushMapColor('台南縣');
    if (cityName === '高雄市') pushMapColor('高雄縣');
    if (cityName.includes('台')) pushMapColor(cityName.replace('台', '臺'));

    if (allMetricsSum > 0 && geoCoords[cityName]) {
      scatterData.push({
        name: cityName,
        value: [...geoCoords[cityName], rideTotalForColor],
        rawData: data
      });
    }
  });

  const maxRideVal = Math.max(...mapData.map(d => d.value)) || 100;

  const option = {
    backgroundColor: '#7CE0F4',
    tooltip: { show: false },
    
    geo: {
      map: 'TAIWAN',
      roam: false,
      layoutCenter: isCompact ? ['35%', '42%'] : ['35%', '35%'],
      layoutSize: isCompact ? '86%' : '120%',
      aspectScale: 0.95,
      itemStyle: { 
        areaColor: '#e2e8f0',
        borderColor: '#ffffff', 
        borderWidth: 2,
        shadowColor: 'rgba(0, 99, 138, 0.2)',
        shadowBlur: 15,
        shadowOffsetY: 5
      },
      label: { show: false }
    },

    visualMap: {
      right: 300, 
      bottom: 25,
      itemWidth: 16,
      itemHeight: 120,
      min: 1, max: maxRideVal,
      text: ['騎乘數高', '騎乘數低'],
      inRange: { color: ['#26B8DB', '#B4D330', '#F99B1C', '#F23041'] },
      outOfRange: { color: ['#e2e8f0'] },
      textStyle: { color: '#004d6b', fontWeight: 'bold', fontSize: 13 },
      backgroundColor: 'rgba(255,255,255,0.9)',
      padding: [10, 12], borderRadius: 8,
      seriesIndex: 0 
    },

    graphic: [
      {
        type: 'group',
        right: 25,
        bottom: 25,
        children: [
          {
            type: 'rect', z: 100,
            shape: { width: 260, height: 235, r: 10 },
            style: {
              fill: 'rgba(255, 255, 255, 0.96)', stroke: '#00638a', lineWidth: 2,
              shadowBlur: 12, shadowColor: 'rgba(0, 77, 107, 0.25)', shadowOffsetY: 4
            }
          },
          {
            type: 'rect', z: 101, left: 12, top: 12,
            shape: { width: 236, height: 36, r: 5 },
            style: { fill: '#00638a' }
          },
          {
            type: 'text', z: 102, left: 74, top: 20,
            style: { text: '全台數據總計', fill: '#ffffff', font: 'bold 18px sans-serif' }
          },
          {
            type: 'text', z: 102, left: 16, top: 62,
            style: {
              text: [
                `全部場站數： ${formatNum(totalStationAll)}`,
                `全部車柱數： ${formatNum(totalPoleAll)}`,
                `2.0 車輛數： ${formatNum(totalBike20All)}`,
                `2.0E 車輛數：${formatNum(totalBike20EAll)}`,
                `2.0 騎乘數： ${formatNum(totalRide20All)}`,
                `2.0E 騎乘數：${formatNum(totalRide20EAll)}`
              ].join('\n'),
              fill: '#1e293b', font: 'bold 16px sans-serif', lineHeight: 28
            }
          }
        ]
      }
    ],

    series: [
      {
        name: '地圖底層',
        type: 'map',
        geoIndex: 0,
        data: mapData
      },
      {
        name: '標籤引導層',
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#ffffff', borderColor: '#00638a', borderWidth: 2.5 },
        data: scatterData,
        labelLine: {
          show: true, showAbove: true, smooth: 0.1,
          lineStyle: { color: '#004d6b', width: 2, type: 'solid' } 
        },
        labelLayout: function (params) {
          const item = scatterData[params.dataIndex];
          if (!item) return {};
          const cityName = item.name;

          if (!customCardPositions[cityName]) {
            const def = defaultCardLayout[cityName] || { x: '50%', y: '50%' };
            const chartWidth = myChart.getWidth();
            const chartHeight = myChart.getHeight();
            
            const pxX = typeof def.x === 'string' ? parseFloat(def.x) / 100 * chartWidth : def.x;
            const pxY = typeof def.y === 'string' ? parseFloat(def.y) / 100 * chartHeight : def.y;
            customCardPositions[cityName] = { x: pxX, y: pxY };
          }

          return {
            x: customCardPositions[cityName].x,
            y: customCardPositions[cityName].y,
            draggable: true
          };
        },
        label: {
          show: true,
          position: 'inside',
          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          borderColor: '#00638a', borderWidth: 2, borderRadius: 8,
          padding: [8, 12], 
          shadowColor: 'rgba(0, 0, 0, 0.15)', shadowBlur: 8,
          shadowOffsetY: 3,
          formatter: function(params) {
            const cityName = params.name;
            const data = params.data.rawData;
            const metrics = selectedMetrics.value; 

            let content = `{title|${cityName}}\n{hr|}\n`;
            let hasContent = false;

            if (metrics.includes('station')) { content += `{lbl|場站數：}{val|${formatNum(data.station)}}\n`; hasContent = true; }
            if (metrics.includes('pole')) { content += `{lbl|車柱數：}{val|${formatNum(data.pole)}}\n`; hasContent = true; }
            if (metrics.includes('bike20')) { content += `{lbl|2.0 車輛：}{val20|${formatNum(data.bike20)}}\n`; hasContent = true; }
            if (metrics.includes('bike20E')) { content += `{lbl|2.0E 車輛：}{val20E|${formatNum(data.bike20E)}}\n`; hasContent = true; }
            if (metrics.includes('ride20')) { content += `{lbl|2.0 騎乘：}{val20|${formatNum(data.ride20)}}\n`; hasContent = true; }
            if (metrics.includes('ride20E')) { content += `{lbl|2.0E 騎乘：}{val20E|${formatNum(data.ride20E)}}\n`; hasContent = true; }

            if (metrics.includes('ride7Days')) { content += `{lblHist|近七天騎乘：}{valHist|${formatNum(data.ride7Days)}}\n`; hasContent = true; }
            if (metrics.includes('ride4Weeks')) { content += `{lblHist|近四週騎乘：}{valHist|${formatNum(data.ride4Weeks)}}\n`; hasContent = true; }
            if (metrics.includes('ride4WeeksWeekday')) { content += `{lblHist|近四週平日：}{valHist|${formatNum(data.ride4WeeksWeekday)}}\n`; hasContent = true; }
            if (metrics.includes('ride4WeeksWeekend')) { content += `{lblHist|近四週假日：}{valHist|${formatNum(data.ride4WeeksWeekend)}}\n`; hasContent = true; }

            if (!hasContent) return '';
            return content.trim(); 
          },
          rich: {
            title: { 
              color: '#ffffff', backgroundColor: '#00638a',
              fontSize: 18, fontWeight: 'bold', align: 'center',
              padding: [5, 10], borderRadius: 4, width: cardWidth
            },
            hr: { borderColor: 'transparent', width: '100%', height: 4 },
            lbl: { color: '#334155', fontSize: 15, fontWeight: 'bold', lineHeight: 24, align: 'left' },
            val: { color: '#f59814', fontSize: 20, fontWeight: 'bold', lineHeight: 24, align: 'right' },
            val20: { color: '#7cb305', fontSize: 20, fontWeight: 'bold', lineHeight: 24, align: 'right' },
            val20E: { color: '#ea2a3b', fontSize: 20, fontWeight: 'bold', lineHeight: 24, align: 'right' },
            
            lblHist: { color: '#b23571', fontSize: 15, fontWeight: 'bold', lineHeight: 24, align: 'left' },
            valHist: { color: '#d84485', fontSize: 20, fontWeight: 'bold', lineHeight: 24, align: 'right' }
          }
        }
      }
    ]
  };

  myChart.setOption(option);

  const zr = myChart.getZr();
  zr.on('mouseup', syncDraggedCardPositions);
  zr.on('mousemove', (e) => {
    if (e.event && e.event.buttons === 1) {
      syncDraggedCardPositions();
    }
  });
};

watch(selectedMetrics, () => {
  if (myChart) {
    renderMap(); 
  }
});

window.addEventListener('resize', () => {
  if (myChart) {
    Object.keys(customCardPositions).forEach(k => delete customCardPositions[k]);
    myChart.resize();
    renderMap();
  }
  if (barChartInstance) {
    barChartInstance.resize();
  }
});

onMounted(() => {
  getonedaydata();
});
</script>

<style scoped>
.custom-checkboxes :deep(.el-checkbox__label) {
  color: #333 !important;
  font-weight: 600;
  font-size: 16px; 
}
.custom-checkboxes :deep(.el-checkbox) {
  margin-right: 22px;
}
.custom-checkboxes :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #f59814;
  border-color: #f59814;
}
.custom-checkboxes :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #f59814 !important;
}

.custom-checkboxes-history :deep(.el-checkbox__label) {
  color: #333 !important;
  font-weight: 600;
  font-size: 16px; 
}
.custom-checkboxes-history :deep(.el-checkbox) {
  margin-right: 22px;
}
.custom-checkboxes-history :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #d84485;
  border-color: #d84485;
}
.custom-checkboxes-history :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #d84485 !important;
}
</style>