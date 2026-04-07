<template>
  <div>
    <div class="row">
      <div class="px-1 py-1">
        <CityBarcharComponent
          :data="data1"
          :date="date1"
          name="騎乘次數(近七天)"
        />
      </div>
    </div>
    <div class="row">
      <div class="px-1 py-1">
        <CityBarcharComponent
          :data="data2"
          :date="date2"
          name="騎乘次數(近四週)"
        />
      </div>
    </div>
    <div class="row">
      <div class="px-1 py-1">
        <CityBarcharComponent
          :data="data3"
          :date="date3"
          name="平日騎乘次數(近四週)"
        />
      </div>
    </div>
    <div class="row">
      <div class="px-1 py-1">
        <CityBarcharComponent
          :data="data4"
          :date="date4"
          name="假日騎乘次數(近四週)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import CityBarcharComponent from "../CityBarcharComponent.vue";
const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
import { useUserStore } from "../../stores/userdata";
const store = useUserStore();
const canusecitys = store.citys;
function getLastMonDateFormatted(week = 1, day = 1) {
  var lastweek = null;
  const date = new Date();
  date.setDate(date.getDate() - week * 7 - date.getDay() + day);
  lastweek =
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  return lastweek;
}

//參數代表距離今天多少天 帶1的話就是昨天
const getday = (whatday) => {
  // 创建一个当前日期的 Date 对象
  let today = new Date();
  // 使用日期操作方法获取昨天的日期
  let yesterday = new Date(today);
  yesterday.setDate(today.getDate() - whatday);
  // 获取昨天的年、月、日
  let year = yesterday.getFullYear();
  let month = String(yesterday.getMonth() + 1).padStart(2, "0"); // 在个位数月份前添加零
  let day = String(yesterday.getDate()).padStart(2, "0"); // 在个位数日期前添加零
  // 格式化日期字符串
  let formattedDate = year + "-" + month + "-" + day;
  //回傳'yyyy-mm-dd'
  return formattedDate;
};

//取得字串中的中文
const chineseCharacters = (text) => {
  return text.match(/[\u4e00-\u9fa5]+/g)[0];
};

const getonedaydata = async () => {
  //騎乘次數(近七天)
  let city = [];

  //騎乘次數(近四周) 1.0長條圖
  let city2 = [];

  //騎乘次數(近四周) 2.0長條圖
  let city3 = [];

  //騎乘次數(近四周) 2.0e長條圖
  let city4 = [];

  //製作要得日期陣列start
  if (canusecitys.includes(2)) {
    city.push("台北市2.0", "台北市2.0E");
    city3.push("Taipei2");
    city4.push("Taipei2E");
  }
  if (canusecitys.includes(3)) {
    city.push("新北市", "新北市2.0", "新北市2.0E");
    city2.push("Newtaipei");
    city3.push("Newtaipei2");
    city4.push("Newtaipei2E");
  }
  if (canusecitys.includes(4)) {
    city.push("桃園市", "桃園市2.0", "桃園市2.0E");
    city2.push("Taoyuan");
    city3.push("Taoyuan2");
    city4.push("Taoyuan2E");
  }
  if (canusecitys.includes(6)) {
    city.push("新竹縣2.0", "新竹縣2.0E");
    city3.push("Hsinchu_Country2");
    city4.push("Hsinchu_Country2E");
  }
  if (canusecitys.includes(5)) {
    city.push("新竹市2.0", "新竹市2.0E");
    city3.push("Hsinchu2");
    city4.push("Hsinchu2E");
  }
  if (canusecitys.includes(20)) {
    city.push("竹科2.0", "竹科2.0E");
    city3.push("HsinchuScience2");
    city4.push("HsinchuScience2E");
  }
  if (canusecitys.includes(7)) {
    city.push("苗栗縣", "苗栗縣2.0", "苗栗縣2.0E");
    city2.push("Miaoli");
    city3.push("Miaoli2");
    city4.push("Miaoli2E");
  }
  if (canusecitys.includes(8)) {
    city.push("台中市2.0", "台中市2.0E");
    city3.push("Taichung2");
    city4.push("Taichung2E");
  }
  if (canusecitys.includes(12)) {
    city.push("嘉義市2.0", "嘉義市2.0E");
    city3.push("Chiayi2");
    city4.push("Chiayi2E");
  }
  if (canusecitys.includes(13)) {
    city.push("嘉義縣2.0");
    city3.push("Chiayi_Country2");
  }
  if (canusecitys.includes(14)) {
    city.push("台南市2.0", "台南市2.0E");
    city3.push("Tainan2");
    city4.push("Tainan2E");
  }
  if (canusecitys.includes(15)) {
    city.push("高雄市2.0", "高雄市2.0E");
    city3.push("Kaohsiung2");
    city4.push("Kaohsiung2E");
  }
  if (canusecitys.includes(16)) {
    city.push("屏東縣2.0", "屏東縣2.0E");
    city3.push("Pingtung2");
    city4.push("Pingtung2E");
  }

  if (canusecitys.includes(19)) {
    city.push("台東縣2.0", "台東縣2.0E");
    city3.push("Taitung2");
    city4.push("Taitung2E");
  }
  //end

  //騎乘次數(近七天)長條圖
  const params1 = {
    dataset_id: "founder_report",
    table_id: "daily_summary_Taiwan", //經營日報
    begin_date: getday(7),
    end_date: getday(1),
    city: city.length === 0 ? [""] : city,
  };

  //騎乘次數(近四周) 1.0長條圖
  const params2 = {
    dataset_id: "report",
    table_id: `weekly_report_query1`,
    date: getLastMonDateFormatted(),
    city: city2,
  };
  //騎乘次數(近四周) 2.0長條圖
  const params3 = {
    dataset_id: "report",
    table_id: `weekly_report_query2`,
    date: getLastMonDateFormatted(),
    city: city3,
  };
  //騎乘次數(近四周) 2.0e長條圖
  const params4 = {
    dataset_id: "report",
    table_id: `weekly_report_query2E`,
    date: getLastMonDateFormatted(),
    city: city4,
  };

  //平假日騎乘次數1.0
  const params5 = {
    dataset_id: "report",
    table_id: "daily_report_query1", //管理日報
    begin_date: getLastMonDateFormatted(4, 1),
    end_date: getLastMonDateFormatted(1, 7),
    city: city2,
  };
  //平假日騎乘次數2.0
  const params6 = {
    dataset_id: "report",
    table_id: "daily_report_query2",
    begin_date: getLastMonDateFormatted(4, 1),
    end_date: getLastMonDateFormatted(1, 7),
    city: city3,
  };
  //平假日騎乘次數2.0e
  const params7 = {
    dataset_id: "report",
    table_id: "daily_report_query2E",
    begin_date: getLastMonDateFormatted(4, 1),
    end_date: getLastMonDateFormatted(1, 7),
    city: city4,
  };
  const res = await Promise.all([
    axios.get(url, { params: params1 }),
    axios.get(url, { params: params2 }),
    axios.get(url, { params: params3 }),
    axios.get(url, { params: params4 }),
    axios.get(url, { params: params5 }),
    axios.get(url, { params: params6 }),
    axios.get(url, { params: params7 }),
  ]);

  //騎乘次數(近七天)長條圖
  setBarimg1(res[0].data.data);

  //騎乘次數(近四周)
  setBarimg2(res[1].data.data, res[2].data.data, res[3].data.data);

  //平日騎乘次數
  setBarimg3(res[4].data.data, res[5].data.data, res[6].data.data);

  //假日騎乘次數
  setBarimg4(res[4].data.data, res[5].data.data, res[6].data.data);
};

