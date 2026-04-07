<template>
  <div>
    <div class="row">
      <div class="col-md-6 px-1 py-1">
        <TreecharComponent
          title="1.0場站數"
          :date="yesterdaydate"
          :treetitle="treetitle6"
          :data="data6"
        ></TreecharComponent>
      </div>
      <div class="col-md-6 px-1 py-1">
        <TreecharComponent
          title="2.0場站數"
          :date="yesterdaydate"
          :treetitle="treetitle7"
          :data="data7"
        ></TreecharComponent>
      </div>
      <div class="col-md-4 px-1 py-1">
        <TreecharComponent
          title="1.0車輛數"
          :date="yesterdaydate"
          :treetitle="treetitle8"
          :data="data8"
        ></TreecharComponent>
      </div>
      <div class="col-md-4 px-1 py-1">
        <TreecharComponent
          title="2.0車輛數"
          :date="yesterdaydate"
          :treetitle="treetitle9"
          :data="data9"
        ></TreecharComponent>
      </div>
      <div class="col-md-4 px-1 py-1">
        <TreecharComponent
          title="2.0E車輛數"
          :date="yesterdaydate"
          :treetitle="treetitle10"
          :data="data10"
        ></TreecharComponent>
      </div>
      <div class="col-md-6 px-1 py-1">
        <TreecharComponent
          title="1.0車柱數"
          :date="yesterdaydate"
          :treetitle="treetitle11"
          :data="data11"
        ></TreecharComponent>
      </div>
      <div class="col-md-6 px-1 py-1">
        <TreecharComponent
          title="2.0車柱數"
          :date="yesterdaydate"
          :treetitle="treetitle12"
          :data="data12"
        ></TreecharComponent>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 px-1 py-1">
        <PiechartComponent
          :data="data1"
          title="騎乘次數(全系統)"
          :secondtitle="yesterdaydate"
        ></PiechartComponent>
      </div>
      <div class="col-md-6 px-1 py-1">
        <PiechartComponent
          :data="data2"
          title="騎乘次數(1.0)"
          :secondtitle="yesterdaydate"
        ></PiechartComponent>
      </div>
      <div class="col-md-6 px-1 py-1">
        <PiechartComponent
          :data="data3"
          title="騎乘次數(2.0)"
          :secondtitle="yesterdaydate"
        ></PiechartComponent>
      </div>
      <div class="col-md-6 px-1 py-1">
        <PiechartComponent
          :data="data4"
          title="騎乘次數(2.0E)"
          :secondtitle="yesterdaydate"
        ></PiechartComponent>
      </div>
    </div>
    <div class="row">
      <div class="px-1 py-1">
        <BarchartComponent :data="data5" :date="date5"></BarchartComponent>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "../../stores/userdata";
import PiechartComponent from "../../components/PiechartComponent.vue";
import BarchartComponent from "../../components/BarcharComponent.vue";
import TreecharComponent from "../../components/TreecharComponent.vue";
import "vue-loading-overlay/dist/css/index.css";
import axios from "axios";
import { ref } from "vue";
const store = useUserStore();
const canusecitys = store.citys;

const yesterdaydate = ref();

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

//城市英文轉中文
const editName = (name) => {
  if (name === "Newtaipei") {
    return "新北市";
  } else if (name === "Miaoli") {
    return "苗栗縣";
  } else if (name === "Miaoli2") {
    return "苗栗縣";
  } else if (name === "Taoyuan") {
    return "桃園市";
  } else if (name === "Kaohsiung2") {
    return "高雄市";
  } else if (name === "Chiayi2") {
    return "嘉義市";
  } else if (name === "Chiayi_Country2") {
    return "嘉義縣";
  } else if (name === "Hsinchu2") {
    return "新竹市";
  } else if (name === "HsinchuScience2") {
    return "竹科";
  } else if (name === "Hsinchu_Country2") {
    return "新竹縣";
  } else if (name === "Newtaipei2") {
    return "新北市";
  } else if (name === "Pingtung2") {
    return "屏東縣";
  } else if (name === "Taitung2") {
    return "台東縣";
  } else if (name === "Taichung2") {
    return "台中市";
  } else if (name === "Taipei2") {
    return "台北市";
  } else if (name === "Tainan2") {
    return "台南市";
  }
};

