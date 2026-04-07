<template>
  <div class="row mt-3">
    <div class="col-auto my-1">
      <n-select style="width: 130px" v-model:value="cityvalue" :options="selectoptions" />
    </div>
    <div class="col-auto my-1">
      <n-select
        class="col-md-3"
        style="width: 130px"
        v-model:value="Typevalue"
        :options="TypeOptions"
      />
    </div>
    <div class="col-auto my-1 my-auto pe-0">
      <n-checkbox
        size="small"
        label="全區"
        style="width: 60px"
        v-model:checked="Allcheck"
      />
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
    <div
      class="col-md-3 px-1"
      v-for="(items, index) in PietotalCityData"
      :key="`${index}adwd`"
    >
      <PiechartComponent
        class="mt-3"
        :data="items['valueArr']"
        :title="items['title']"
        :secondtitle="getFormattedDateWithDay(LastDaty)"
      />
    </div>
  </div>
  <div class="row">
    <div
      class="col-12 mt-1"
      v-for="(items, index) in CategoryCityData"
      :key="`${index}adwd`"
    >
      <CategoryComponent
        :data="items['value']"
        :title="items['title']"
        :secondtitle="getFormattedDateWithDay(LastDaty)"
      />
    </div>
  </div>
  <div class="row">
    <div
      class="col-12 mt-1"
      v-for="(items, index) in CategoryCityNowData"
      :key="`${index}adad`"
    >
      <CategoryComponent
        :data="items['value']"
        :title="items['title']"
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
// import ThreeViewCategory2Component from "../ThreePiechart/ThreeViewCategory2Component.vue";
import axios from "axios";
import { useUserStore } from "../../stores/userdata";
const store = useUserStore();
const canusecitys = store.citys;

const PietotalCityData = ref([]);
const CategoryCityData = ref([]);
const CategoryCityNowData = ref([]);
//城市權限 開始
const cityvalue = ref([]);
const selectoptions = ref([]);
function checkCity() {
  let arr = [];
  arr = [
    {
      label: "台北市",
      // value: ["Taipei2"],
      value: "台北市",
      disabled: !canusecitys.includes(2),
    },
    {
      label: "新北市",
      // value: ["Newtaipei", "Newtaipei2"],
      value: "新北市",
      disabled: !canusecitys.includes(3),
    },
    {
      label: "桃園市",
      // value: ["Taoyuan", "Taoyuan2"],
      value: "桃園市",
      disabled: !canusecitys.includes(4),
    },
    {
      label: "新竹市",
      // value: ["Hsinchu2"],
      value: "新竹市",
      disabled: !canusecitys.includes(5),
    },
    {
      label: "新竹縣",
      // value: ["Hsinchu_Country2"],
      value: "新竹縣",
      disabled: !canusecitys.includes(6),
    },
    {
      label: "竹科",
      // value: ["HsinchuScience2"],
      value: "竹科",
      disabled: !canusecitys.includes(20),
    },
    {
      label: "苗栗縣",
      // value: ["Miaoli", "Miaoli2"],
      value: "苗栗縣",
      disabled: !canusecitys.includes(7),
    },
    {
      label: "台中市",
      // value: ["Taichung2"],
      value: "台中市",
      disabled: !canusecitys.includes(8),
    },
    {
      label: "嘉義市",
      // value: ["Chiayi2"],
      value: "嘉義市",
      disabled: !canusecitys.includes(12),
    },
    {
      label: "台南市",
      // value: ["Tainan2"],
      value: "台南市",
      disabled: !canusecitys.includes(14),
    },
    {
      label: "高雄市",
      // value: ["Kaohsiung2"],
      value: "高雄市",
      disabled: !canusecitys.includes(15),
    },
    {
      label: "屏東縣",
      // value: ["Pingtung2"],
      value: "屏東縣",
      disabled: !canusecitys.includes(16),
    },
  ];
  selectoptions.value = [...arr.filter((item) => !item.disabled)];

  //預設為第一筆
  cityvalue.value = selectoptions.value[0]["value"];
}
//城市權限 結束

//表別start
const Typevalue = ref("行政區");
const TypeOptions = ref([
  {
    label: "行政區",
    value: "行政區",
  },
  {
    label: "調度分區",
    value: "調度分區",
  },
]);
//表別end
const Allcheck = ref(true);

//區域

const value = ref([]);
const valueOptions = ref();

//監聽
watch(
  () => [cityvalue.value, Typevalue.value],
  async () => {
    value.value = null;
    const city = formateCity(cityvalue.value);
    const ValueOptionRes = await getValueOptions(city);
    //整理好的區域
    FormtValueOptions(ValueOptionRes);
  }
);