onMounted(() => {
  getonedaydata();
});

const data1 = ref([]);
const date1 = ref([]);
const setBarimg1 = (data) => {
  let arrdata = [];
  const datevalue = [];
  //用日期做區分
  data.forEach((item, index) => {
    if (index === 0) {
      //日期
      datevalue.push(item.date);
      //資料
      arrdata.push([]);
      arrdata[arrdata.length - 1].push(item);
    } else {
      if (arrdata[arrdata.length - 1][0]["date"] === item.date) {
        arrdata[arrdata.length - 1].push(item);
      } else {
        //日期
        datevalue.push(item.date);
        //資料
        arrdata.push([]);
        arrdata[arrdata.length - 1].push(item);
      }
    }
  });

  let datavalue = [];
  const cleardata = () => {
    datavalue = [
      {
        city: "台北市",
        value: 0,
      },
      {
        city: "新北市",
        value: 0,
      },
      {
        city: "桃園市",
        value: 0,
      },
      {
        city: "新竹縣",
        value: 0,
      },
      {
        city: "新竹市",
        value: 0,
      },
      {
        city: "竹科",
        value: 0,
      },
      {
        city: "苗栗縣",
        value: 0,
      },
      {
        city: "台中市",
        value: 0,
      },
      {
        city: "嘉義市",
        value: 0,
      },
      {
        city: "嘉義縣",
        value: 0,
      },
      {
        city: "台南市",
        value: 0,
      },
      {
        city: "高雄市",
        value: 0,
      },
      {
        city: "屏東縣",
        value: 0,
      },
      {
        city: "台東縣",
        value: 0,
      },
    ];
  };
  cleardata();
  const totaldata = [];
  arrdata.forEach((items) => {
    items.forEach((item) => {
      datavalue.forEach((i, index) => {
        if (chineseCharacters(item.city) === i.city) {
          datavalue[index]["value"] += item["rent_number"];
        }
      });
    });
    totaldata.push(datavalue.filter((item) => item.value));
    cleardata();
  });
  datevalue.forEach((item, index) => {
    const date = new Date(item);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    datevalue[index] = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  });
  function transformArray(inputArray) {
    if (inputArray.length === 0) {
      return [];
    }
    const result = [];
    for (let i = 0; i < inputArray[0].length; i++) {
      const city = inputArray[0][i].city;
      const cityValues = [];

      for (let j = 0; j < inputArray.length; j++) {
        cityValues.push(inputArray[j][i].value);
      }

      result.push({ city, value: cityValues });
    }
    return result;
  }
  data1.value = [...transformArray(totaldata)];
  date1.value = [...datevalue];
};