const getonedaydata = async () => {
  yesterdaydate.value = getday(1);

  //給非停車柱
  let city = [];

  //給停車柱 1.0
  let city2 = [];
  //給停車住 2.0
  let city3 = [];
  //製作要得日期陣列start
  if (canusecitys.includes(2)) {
    city.push("台北市2.0", "台北市2.0E");
    city3.push("Taipei2");
  }
  if (canusecitys.includes(3)) {
    city.push("新北市", "新北市2.0", "新北市2.0E");
    city2.push("Newtaipei");
    city3.push("Newtaipei2");
  }
  if (canusecitys.includes(4)) {
    city.push("桃園市", "桃園市2.0", "桃園市2.0E");
    city2.push("Taoyuan", "Taoyuan2");
  }
  if (canusecitys.includes(6)) {
    city.push("新竹縣2.0", "新竹縣2.0E");
    city3.push("Hsinchu_Country2");
  }
  if (canusecitys.includes(5)) {
    city.push("新竹市2.0", "新竹市2.0E");
    city3.push("Hsinchu2");
  }
  if (canusecitys.includes(20)) {
    city.push("竹科2.0", "竹科2.0E");
    city3.push("HsinchuScience2");
  }
  if (canusecitys.includes(7)) {
    city.push("苗栗縣", "苗栗縣2.0", "苗栗縣2.0E");
    city2.push("Miaoli");
    city3.push("Miaoli2");
  }
  if (canusecitys.includes(8)) {
    city.push("台中市2.0", "台中市2.0E");
    city3.push("Taichung2");
  }
  if (canusecitys.includes(12)) {
    city.push("嘉義市2.0", "嘉義市2.0E");
    city3.push("Chiayi_Country2");
  }

  if (canusecitys.includes(13)) {
    city.push("嘉義縣2.0", "嘉義縣2.0E");
    city3.push("Chiayi2");
  }

  if (canusecitys.includes(14)) {
    city.push("台南市2.0", "台南市2.0E");
    city3.push("Tainan2");
  }
  if (canusecitys.includes(15)) {
    city.push("高雄市2.0", "高雄市2.0E");
    city3.push("Kaohsiung2");
  }

  if (canusecitys.includes(16)) {
    city.push("屏東縣2.0", "屏東縣2.0E");
    city3.push("Pingtung2");
  }

  if (canusecitys.includes(19)) {
    city.push("台東縣2.0", "台東縣2.0E");
    city3.push("Taitung2");
  }
  //end

  const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;

  //圓餅圖專用
  const params1 = {
    dataset_id: "founder_report",
    table_id: "daily_summary_Taiwan",
    begin_date: getday(1),
    end_date: getday(1),
    city: city.length === 0 ? [""] : city,
  };
  //折線圖
  const params2 = {
    dataset_id: "founder_report",
    table_id: "daily_summary_Taiwan",
    begin_date: getday(7),
    end_date: getday(1),
    city: ["台灣合計"],
  };

  //停車柱 1.0
  const params3 = {
    dataset_id: "report",
    table_id: "daily_report_query1",
    begin_date: getday(1),
    end_date: getday(1),
    city: city2,
  };
  //停車柱 2.0
  const params4 = {
    dataset_id: "report",
    table_id: "daily_report_query2",
    begin_date: getday(1),
    end_date: getday(1),
    city: city3,
  };

  const res = await Promise.all([
    axios.get(url, { params: params1 }),
    axios.get(url, { params: params2 }),
    axios.get(url, { params: params3 }),
    axios.get(url, { params: params4 }),
  ]);

  const data1 = res[0].data.data;
  //圓餅圖
  setPieimg1(data1);
  setPieimg2(data1);
  setPieimg3(data1);
  setPieimg4(data1);
  setTreeimg5(data1);
  //樹狀圖
  setTreeimg1(data1);
  setTreeimg2(data1);
  setTreeimg3(data1);
  setTreeimg4(data1);
  //長條圖
  const data2 = res[1].data.data;
  setBarimg5(data2);

  //停車柱 1.0
  const data3 = res[2].data.data;
  const data4 = res[3].data.data;
  setTreeimg6(data3);

  // console.log(data4);
  setTreeimg7(data4);
};
getonedaydata();