//取得某個城市的行政區或是調度分區的值
async function getValueOptions(city) {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;

    const params = {
      dataset_id: "report",
      table_id: "station_for_areainfo",
      city: city,
    };

    const res = await axios.get(url, { params });
    return res.data.data;
  } catch (error) {
    throw new Error("抓行政區調度分區資料出錯了");
  }
}

//把取得的值放到selectoptions
async function FormtValueOptions(params) {
  let arr = [];
  if (Typevalue.value === "行政區") {
    for (const key in params) {
      arr = [...arr, ...params[key]["ad_area"]];
    }
  } else {
    for (const key in params) {
      arr = [...arr, ...params[key]["respon_area"]];
    }
  }
  //去除相同
  const uniqueArray = [...new Set(arr)];
  valueOptions.value = uniqueArray.map((item) => {
    return {
      label: item,
      value: item,
    };
  });
}

function handleUpdateValue() {
  const v = value.value;
  if (v.length > 3) {
    value.value = v.slice(0, 3);
  }
}

//英文名稱轉中文
function formateCity(name) {
  switch (name) {
    case "台北市":
      return ["Taipei2"];
    case "新北市":
      return ["Newtaipei", "Newtaipei2"];
    case "桃園市":
      return ["Taoyuan", "Taoyuan2"];
    case "新竹市":
      return ["Hsinchu2"];
    case "新竹縣":
      return ["Hsinchu_Country2"];
    case "竹科":
      return ["HsinchuScience2"];
    case "苗栗縣":
      return ["Miaoli", "Miaoli2"];
    case "台中市":
      return ["Taichung2"];
    case "嘉義市":
      return ["Chiayi2"];
    case "台南市":
      return ["Tainan2"];
    case "高雄市":
      return ["Kaohsiung2"];
    case "屏東縣":
      return ["Pingtung2"];
  }
}

function editPieData(dataArr) {
  let arr = [];
  dataArr.forEach((item) => {
    arr.push({
      // 如果尾數有2就是2.0
      title: item.city.endsWith("2") ? "2.0見車率區間場站數" : "1.0見車率區間場站數",
      valueArr: [
        {
          name: "90%以上站數",
          value: item["bike_greater_90_count"],
        },
        {
          name: "90%~85%站數",
          value: item["bike_90_85_count"],
        },
        {
          name: "85%~80%站數",
          value: item["bike_85_80_count"],
        },
        {
          name: "80%以下站數",
          value: item["bike_low_80_count"],
        },
      ],
    });
    arr.push({
      title: item.city.endsWith("2") ? "2.0見位率區間場站數" : "1.0見位率區間場站數",
      valueArr: [
        {
          name: "99%以上站數",
          value: item["station_greater_99_count"],
        },
        {
          name: "99%~95%站數",
          value: item["station_99_95_count"],
        },
        {
          name: "95%~90%站數",
          value: item["station_95_90_count"],
        },
        {
          name: "90%以下站數",
          value: item["station_low_90_count"],
        },
      ],
    });
  });
  return arr;
}

//判斷有沒有'%' ,如果有把%拿掉 如果沒有回傳null
function removePercentage(str) {
  if (str === null) {
    return null;
  }
  if (str.includes("%")) {
    var newStr = str.replace(/%/g, "");
    return newStr;
  } else {
    return str;
  }
}

function editCategoryData(dataArr, city) {
  let arr = [];
  arr = city.map((item) => {
    return {
      title: item.endsWith("2")
        ? "2.0見車/見位率各時段比例(%)"
        : "1.0見車/見位率各時段比例(%)",
      city: item,
      value: [],
    };
  });
  dataArr.forEach((item1, index1) => {
    arr.forEach((item2, index2) => {
      if (item1["city"] === item2["city"]) {
        arr[index2]["value"].push({
          status: item1.status,
          value: [
            removePercentage(dataArr[index1].r0),
            removePercentage(dataArr[index1].r1),
            removePercentage(dataArr[index1].r2),
            removePercentage(dataArr[index1].r3),
            removePercentage(dataArr[index1].r4),
            removePercentage(dataArr[index1].r5),
            removePercentage(dataArr[index1].r6),
            removePercentage(dataArr[index1].r7),
            removePercentage(dataArr[index1].r8),
            removePercentage(dataArr[index1].r9),
            removePercentage(dataArr[index1].r10),
            removePercentage(dataArr[index1].r11),
            removePercentage(dataArr[index1].r12),
            removePercentage(dataArr[index1].r13),
            removePercentage(dataArr[index1].r14),
            removePercentage(dataArr[index1].r15),
            removePercentage(dataArr[index1].r16),
            removePercentage(dataArr[index1].r17),
            removePercentage(dataArr[index1].r18),
            removePercentage(dataArr[index1].r19),
            removePercentage(dataArr[index1].r20),
            removePercentage(dataArr[index1].r21),
            removePercentage(dataArr[index1].r22),
            removePercentage(dataArr[index1].r23),
          ],
        });
      }
    });
  });
  // console.log(arr);

  return arr;
}