const data2 = ref([]);
const date2 = ref([]);
const setBarimg2 = (d1, d2, d3) => {
  const arr1 = [
    {
      city: "台北市",
      value: [],
    },
    {
      city: "新北市",
      value: [],
    },
    {
      city: "桃園市",
      value: [],
    },
    {
      city: "新竹縣",
      value: [],
    },
    {
      city: "新竹市",
      value: [],
    },
    {
      city: "竹科",
      value: [],
    },
    {
      city: "苗栗縣",
      value: [],
    },
    {
      city: "台中市",
      value: [],
    },
    {
      city: "嘉義市",
      value: [],
    },
    {
      city: "嘉義縣",
      value: [],
    },
    {
      city: "台南市",
      value: [],
    },
    {
      city: "高雄市",
      value: [],
    },
    {
      city: "屏東縣",
      value: [],
    },
    {
      city: "台東縣",
      value: [],
    },
  ];
  const arr2 = [
    {
      city: "台北市",
      value: [],
    },
    {
      city: "新北市",
      value: [],
    },
    {
      city: "桃園市",
      value: [],
    },
    {
      city: "新竹縣",
      value: [],
    },
    {
      city: "新竹市",
      value: [],
    },
    {
      city: "竹科",
      value: [],
    },
    {
      city: "苗栗縣",
      value: [],
    },
    {
      city: "台中市",
      value: [],
    },
    {
      city: "嘉義市",
      value: [],
    },
    {
      city: "嘉義縣",
      value: [],
    },
    {
      city: "台南市",
      value: [],
    },
    {
      city: "高雄市",
      value: [],
    },
    {
      city: "屏東縣",
      value: [],
    },
    {
      city: "台東縣",
      value: [],
    },
  ];
  const arr3 = [
    {
      city: "台北市",
      value: [],
    },
    {
      city: "新北市",
      value: [],
    },
    {
      city: "桃園市",
      value: [],
    },
    {
      city: "新竹縣",
      value: [],
    },
    {
      city: "新竹市",
      value: [],
    },
    {
      city: "竹科",
      value: [],
    },
    {
      city: "苗栗縣",
      value: [],
    },
    {
      city: "台中市",
      value: [],
    },
    {
      city: "嘉義市",
      value: [],
    },
    {
      city: "嘉義縣",
      value: [],
    },
    {
      city: "台南市",
      value: [],
    },
    {
      city: "高雄市",
      value: [],
    },
    {
      city: "屏東縣",
      value: [],
    },
    {
      city: "台東縣",
      value: [],
    },
  ];

  let totalarr = [
    {
      city: "台北市",
      value: [0, 0, 0, 0],
    },
    {
      city: "新北市",
      value: [0, 0, 0, 0],
    },
    {
      city: "桃園市",
      value: [0, 0, 0, 0],
    },
    {
      city: "新竹縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "新竹市",
      value: [0, 0, 0, 0],
    },
    {
      city: "竹科",
      value: [0, 0, 0, 0],
    },
    {
      city: "苗栗縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "台中市",
      value: [0, 0, 0, 0],
    },
    {
      city: "嘉義市",
      value: [0, 0, 0, 0],
    },
    {
      city: "嘉義縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "台南市",
      value: [0, 0, 0, 0],
    },
    {
      city: "高雄市",
      value: [0, 0, 0, 0],
    },
    {
      city: "屏東縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "台東縣",
      value: [0, 0, 0, 0],
    },
  ];

  let index1 = 0;
  if (d1.length > 1) {
    index1 = d1[0][0].indexOf("當週/日租借車次");
    d1.forEach((item) => {
      const name = item[1][1];
      if (name === "Miaoli") {
        arr1[6].value = [
          item[1][index1],
          item[2][index1],
          item[3][index1],
          item[4][index1],
        ];
      } else if (name === "Newtaipei") {
        arr1[1].value = [
          item[1][index1],
          item[2][index1],
          item[3][index1],
          item[4][index1],
        ];
      } else if (name === "Taoyuan") {
        arr1[2].value = [
          item[1][index1],
          item[2][index1],
          item[3][index1],
          item[4][index1],
        ];
      }
    });
  }

  let index2 = 0;
  if (d2.length > 1) {
    index2 = d2[0][0].indexOf("當週/日租借車次");
    d2.forEach((item) => {
      const name = item[1][1];
      if (name === "Chiayi2") {
        arr2[8].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "Hsinchu2") {
        arr2[4].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "HsinchuScience2") {
        arr2[5].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "Hsinchu_Country2") {
        arr2[3].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "Kaohsiung2") {
        arr2[11].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "Newtaipei2") {
        arr2[1].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "Pingtung2") {
        arr2[12].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "Taitung2") {
        arr2[13].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "Taichung2") {
        arr2[7].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "Tainan2") {
        arr2[10].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "Taipei2") {
        arr2[0].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "Taoyuan2") {
        arr2[2].value = [
          item[1][index2],
          item[2][index2],
          item[3][index2],
          item[4][index2],
        ];
      } else if (name === "Miaoli2") {
        arr2[6].value = [
          item[1][index1],
          item[2][index1],
          item[3][index1],
          item[4][index1],
        ];
      } else if (name === "Chiayi__Country2") {
        arr2[9].value = [
          item[1][index1],
          item[2][index1],
          item[3][index1],
          item[4][index1],
        ];
      }
    });
  }

  let index3 = 0;
  if (d3.length > 1) {
    index3 = d3[0][0].indexOf("當週/日租借車次");
    d3.forEach((item) => {
      const name = item[1][1];
      if (name === "Taoyuan2E") {
        arr3[2].value = [
          item[1][index3],
          item[2][index3],
          item[3][index3],
          item[4][index3],
        ];
      } else if (name === "Chiayi2E") {
        arr3[8].value = [
          item[1][index3],
          item[2][index3],
          item[3][index3],
          item[4][index3],
        ];
      } else if (name === "HsinchuScience2E") {
        arr3[5].value = [
          item[1][index3],
          item[2][index3],
          item[3][index3],
          item[4][index3],
        ];
      } else if (name === "Kaohsiung2E") {
        arr3[11].value = [
          item[1][index3],
          item[2][index3],
          item[3][index3],
          item[4][index3],
        ];
      } else if (name === "Pingtung2E") {
        arr3[12].value = [
          item[1][index3],
          item[2][index3],
          item[3][index3],
          item[4][index3],
        ];
      } else if (name === "Taitung2E") {
        arr3[13].value = [
          item[1][index3],
          item[2][index3],
          item[3][index3],
          item[4][index3],
        ];
      } else if (name === "Taichung2E") {
        arr3[7].value = [
          item[1][index3],
          item[2][index3],
          item[3][index3],
          item[4][index3],
        ];
      } else if (name === "Tainan2E") {
        arr3[10].value = [
          item[1][index3],
          item[2][index3],
          item[3][index3],
          item[4][index3],
        ];
      } else if (name === "Newtaipei2E") {
        arr3[1].value = [
          item[1][index3],
          item[2][index3],
          item[3][index3],
          item[4][index3],
        ];
      } else if (name === "Taipei2") {
        arr3[0].value = [
          item[1][index3],
          item[2][index3],
          item[3][index3],
          item[4][index3],
        ];
      } else if (name === "Miaoli2E") {
        arr3[6].value = [
          item[1][index1],
          item[2][index1],
          item[3][index1],
          item[4][index1],
        ];
      }
    });
  }

  totalarr.forEach((item, index) => {
    if (arr1[index]["value"].length !== 0) {
      totalarr[index]["value"][0] += arr1[index]["value"][0];
      totalarr[index]["value"][1] += arr1[index]["value"][1];
      totalarr[index]["value"][2] += arr1[index]["value"][2];
      totalarr[index]["value"][3] += arr1[index]["value"][3];
    }

    if (arr2[index]["value"].length !== 0) {
      totalarr[index]["value"][0] += arr2[index]["value"][0];
      totalarr[index]["value"][1] += arr2[index]["value"][1];
      totalarr[index]["value"][2] += arr2[index]["value"][2];
      totalarr[index]["value"][3] += arr2[index]["value"][3];
    }

    if (arr3[index]["value"].length !== 0) {
      totalarr[index]["value"][0] += arr3[index]["value"][0];
      totalarr[index]["value"][1] += arr3[index]["value"][1];
      totalarr[index]["value"][2] += arr3[index]["value"][2];
      totalarr[index]["value"][3] += arr3[index]["value"][3];
    }
  });
  totalarr = totalarr.filter((item) => item["value"][0] !== 0);

  data2.value = [...totalarr];
  date2.value = [
    `${getLastMonDateFormatted(4, 1)}~${getLastMonDateFormatted(4, 7)}`,
    `${getLastMonDateFormatted(3, 1)}~${getLastMonDateFormatted(3, 7)}`,
    `${getLastMonDateFormatted(2, 1)}~${getLastMonDateFormatted(2, 7)}`,
    `${getLastMonDateFormatted(1, 1)}~${getLastMonDateFormatted(1, 7)}`,
  ];
};