const data1 = ref([]);
const setPieimg1 = (data) => {
  let arr = [
    { value: 0, name: "YB1.0" },
    { value: 0, name: "YB2.0" },
    { value: 0, name: "YB2.0E" },
  ];

  data.forEach((element) => {
    if (element.city.includes("2.0E")) {
      arr[2]["value"] += element.rent_number;
    } else if (element.city.includes("2.0")) {
      arr[1]["value"] += element.rent_number;
    } else {
      arr[0]["value"] += element.rent_number;
    }
  });
  data1.value = [...arr];
};

const data2 = ref([]);
const setPieimg2 = (data) => {
  let arr = [];
  data.forEach((item) => {
    if (!item.city.includes("2.0") && !item.city.includes("2.0E")) {
      arr.push({
        value: item.rent_number,
        name: item.city,
      });
    }
  });
  data2.value = [...arr];
};

const data3 = ref([]);
const setPieimg3 = (data) => {
  let arr = [];
  data.forEach((item) => {
    if (!item.city.includes("2.0E") && item.city.includes("2.0")) {
      arr.push({
        value: item.rent_number,
        name: item.city.replace("2.0", ""),
      });
    }
  });
  data3.value = [...arr];
};

const data4 = ref([]);
const setPieimg4 = (data) => {
  let arr = [];
  data.forEach((item) => {
    if (item.city.includes("2.0E")) {
      arr.push({
        value: item.rent_number,
        name: item.city.replace("2.0E", ""),
      });
    }
  });
  data4.value = [...arr];
};