function editCategoryData2(dataArr, city) {
  let arr = [];
  arr = city.map((item) => {
    return {
      title: item.endsWith("2")
        ? "2.0見車/見位率各時段比例(%)"
        : "1.0見車/見位率各時段比例(%)",
      city: item,
      value: [],
    };
  });

  dataArr.forEach((item1, index1) => {
    arr.forEach((item2, index2) => {
      if (item1["city"] === item2["city"]) {
        arr[index2]["value"].push({
          status: `${item1.status}-${item1.area}`,
          value: [
            removePercentage(dataArr[index1].r0),
            removePercentage(dataArr[index1].r1),
            removePercentage(dataArr[index1].r2),
            removePercentage(dataArr[index1].r3),
            removePercentage(dataArr[index1].r4),
            removePercentage(dataArr[index1].r5),
            removePercentage(dataArr[index1].r6),
            removePercentage(dataArr[index1].r7),
            removePercentage(dataArr[index1].r8),
            removePercentage(dataArr[index1].r9),
            removePercentage(dataArr[index1].r10),
            removePercentage(dataArr[index1].r11),
            removePercentage(dataArr[index1].r12),
            removePercentage(dataArr[index1].r13),
            removePercentage(dataArr[index1].r14),
            removePercentage(dataArr[index1].r15),
            removePercentage(dataArr[index1].r16),
            removePercentage(dataArr[index1].r17),
            removePercentage(dataArr[index1].r18),
            removePercentage(dataArr[index1].r19),
            removePercentage(dataArr[index1].r20),
            removePercentage(dataArr[index1].r21),
            removePercentage(dataArr[index1].r22),
            removePercentage(dataArr[index1].r23),
          ],
        });
      }
    });
  });

  //把value是空的刪掉
  arr = arr.filter((item) => item.value.length !== 0);

  // console.log(arr);
  return arr;
}

const LastDaty = ref("");
function getLastDay() {
  let today = new Date();
  today.setDate(today.getDate() - 1);
  let year = today.getFullYear();
  let month = (today.getMonth() + 1).toString().padStart(2, "0"); // 月份是從 0 開始的，因此要加 1
  let day = today.getDate().toString().padStart(2, "0");
  let formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

const nowDay = ref("");
function getNowDay() {
  let today = new Date();
  today.setDate(today.getDate());
  let year = today.getFullYear();
  let month = (today.getMonth() + 1).toString().padStart(2, "0"); // 月份是從 0 開始的，因此要加 1
  let day = today.getDate().toString().padStart(2, "0");
  let formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

//抓上個月的一號
function getFirstDayOfLastMonth() {
  // 获取当前日期
  const currentDate = new Date();

  // 设置日期为当前月的1号
  currentDate.setDate(1);

  // 将月份减一
  currentDate.setMonth(currentDate.getMonth() - 1);

  // 获取上个月的1号
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 月份从0开始，所以需要加1
  const day = "01";

  // 格式化为"YYYY-MM-DD"
  const formattedDate = `${year}-${String(month).padStart(2, "0")}-${day}`;

  return formattedDate;
}

//判斷是否為平日假日回傳weekend 或是week
function checkDayType(dateStr) {
  // 解析日期字符串
  const date = new Date(dateStr);

  // 获取星期几 (0 = 星期日, 1 = 星期一, ..., 6 = 星期六)
  const dayOfWeek = date.getDay();

  // 判断是工作日还是周末
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return "weekend";
  } else {
    return "week";
  }
}

//日期回傳帶入星期
function getFormattedDateWithDay(dateStr) {
  // 解析日期字符串
  const date = new Date(dateStr);

  // 定义星期数组
  const daysOfWeek = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];

  // 获取星期几 (0 = 星期日, 1 = 星期一, ..., 6 = 星期六)
  const dayOfWeek = date.getDay();

  // 获取年份、月份和日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，需要加1，并确保两位数
  const day = String(date.getDate()).padStart(2, "0"); // 确保两位数

  // 格式化为"YYYY-MM-DD (星期)"
  const formattedDate = `${year}-${month}-${day} (${daysOfWeek[dayOfWeek]})`;

  return formattedDate;
}