//判斷484假日
function isWeekend(dateString) {
  if (dateString[3] === "日" || dateString[3] === "六") {
    return true;
  } else {
    return false;
  }
}

const data3 = ref([]);
const date3 = ref([]);
const setBarimg3 = (d1, d2, d3) => {
  const arr1 = [
    {
      city: "台北市",
      value: [],
    },
    {
      city: "新北市",
      value: [],
    },
    {
      city: "桃園市",
      value: [],
    },
    {
      city: "新竹縣",
      value: [],
    },
    {
      city: "新竹市",
      value: [],
    },
    {
      city: "竹科",
      value: [],
    },
    {
      city: "苗栗縣",
      value: [],
    },
    {
      city: "台中市",
      value: [],
    },
    {
      city: "嘉義市",
      value: [],
    },
    {
      city: "嘉義縣",
      value: [],
    },
    {
      city: "台南市",
      value: [],
    },
    {
      city: "高雄市",
      value: [],
    },
    {
      city: "屏東縣",
      value: [],
    },
    {
      city: "台東縣",
      value: [],
    },
  ];
  const arr2 = [
    {
      city: "台北市",
      value: [],
    },
    {
      city: "新北市",
      value: [],
    },
    {
      city: "桃園市",
      value: [],
    },
    {
      city: "新竹縣",
      value: [],
    },
    {
      city: "新竹市",
      value: [],
    },
    {
      city: "竹科",
      value: [],
    },
    {
      city: "苗栗縣",
      value: [],
    },
    {
      city: "台中市",
      value: [],
    },
    {
      city: "嘉義市",
      value: [],
    },
    {
      city: "嘉義縣",
      value: [],
    },
    {
      city: "台南市",
      value: [],
    },
    {
      city: "高雄市",
      value: [],
    },
    {
      city: "屏東縣",
      value: [],
    },
    {
      city: "台東縣",
      value: [],
    },
  ];
  const arr3 = [
    {
      city: "台北市",
      value: [],
    },
    {
      city: "新北市",
      value: [],
    },
    {
      city: "桃園市",
      value: [],
    },
    {
      city: "新竹縣",
      value: [],
    },
    {
      city: "新竹市",
      value: [],
    },
    {
      city: "竹科",
      value: [],
    },
    {
      city: "苗栗縣",
      value: [],
    },
    {
      city: "台中市",
      value: [],
    },
    {
      city: "嘉義市",
      value: [],
    },
    {
      city: "嘉義縣",
      value: [],
    },
    {
      city: "台南市",
      value: [],
    },
    {
      city: "高雄市",
      value: [],
    },
    {
      city: "屏東縣",
      value: [],
    },
    {
      city: "台東縣",
      value: [],
    },
  ];

  let totalarr = [
    {
      city: "台北市",
      value: [0, 0, 0, 0],
    },
    {
      city: "新北市",
      value: [0, 0, 0, 0],
    },
    {
      city: "桃園市",
      value: [0, 0, 0, 0],
    },
    {
      city: "新竹縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "新竹市",
      value: [0, 0, 0, 0],
    },
    {
      city: "竹科",
      value: [0, 0, 0, 0],
    },
    {
      city: "苗栗縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "台中市",
      value: [0, 0, 0, 0],
    },
    {
      city: "嘉義市",
      value: [0, 0, 0, 0],
    },
    {
      city: "嘉義縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "台南市",
      value: [0, 0, 0, 0],
    },
    {
      city: "高雄市",
      value: [0, 0, 0, 0],
    },
    {
      city: "屏東縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "台東縣",
      value: [0, 0, 0, 0],
    },
  ];

  let index1 = 0;
  if (d1.length > 1) {
    index1 = d1[0].indexOf("當日租借車次");
    d1.forEach((item, index) => {
      if (index === 0) {
        return;
      } else if (item[1] === "Newtaipei" && !isWeekend(item)) {
        arr1[1].value.push(item[index1]);
      } else if (item[1] === "Miaoli" && !isWeekend(item)) {
        arr1[6].value.push(item[index1]);
      } else if (item[1] === "Taoyuan" && !isWeekend(item)) {
        arr1[2].value.push(item[index1]);
      } else if (item[1] === "Taipei" && !isWeekend(item)) {
        arr1[0].value.push(item[index1]);
      } else if (item[1] === "Taichung" && !isWeekend(item)) {
        arr1[7].value.push(item[index1]);
      } else if (item[1] === "Hsinchu" && !isWeekend(item)) {
        arr1[4].value.push(item[index1]);
      }
    });
  }
  let index2 = 0;
  if (d2.length > 1) {
    index2 = d2[0].indexOf("當日租借車次");
    d2.forEach((item, index) => {
      if (index === 0) {
        return;
      } else if (item[1] === "Miaoli2" && !isWeekend(item)) {
        arr2[6].value.push(item[index1]);
      } else if (item[1] === "Chiayi2" && !isWeekend(item)) {
        arr2[8].value.push(item[index2]);
      } else if (item[1] === "Chiayi_Country2" && !isWeekend(item)) {
        arr2[9].value.push(item[index2]);
      } else if (item[1] === "Hsinchu2" && !isWeekend(item)) {
        arr2[4].value.push(item[index2]);
      } else if (item[1] === "HsinchuScience2" && !isWeekend(item)) {
        arr2[5].value.push(item[index2]);
      } else if (item[1] === "Hsinchu_Country2" && !isWeekend(item)) {
        arr2[3].value.push(item[index2]);
      } else if (item[1] === "Kaohsiung2" && !isWeekend(item)) {
        arr2[11].value.push(item[index2]);
      } else if (item[1] === "Newtaipei2" && !isWeekend(item)) {
        arr2[1].value.push(item[index2]);
      } else if (item[1] === "Pingtung2" && !isWeekend(item)) {
        arr2[12].value.push(item[index2]);
      } else if (item[1] === "Taitung2" && !isWeekend(item)) {
        arr2[13].value.push(item[index2]);
      } else if (item[1] === "Taichung2" && !isWeekend(item)) {
        arr2[7].value.push(item[index2]);
      } else if (item[1] === "Tainan2" && !isWeekend(item)) {
        arr2[10].value.push(item[index2]);
      } else if (item[1] === "Taipei2" && !isWeekend(item)) {
        arr2[0].value.push(item[index2]);
      } else if (item[1] === "Taoyuan2" && !isWeekend(item)) {
        arr2[2].value.push(item[index2]);
      }
    });
  }

  let index3 = 0;
  if (d3.length > 1) {
    index3 = d3[0].indexOf("當日租借車次");
    d3.forEach((item, index) => {
      if (index === 0) {
        return;
      } else if (item[1] === "Miaoli2E" && !isWeekend(item)) {
        arr3[6].value.push(item[index1]);
      } else if (item[1] === "Chiayi2E" && !isWeekend(item)) {
        arr3[8].value.push(item[index3]);
      } else if (item[1] === "HsinchuScience2E" && !isWeekend(item)) {
        arr3[5].value.push(item[index3]);
      } else if (item[1] === "Kaohsiung2E" && !isWeekend(item)) {
        arr3[11].value.push(item[index3]);
      } else if (item[1] === "Pingtung2E" && !isWeekend(item)) {
        arr3[12].value.push(item[index3]);
      } else if (item[1] === "Taitung2E" && !isWeekend(item)) {
        arr3[13].value.push(item[index3]);
      } else if (item[1] === "Taichung2E" && !isWeekend(item)) {
        arr3[7].value.push(item[index3]);
      } else if (item[1] === "Tainan2E" && !isWeekend(item)) {
        arr3[10].value.push(item[index3]);
      } else if (item[1] === "Taipei2E" && !isWeekend(item)) {
        arr3[0].value.push(item[index3]);
      } else if (item[1] === "Taoyuan2E" && !isWeekend(item)) {
        arr3[2].value.push(item[index3]);
      } else if (item[1] === "Newtaipei2E" && !isWeekend(item)) {
        arr3[1].value.push(item[index3]);
      } else if (item[1] === "Hsinchu_Country2E" && !isWeekend(item)) {
        arr3[3].value.push(item[index3]);
      }
    });
  }

  totalarr.forEach((item, index) => {
    if (arr1[index]["value"].length !== 0) {
      arr1[index]["value"].forEach((item, indexs) => {
        if (indexs >= 0 && indexs <= 4) {
          totalarr[index]["value"][0] += item;
        } else if (indexs >= 5 && indexs <= 9) {
          totalarr[index]["value"][1] += item;
        } else if (indexs >= 10 && indexs <= 14) {
          totalarr[index]["value"][2] += item;
        } else if (indexs >= 15 && indexs <= 19) {
          totalarr[index]["value"][3] += item;
        }
      });
    }
    if (arr2[index]["value"].length !== 0) {
      arr2[index]["value"].forEach((item, indexs) => {
        if (indexs >= 0 && indexs <= 4) {
          totalarr[index]["value"][0] += item;
        } else if (indexs >= 5 && indexs <= 9) {
          totalarr[index]["value"][1] += item;
        } else if (indexs >= 10 && indexs <= 14) {
          totalarr[index]["value"][2] += item;
        } else if (indexs >= 15 && indexs <= 19) {
          totalarr[index]["value"][3] += item;
        }
      });
    }
    if (arr3[index]["value"].length !== 0) {
      arr3[index]["value"].forEach((item, indexs) => {
        if (indexs >= 0 && indexs <= 4) {
          totalarr[index]["value"][0] += item;
        } else if (indexs >= 5 && indexs <= 9) {
          totalarr[index]["value"][1] += item;
        } else if (indexs >= 10 && indexs <= 14) {
          totalarr[index]["value"][2] += item;
        } else if (indexs >= 15 && indexs <= 19) {
          totalarr[index]["value"][3] += item;
        }
      });
    }
  });
  totalarr = totalarr.filter((item) => item["value"][0] !== 0);
  data3.value = [...totalarr];
  date3.value = [
    `${getLastMonDateFormatted(4, 1)}~${getLastMonDateFormatted(4, 7)}`,
    `${getLastMonDateFormatted(3, 1)}~${getLastMonDateFormatted(3, 7)}`,
    `${getLastMonDateFormatted(2, 1)}~${getLastMonDateFormatted(2, 7)}`,
    `${getLastMonDateFormatted(1, 1)}~${getLastMonDateFormatted(1, 7)}`,
  ];
};