const data5 = ref([]);
const date5 = ref([]);
const setBarimg5 = (data) => {
  let datevalue = [];
  let datavalue = [];
  data.forEach((item) => {
    datavalue.push(item.rent_number);
    datevalue.push(item.date);
  });

  datevalue.forEach((item, index) => {
    const date = new Date(item);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    datevalue[index] = `${year}-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  });
  data5.value = [...datavalue];

  date5.value = [...datevalue];
};

const data6 = ref([]);
const treetitle6 = ref("");
const setTreeimg1 = (data) => {
  //小排到大
  let arr = [];
  data.forEach((element) => {
    if (!element.city.includes("2.0")) {
      arr.push(element);
    }
  });
  let treedata = [];
  let total = 0;
  arr.forEach((item) => {
    treedata.push({ name: `${item.city}:${item.current_station}` });
    total += item.current_station;
  });
  data6.value = [...treedata];
  treetitle6.value = `總站數:${total}`;
};

const data7 = ref([]);
const treetitle7 = ref("");
const setTreeimg2 = (data) => {
  //小排到大
  let arr = [];
  data.forEach((element) => {
    if (!element.city.includes("2.0E") && element.city.includes("2.0")) {
      arr.push(element);
    }
  });
  let treedata = [];
  let total = 0;
  arr.forEach((item) => {
    let city = item.city.replace("2.0", "");
    treedata.push({ name: `${city}:${item.current_station}` });
    total += item.current_station;
  });
  data7.value = [...treedata];
  treetitle7.value = `總站數:${total}`;
};

const data8 = ref([]);
const treetitle8 = ref("");
const setTreeimg3 = (data) => {
  //小排到大

  let arr = [];
  data.forEach((element) => {
    if (!element.city.includes("2.0")) {
      arr.push(element);
    }
  });
  let treedata = [];
  let total = 0;
  arr.forEach((item) => {
    let city = item.city.replace("2.0", "");
    treedata.push({ name: `${city}:${item.bike_number}` });
    total += item.bike_number;
  });
  data8.value = [...treedata];
  treetitle8.value = `總車輛數:${total}`;
};

const data9 = ref([]);
const treetitle9 = ref("");
const setTreeimg4 = (data) => {
  //小排到大

  let arr = [];
  data.forEach((element) => {
    if (!element.city.includes("2.0E") && element.city.includes("2.0")) {
      arr.push(element);
    }
  });
  let treedata = [];
  let total = 0;
  arr.forEach((item) => {
    let city = item.city.replace("2.0", "");
    treedata.push({ name: `${city}:${item.bike_number}` });
    total += item.bike_number;
  });
  data9.value = [...treedata];
  treetitle9.value = `總車輛數:${total}`;
};

const data10 = ref([]);
const treetitle10 = ref("");
const setTreeimg5 = (data) => {
  //小排到大

  let arr = [];
  data.forEach((element) => {
    if (element.city.includes("2.0E")) {
      arr.push(element);
    }
  });
  let treedata = [];
  let total = 0;
  arr.forEach((item) => {
    let city = item.city.replace("2.0E", "");
    treedata.push({ name: `${city}:${item.bike_number}` });
    total += item.bike_number;
  });
  data10.value = [...treedata];
  treetitle10.value = `總車輛數:${total}`;
};

const data11 = ref([]);
const treetitle11 = ref("");
const setTreeimg6 = (data) => {
  let treedata = [];
  let total = 0;
  let index;
  let arr = [];
  if (data.length > 0) {
    index = data[0].indexOf("總停車位");
    const clear = () => {
      arr = [
        {
          city: "新北市",
          value: 0,
        },
        {
          city: "桃園市",
          value: 0,
        },
        {
          city: "苗栗縣",
          value: 0,
        },
      ];
    };
    clear();
    data.forEach((items, i) => {
      if (i === 0) return;
      arr.forEach((item, is) => {
        if (item.city === editName(items[1])) {
          arr[is]["value"] = items[index] / 2;
        }
      });
    });

    arr.forEach((item) => {
      if (item.value !== 0) {
        //item單一項目
        treedata.push({ name: `${item.city}:${item.value}` });
        //總數
        total += item.value;
      }
    });
  }
  data11.value = [...treedata];
  treetitle11.value = `總車柱數:${total}`;
};

const data12 = ref([]);
const treetitle12 = ref("");
const setTreeimg7 = (data) => {
  if (data.length === 0) {
    return;
  }
  const index = data[0].indexOf("總停車位");
  let arr = [];

  const clear = () => {
    arr = [
      {
        city: "台北市",
        value: null,
      },
      {
        city: "新北市",
        value: null,
      },
      {
        city: "新竹縣",
        value: null,
      },
      {
        city: "新竹市",
        value: null,
      },
      {
        city: "竹科",
        value: null,
      },
      {
        city: "苗栗縣",
        value: null,
      },
      {
        city: "台中市",
        value: null,
      },
      {
        city: "嘉義市",
        value: null,
      },
      {
        city: "嘉義縣",
        value: null,
      },
      {
        city: "台南市",
        value: null,
      },
      {
        city: "高雄市",
        value: null,
      },
      {
        city: "屏東縣",
        value: null,
      },
      {
        city: "台東縣",
        value: null,
      },
    ];
  };
  clear();
  data.forEach((items, i) => {
    // console.log(items);
    if (i === 0) return;
    arr.forEach((item, is) => {
      if (item.city === editName(items[1])) {
        arr[is]["value"] = items[index];
      }
    });
  });

  let treedata = [];
  let total = 0;
  arr.forEach((item) => {
    if (item.value) {
      //item單一項目
      treedata.push({ name: `${item.city}:${item.value}` });
      //總數
      total += item.value;
    }
  });

  data12.value = [...treedata];

  treetitle12.value = `總車住數:${total}`;
};
</script>

<style lang="scss" scoped></style>