async function getPieData() {
  if (cityvalue.value.length === 0) return;

  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      begin_date: LastDaty.value,
      city: formateCity(cityvalue.value),
      dataset_id: "report",
      end_date: LastDaty.value,
      table_id: "bike_station_chart",
      item: Typevalue.value,
      area: Allcheck.value === true ? ["all"] : value.value,
    };
    const res = await axios.get(url, { params });
    const { data } = res.data;
    PietotalCityData.value = editPieData([...data]);
  } catch (error) {
    throw new Error("抓資料出錯了");
  }
}

// 見車見位率各時段比例昨天
async function getLinerData() {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      begin_date: LastDaty.value,
      city: formateCity(cityvalue.value),
      dataset_id: "report",
      end_date: LastDaty.value,
      table_id: "bike_station_line_chart",
      item: Typevalue.value,
      area: Allcheck.value === true ? ["all"] : value.value,
    };
    // console.log(params);
    const res = await axios.get(url, { params });
    const { data } = res.data;

    //這裡上月平均線
    const firstDayOfLastMonth = getFirstDayOfLastMonth();
    const params2 = {
      dataset_id: "report",
      table_id: "bike_station_monthly_average_line_chart",
      date: firstDayOfLastMonth,
      day_status: checkDayType(LastDaty.value),
      city: formateCity(cityvalue.value),
      item: Typevalue.value,
      area: Allcheck.value === true ? ["all"] : value.value,
    };
    const res2 = await axios.get(url, { params: params2 });
    const data2 = res2.data.data.map((i) => {
      return {
        ...i,
        status: `${i.status}(上月${
          checkDayType(LastDaty.value) === "week" ? "平日" : "假日"
        })`,
      };
    });

    CategoryCityData.value = [];
    if (Allcheck.value === true) {
      CategoryCityData.value = editCategoryData(
        [...data, ...data2],
        formateCity(cityvalue.value)
      );
    } else {
      CategoryCityData.value = editCategoryData2(
        [...data, ...data2],
        formateCity(cityvalue.value)
      );
    }
  } catch (error) {
    throw new Error("抓資料出錯了");
  }
}

// 見車見位率各時段比例今天
async function getNowDayLinerData() {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      begin_date: nowDay.value,
      city: formateCity(cityvalue.value),
      dataset_id: "report",
      end_date: nowDay.value,
      table_id: "bike_station_line_chart",
      item: Typevalue.value,
      area: Allcheck.value === true ? ["all"] : value.value,
    };
    const res = await axios.get(url, { params });

    const { data } = res.data;

    //這是上月平均線
    const firstDayOfLastMonth = getFirstDayOfLastMonth();
    const params2 = {
      dataset_id: "report",
      table_id: "bike_station_monthly_average_line_chart",
      date: firstDayOfLastMonth,
      day_status: checkDayType(nowDay.value),
      city: formateCity(cityvalue.value),
      item: Typevalue.value,
      area: Allcheck.value === true ? ["all"] : value.value,
    };
    const res2 = await axios.get(url, { params: params2 });
    const data2 = res2.data.data.map((i) => {
      return {
        ...i,
        status: `${i.status}(上月${
          checkDayType(nowDay.value) === "week" ? "平日" : "假日"
        })`,
      };
    });

    CategoryCityNowData.value = [];
    if (Allcheck.value === true) {
      CategoryCityNowData.value = editCategoryData(
        [...data, ...data2],
        formateCity(cityvalue.value)
      );
    } else {
      CategoryCityNowData.value = editCategoryData2(
        [...data, ...data2],
        formateCity(cityvalue.value)
      );
      // console.log(CategoryCityNowData.value);
    }
  } catch (error) {
    throw new Error("抓資料出錯了");
  }
}

const search = async () => {
  console.log(Allcheck.value, value.value);
  if (Allcheck.value === false && (!value.value || value.value.length === 0)) {
    alert("請選擇區域");
    return;
  }
  try {
    await getPieData();
    await getLinerData();
    await getNowDayLinerData();
  } catch (error) {
    throw new Error("建立圖表失敗");
  }
};

onMounted(async () => {
  await search();
});
(async () => {
  LastDaty.value = getLastDay();
  nowDay.value = getNowDay();
  checkCity();
})();
</script>

<style lang="scss" scoped></style>
