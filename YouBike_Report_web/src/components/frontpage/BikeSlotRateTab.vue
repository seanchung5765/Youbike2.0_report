<template>
  <div class="row mt-3">
    <div class="col-auto my-1">
      <n-select style="width: 130px" v-model:value="cityvalue" :options="selectoptions" />
    </div>
    <div class="col-auto my-1">
      <n-select class="col-md-3" style="width: 130px" v-model:value="Typevalue" :options="TypeOptions" />
    </div>
    <div class="col-auto my-1 my-auto pe-0">
      <n-checkbox size="small" label="全區" style="width: 60px" v-model:checked="Allcheck" />
    </div>
    <div class="col-auto my-1 ps-0">
      <n-select
        class="col-md-3"
        style="width: 350px"
        v-model:value="value"
        :options="valueOptions"
        multiple
        filterable
        max-tag-count="responsive"
        @update:value="handleUpdateValue"
        :disabled="Allcheck"
      />
    </div>
    <div class="col-auto my-1">
      <n-button type="primary" @click="search">搜尋</n-button>
    </div>
  </div>

  <div class="row mt-3">
    <div class="col-md-3 px-1" v-for="(items, index) in PietotalCityData" :key="`${index}pie`">
      <PiechartComponent
        class="mt-3"
        :data="items.valueArr"
        :title="items.title"
        :secondtitle="getFormattedDateWithDay(LastDaty)"
      />
    </div>
  </div>
  <div class="row">
    <div class="col-12 mt-1" v-for="(items, index) in CategoryCityData" :key="`${index}cat1`">
      <CategoryComponent
        :data="items.value"
        :title="items.title"
        :secondtitle="getFormattedDateWithDay(LastDaty)"
      />
    </div>
  </div>
  <div class="row">
    <div class="col-12 mt-1" v-for="(items, index) in CategoryCityNowData" :key="`${index}cat2`">
      <CategoryComponent
        :data="items.value"
        :title="items.title"
        :secondtitle="getFormattedDateWithDay(nowDay)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { NSelect, NCheckbox, NButton } from "naive-ui";
import PiechartComponent from "../../components/ThreePiechart/ThreeViewPiechartComponent.vue";
import CategoryComponent from "../../components/ThreePiechart/ThreeViewCategoryComponent.vue";
import { useUserStore } from "../../stores/userdata";
import { getCityList } from "@/api/station";
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || []; 

const cityConfig = ref([]);
const selectoptions = ref([]);
const cityvalue = ref("");

// 從資料庫撈取縣市清單，並套用權限
const loadCities = async () => {
  try {
    const res = await getCityList();
    const allCitiesFromDB = res.data.data;

    cityConfig.value = allCitiesFromDB.filter(city => canusecitys.includes(city.id));
    selectoptions.value = cityConfig.value.map(c => ({ 
      label: c.name, 
      value: c.name 
    }));

    if (selectoptions.value.length > 0) {
      cityvalue.value = selectoptions.value[0].value;
    }
  } catch (error) {
    console.error("讀取縣市清單失敗", error);
  }
};

const formateCity = (name) => {
  const target = cityConfig.value.find(c => c.name === name);
  if (!target || !target.codes) return [];
  return target.codes.split(","); 
};

const Typevalue = ref("行政區");
const TypeOptions = ref([{ label: "行政區", value: "行政區" }, { label: "調度分區", value: "調度分區" }]);
const Allcheck = ref(true);
const value = ref([]);
const valueOptions = ref([]);

const PietotalCityData = ref([]);
const CategoryCityData = ref([]);
const CategoryCityNowData = ref([]);

const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

const nowDay = ref(formatDate(today));
const LastDaty = ref(formatDate(yesterday));
const lastMonthStr = formatDate(firstDayOfLastMonth);

const checkDayType = (dateStr) => {
  const day = new Date(dateStr).getDay();
  return (day === 0 || day === 6) ? "weekend" : "week";
};

const getFormattedDateWithDay = (dateStr) => {
  const date = new Date(dateStr);
  const days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return `${formatDate(date)} (${days[date.getDay()]})`;
};

// 監聽城市與區域切換
watch([cityvalue, Typevalue], async () => {
  value.value = [];
  const city = formateCity(cityvalue.value);
  if (!city.length) return;

  try {
    // 🌟 改用封裝的 API
    const res = await getGcpReport({ 
      dataset_id: "report", 
      table_id: "station_for_areainfo", 
      city 
    });
    
    let arr = [];
    const areaKey = Typevalue.value === "行政區" ? "ad_area" : "respon_area";
    for (const key in res.data.data) {
      arr.push(...(res.data.data[key][areaKey] || []));
    }
    
    valueOptions.value = [...new Set(arr)].map(item => ({ label: item, value: item }));
  } catch (error) {
    console.error("抓行政區調度分區資料出錯了", error);
  }
});