const data4 = ref([]);
const date4 = ref([]);
const setBarimg4 = (d1, d2, d3) => {
  const arr1 = [
    {
      city: "台北市",
      value: [],
    },
    {
      city: "新北市",
      value: [],
    },
    {
      city: "桃園市",
      value: [],
    },
    {
      city: "新竹縣",
      value: [],
    },
    {
      city: "新竹市",
      value: [],
    },
    {
      city: "竹科",
      value: [],
    },
    {
      city: "苗栗縣",
      value: [],
    },
    {
      city: "台中市",
      value: [],
    },
    {
      city: "嘉義市",
      value: [],
    },
    {
      city: "嘉義縣",
      value: [],
    },
    {
      city: "台南市",
      value: [],
    },
    {
      city: "高雄市",
      value: [],
    },
    {
      city: "屏東縣",
      value: [],
    },
    {
      city: "台東縣",
      value: [],
    },
  ];
  const arr2 = [
    {
      city: "台北市",
      value: [],
    },
    {
      city: "新北市",
      value: [],
    },
    {
      city: "桃園市",
      value: [],
    },
    {
      city: "新竹縣",
      value: [],
    },
    {
      city: "新竹市",
      value: [],
    },
    {
      city: "竹科",
      value: [],
    },
    {
      city: "苗栗縣",
      value: [],
    },
    {
      city: "台中市",
      value: [],
    },
    {
      city: "嘉義市",
      value: [],
    },
    {
      city: "嘉義縣",
      value: [],
    },
    {
      city: "台南市",
      value: [],
    },
    {
      city: "高雄市",
      value: [],
    },
    {
      city: "屏東縣",
      value: [],
    },
    {
      city: "台東縣",
      value: [],
    },
  ];
  const arr3 = [
    {
      city: "台北市",
      value: [],
    },
    {
      city: "新北市",
      value: [],
    },
    {
      city: "桃園市",
      value: [],
    },
    {
      city: "新竹縣",
      value: [],
    },
    {
      city: "新竹市",
      value: [],
    },
    {
      city: "竹科",
      value: [],
    },
    {
      city: "苗栗縣",
      value: [],
    },
    {
      city: "台中市",
      value: [],
    },
    {
      city: "嘉義市",
      value: [],
    },
    {
      city: "嘉義縣",
      value: [],
    },
    {
      city: "台南市",
      value: [],
    },
    {
      city: "高雄市",
      value: [],
    },
    {
      city: "屏東縣",
      value: [],
    },
    {
      city: "台東縣",
      value: [],
    },
  ];

  let totalarr = [
    {
      city: "台北市",
      value: [0, 0, 0, 0],
    },
    {
      city: "新北市",
      value: [0, 0, 0, 0],
    },
    {
      city: "桃園市",
      value: [0, 0, 0, 0],
    },
    {
      city: "新竹縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "新竹市",
      value: [0, 0, 0, 0],
    },
    {
      city: "竹科",
      value: [0, 0, 0, 0],
    },
    {
      city: "苗栗縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "台中市",
      value: [0, 0, 0, 0],
    },
    {
      city: "嘉義市",
      value: [0, 0, 0, 0],
    },
    {
      city: "嘉義縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "台南市",
      value: [0, 0, 0, 0],
    },
    {
      city: "高雄市",
      value: [0, 0, 0, 0],
    },
    {
      city: "屏東縣",
      value: [0, 0, 0, 0],
    },
    {
      city: "台東縣",
      value: [0, 0, 0, 0],
    },
  ];

  let index1 = 0;
  if (d1.length > 1) {
    index1 = d1[0].indexOf("當日租借車次");
    d1.forEach((item, index) => {
      if (index === 0) {
        return;
      } else if (item[1] === "Newtaipei" && isWeekend(item)) {
        arr1[1].value.push(item[index1]);
      } else if (item[1] === "Miaoli" && isWeekend(item)) {
        arr1[6].value.push(item[index1]);
      } else if (item[1] === "Taoyuan" && isWeekend(item)) {
        arr1[2].value.push(item[index1]);
      } else if (item[1] === "Taipei" && !isWeekend(item)) {
        arr1[0].value.push(item[index1]);
      } else if (item[1] === "Taichung" && !isWeekend(item)) {
        arr1[7].value.push(item[index1]);
      } else if (item[1] === "Hsinchu" && !isWeekend(item)) {
        arr1[4].value.push(item[index1]);
      }
    });
  }
  let index2 = 0;
  if (d2.length > 1) {
    index2 = d2[0].indexOf("當日租借車次");
    d2.forEach((item, index) => {
      if (index === 0) {
        return;
      } else if (item[1] === "Miaoli2" && isWeekend(item)) {
        arr2[6].value.push(item[index2]);
      } else if (item[1] === "Chiayi2" && isWeekend(item)) {
        arr2[8].value.push(item[index2]);
      } else if (item[1] === "Chiayi_Country2" && isWeekend(item)) {
        arr2[9].value.push(item[index2]);
      } else if (item[1] === "Hsinchu2" && isWeekend(item)) {
        arr2[4].value.push(item[index2]);
      } else if (item[1] === "HsinchuScience2" && isWeekend(item)) {
        arr2[5].value.push(item[index2]);
      } else if (item[1] === "Hsinchu_Country2" && isWeekend(item)) {
        arr2[3].value.push(item[index2]);
      } else if (item[1] === "Kaohsiung2" && isWeekend(item)) {
        arr2[11].value.push(item[index2]);
      } else if (item[1] === "Newtaipei2" && isWeekend(item)) {
        arr2[1].value.push(item[index2]);
      } else if (item[1] === "Pingtung2" && isWeekend(item)) {
        arr2[12].value.push(item[index2]);
      } else if (item[1] === "Taitung2" && isWeekend(item)) {
        arr2[13].value.push(item[index2]);
      } else if (item[1] === "Taichung2" && isWeekend(item)) {
        arr2[7].value.push(item[index2]);
      } else if (item[1] === "Tainan2" && isWeekend(item)) {
        arr2[10].value.push(item[index2]);
      } else if (item[1] === "Taipei2" && isWeekend(item)) {
        arr2[0].value.push(item[index2]);
      } else if (item[1] === "Taoyuan2" && isWeekend(item)) {
        arr2[2].value.push(item[index2]);
      }
      // "Taoyuan2"
    });
  }

  let index3 = 0;
  if (d3.length > 1) {
    index3 = d3[0].indexOf("當日租借車次");
    d3.forEach((item, index) => {
      if (index === 0) {
        return;
      } else if (item[1] === "Miaoli2E" && isWeekend(item)) {
        arr3[6].value.push(item[index3]);
      } else if (item[1] === "Chiayi2E" && isWeekend(item)) {
        arr3[8].value.push(item[index3]);
      } else if (item[1] === "HsinchuScience2E" && isWeekend(item)) {
        arr3[5].value.push(item[index3]);
      } else if (item[1] === "Kaohsiung2E" && isWeekend(item)) {
        arr3[11].value.push(item[index3]);
      } else if (item[1] === "Pingtung2E" && isWeekend(item)) {
        arr3[12].value.push(item[index3]);
      } else if (item[1] === "Taitung2E" && isWeekend(item)) {
        arr3[13].value.push(item[index3]);
      } else if (item[1] === "Taichung2E" && isWeekend(item)) {
        arr3[7].value.push(item[index3]);
      } else if (item[1] === "Tainan2E" && isWeekend(item)) {
        arr3[10].value.push(item[index3]);
      } else if (item[1] === "Taipei2E" && !isWeekend(item)) {
        arr3[0].value.push(item[index3]);
      } else if (item[1] === "Taoyuan2E" && !isWeekend(item)) {
        arr3[2].value.push(item[index3]);
      } else if (item[1] === "Newtaipei2E" && !isWeekend(item)) {
        arr3[1].value.push(item[index3]);
      } else if (item[1] === "Hsinchu_Country2E" && !isWeekend(item)) {
        arr3[3].value.push(item[index3]);
      }
    });
  }
  totalarr.forEach((item, index) => {
    if (arr1[index]["value"].length !== 0) {
      arr1[index]["value"].forEach((item, indexs) => {
        if (indexs >= 0 && indexs <= 1) {
          totalarr[index]["value"][0] += item;
        } else if (indexs >= 2 && indexs <= 3) {
          totalarr[index]["value"][1] += item;
        } else if (indexs >= 4 && indexs <= 5) {
          totalarr[index]["value"][2] += item;
        } else if (indexs >= 6 && indexs <= 7) {
          totalarr[index]["value"][3] += item;
        }
      });
    }
    if (arr2[index]["value"].length !== 0) {
      arr2[index]["value"].forEach((item, indexs) => {
        if (indexs >= 0 && indexs <= 1) {
          totalarr[index]["value"][0] += item;
        } else if (indexs >= 2 && indexs <= 3) {
          totalarr[index]["value"][1] += item;
        } else if (indexs >= 4 && indexs <= 5) {
          totalarr[index]["value"][2] += item;
        } else if (indexs >= 6 && indexs <= 7) {
          totalarr[index]["value"][3] += item;
        }
      });
    }
    if (arr3[index]["value"].length !== 0) {
      arr3[index]["value"].forEach((item, indexs) => {
        if (indexs >= 0 && indexs <= 1) {
          totalarr[index]["value"][0] += item;
        } else if (indexs >= 2 && indexs <= 3) {
          totalarr[index]["value"][1] += item;
        } else if (indexs >= 4 && indexs <= 5) {
          totalarr[index]["value"][2] += item;
        } else if (indexs >= 6 && indexs <= 7) {
          totalarr[index]["value"][3] += item;
        }
      });
    }
  });

  totalarr = totalarr.filter((item) => item["value"][0] !== 0);
  data4.value = [...totalarr];
  date4.value = [
    `${getLastMonDateFormatted(4, 1)}~${getLastMonDateFormatted(4, 7)}`,
    `${getLastMonDateFormatted(3, 1)}~${getLastMonDateFormatted(3, 7)}`,
    `${getLastMonDateFormatted(2, 1)}~${getLastMonDateFormatted(2, 7)}`,
    `${getLastMonDateFormatted(1, 1)}~${getLastMonDateFormatted(1, 7)}`,
  ];
};
</script>

<style lang="scss" scoped></style>