const handleUpdateValue = () => {
  if (value.value.length > 3) value.value = value.value.slice(0, 3);
};

const editPieData = (dataArr) => {
  let arr = [];
  dataArr.forEach(item => {
    const isV2 = item.city.endsWith("2");
    arr.push({
      title: isV2 ? "2.0見車率區間場站數" : "1.0見車率區間場站數",
      valueArr: [
        { name: "90%以上站數", value: item.bike_greater_90_count },
        { name: "90%~85%站數", value: item.bike_90_85_count },
        { name: "85%~80%站數", value: item.bike_85_80_count },
        { name: "80%以下站數", value: item.bike_low_80_count },
      ]
    });
    arr.push({
      title: isV2 ? "2.0見位率區間場站數" : "1.0見位率區間場站數",
      valueArr: [
        { name: "99%以上站數", value: item.station_greater_99_count },
        { name: "99%~95%站數", value: item.station_99_95_count },
        { name: "95%~90%站數", value: item.station_95_90_count },
        { name: "90%以下站數", value: item.station_low_90_count },
      ]
    });
  });
  return arr;
};

const processCategoryData = (dataArr, cities, isAllCheck) => {
  const result = cities.map(city => ({
    title: city.endsWith("2") ? "2.0見車/見位率各時段比例(%)" : "1.0見車/見位率各時段比例(%)",
    city: city,
    value: [],
  }));

  const removePercent = (str) => str ? String(str).replace(/%/g, "") : null;

  dataArr.forEach(item => {
    const target = result.find(r => r.city === item.city);
    if (target) {
      const statusLabel = isAllCheck ? item.status : `${item.status}-${item.area}`;
      const hoursData = Array.from({ length: 24 }, (_, i) => removePercent(item[`r${i}`]));
      target.value.push({ status: statusLabel, value: hoursData });
    }
  });

  return result.filter(item => item.value.length > 0);
};

// 圓餅圖 API
const getPieData = async () => {
  if (!cityvalue.value) return;
  const params = {
    dataset_id: "report", table_id: "bike_station_chart",
    begin_date: LastDaty.value, end_date: LastDaty.value,
    city: formateCity(cityvalue.value), item: Typevalue.value,
    area: Allcheck.value ? ["all"] : value.value,
  };
  const res = await getGcpReport(params); // 🌟 改用封裝的 API
  PietotalCityData.value = editPieData(res.data.data);
};

// 合併昨天與今天的長條圖 API 邏輯
const fetchLineChartData = async (targetDate) => {
  const cities = formateCity(cityvalue.value);
  const baseParams = {
    city: cities, item: Typevalue.value,
    area: Allcheck.value ? ["all"] : value.value,
  };

  // 🌟 改用封裝的 API，保持 Promise.all 結構
  const [res1, res2] = await Promise.all([
    getGcpReport({ ...baseParams, dataset_id: "report", table_id: "bike_station_line_chart", begin_date: targetDate, end_date: targetDate }),
    getGcpReport({ ...baseParams, dataset_id: "report", table_id: "bike_station_monthly_average_line_chart", date: lastMonthStr, day_status: checkDayType(targetDate) })
  ]);

  const dayTypeLabel = checkDayType(targetDate) === "week" ? "平日" : "假日";
  const data2 = res2.data.data.map(i => ({ ...i, status: `${i.status}(上月${dayTypeLabel})` }));

  return processCategoryData([...res1.data.data, ...data2], cities, Allcheck.value);
};

const search = async () => {
  if (!Allcheck.value && (!value.value || value.value.length === 0)) {
    return alert("請選擇區域");
  }

  const validCities = formateCity(cityvalue.value);
  if (validCities.length === 0) {
    console.warn(`[系統提示] ${cityvalue.value} 尚無設定資料庫代號 (codes)，跳過查詢。`);
    PietotalCityData.value = [];
    CategoryCityData.value = [];
    CategoryCityNowData.value = [];
    return;
  }

  try {
    await getPieData();
    CategoryCityData.value = await fetchLineChartData(LastDaty.value);     
    CategoryCityNowData.value = await fetchLineChartData(nowDay.value);    
  } catch (error) {
    console.error("建立圖表失敗", error);
  }
};

onMounted(async () => {
  await loadCities(); 
  if (cityvalue.value) {
    search();
  }
});
</script>