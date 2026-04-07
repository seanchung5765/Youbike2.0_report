<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">投保率分析週報</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">城市:</label>
      </div>
      <div class="row mx-0 ms-md-2 align-items-center col-md-2 col-12 px-0 mt-md-0">
        <n-select
          v-model:value="city"
          placeholder="請選擇"
          multiple
          :options="cityoptions"
          :max-tag-count="1"
          size="medium"
        />
      </div>
      <div class="row col-md-auto col-12 ps-md-0 pe-md-3 mx-auto mx-md-0">
        <button
          type="button"
          class="btn btn-success text-light mt-3 mt-md-0"
          @click="setallcity"
        >
          城市全選
        </button>
      </div>
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">日期:</label>
      </div>
      <div class="row mx-0 ms-md-2 align-items-center col-md-2 col-12 px-0 mt-md-0">
        <n-select
          v-model:value="date"
          placeholder="請選擇日期"
          multiple
          :options="dateoptions"
          :max-tag-count="1"
          size="medium"
        />
      </div>
      <div class="row col-md-auto col-12 ps-md-0 pe-md-3 mx-auto mx-md-0">
        <button
          type="button"
          class="btn btn-success text-light mt-3 mt-md-0"
          @click="setalldate"
        >
          日期全選
        </button>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <button
          type="button"
          class="btn btn-success text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="search"
        >
          搜尋
        </button>
        <output-excel
          class="btn btn-primary text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          :data="exceldata"
          :name="excelename"
          :header="excelecolumn"
        />
      </div>
    </form>
    <n-data-table
      v-show="data.length > 0"
      ref="dataTable"
      :data="data"
      :columns="column"
      :pagination="{ pageSize: 17 }"
      :max-height="600"
      :scroll-x="1000"
      :bordered="false"
      size="small"
      :single-line="false"
      striped
    />
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, inject } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NSelect } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
const ischange = inject("ischange");
const swal = inject("$swal");
async function NotAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const isLoading = ref(false);
const dataTable = ref();
import { useUserStore } from "../../stores/userdata";
const store = useUserStore();
const canusecitys = store.citys;
const data = ref([]);
const date = ref([]);
const city = ref([]);
let exceldata = [];
let excelename = "";
let excelecolumn = [];
const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [];
  excelename = "";
  excelecolumn = [];
  exceldata = [...nowdata];
  excelename = name;
  nowcolumn.forEach((item) => {
    excelecolumn.push(item.title);
  });
};

function getArrayOfMondays() {
  const startDate = new Date("2018-01-01"); // 開始日期為 2018 年 1 月
  const currentDate = new Date(); // 當前日期

  const mondaysArray = [];
  let currentMonday = new Date(startDate);

  // 找出從 2018 年開始的每個禮拜一的日期
  while (currentMonday <= currentDate) {
    const dayOfWeek = currentMonday.getDay(); // 取得星期幾，星期日為0，星期一為1，以此類推
    if (dayOfWeek === 1) {
      // 如果是星期一
      const year = currentMonday.getFullYear();
      const month = String(currentMonday.getMonth() + 1).padStart(2, "0");
      const day = String(currentMonday.getDate()).padStart(2, "0");
      const value = `${year}-${month}-${day}`;
      mondaysArray.push({ label: value, value: value });
    }
    currentMonday.setDate(currentMonday.getDate() + 1); // 前進一天
  }
  mondaysArray.reverse();
  return mondaysArray;
}

//城市
let cityoptions = [
  {
    label: "全公司",
    value: "全公司",
  },
  {
    label: "台北市",
    value: "台北市",
    disabled: !canusecitys.includes(2),
  },
  {
    label: "新北市",
    value: "新北市",
    disabled: !canusecitys.includes(3),
  },
  {
    label: "桃園市",
    value: "桃園市",
    disabled: !canusecitys.includes(4),
  },
  {
    label: "新竹市+竹科",
    value: "新竹市+竹科",
    disabled: !canusecitys.includes(5) || !canusecitys.includes(20),
  },
  {
    label: "新竹市",
    value: "新竹市",
    disabled: !canusecitys.includes(5),
  },
  {
    label: "新竹縣",
    value: "新竹縣",
    disabled: !canusecitys.includes(6),
  },
  {
    label: "竹科",
    value: "竹科",
    disabled: !canusecitys.includes(20),
  },
  {
    label: "苗栗縣",
    value: "苗栗縣",
    disabled: !canusecitys.includes(7),
  },
  {
    label: "台中市",
    value: "台中市",
    disabled: !canusecitys.includes(8),
  },
  {
    label: "彰化縣",
    value: "彰化縣",
    disabled: !canusecitys.includes(9),
  },
  {
    label: "嘉義市",
    value: "嘉義市",
    disabled: !canusecitys.includes(12),
  },
  {
    label: "嘉義縣",
    value: "嘉義縣",
    disabled: !canusecitys.includes(13),
  },
  {
    label: "台南市",
    value: "台南市",
    disabled: !canusecitys.includes(14),
  },
  {
    label: "高雄市",
    value: "高雄市",
    disabled: !canusecitys.includes(15),
  },
  {
    label: "屏東縣",
    value: "屏東縣",
    disabled: !canusecitys.includes(16),
  },
  {
    label: "台東縣",
    value: "台東縣",
    disabled: !canusecitys.includes(19),
  },
];
let dateoptions = [];
(function start() {
  let arr = [];

  //城市迴圈
  cityoptions.forEach((item) => {
    if (item.disabled) {
      return;
    } else {
      arr.push(item);
    }
  });
  cityoptions = [...arr];

  const result = getArrayOfMondays();
  result.shift();
  dateoptions = [...result];
})();

//城市全選
const setallcity = () => {
  let arr = [];
  cityoptions.forEach((item) => {
    arr.push(item.value);
  });
  city.value = arr;
};

//日齊全選
const setalldate = () => {
  let arr = [];
  dateoptions.forEach((item) => {
    arr.push(item.value);
  });
  date.value = [...arr];
};

const column = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "週次",
    width: 150,
  },
  {
    key: "item2",
    align: "center",
    title: "縣市",
  },
  {
    key: "item3",
    align: "center",
    title: "總會員卡數(A)",
  },
  {
    key: "item4",
    align: "center",
    title: "總騎乘次數(B)",
  },
  {
    key: "item5",
    align: "center",
    title: "有使用紀錄會員卡數(C)",
  },
  {
    key: "item6",
    align: "center",
    title: "註冊地卡數",
  },
  {
    key: "item7",
    align: "center",
    title: "非註冊地卡數",
  },
  {
    key: "item8",
    align: "center",
    title: "有使用記錄卡片占比(D=C/A)",
  },
  {
    key: "item9",
    align: "center",
    title: "有使用記錄卡片加保張數(E)",
  },
  {
    key: "item10",
    align: "center",
    title: "保險涵蓋率_卡片數(F=E/C)",
  },
  {
    key: "item11",
    align: "center",
    title: "有加保卡片的騎乘次數(G)",
  },
  {
    key: "item12",
    align: "center",
    title: "保險涵蓋率_使用次數(H=G/B)",
  },
];

const getData = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "report",
      table_id: "weekly_report_ride_INSUR",
      date: date.value,
      city: city.value,
    };
    isLoading.value = true;
    const res = await axios.get(url, { params });
    isLoading.value = false;
    const saultdata = res.data.data;
    let arr = [];
    saultdata.forEach((i) => {
      arr.push({
        item1: i.week_range,
        item2: i.city,
        item3: i.total_card,
        item4: i.ride_times,
        item5: i.ride_card,
        item6: i.ride_card_incity,
        item7: i.ride_card_nocity,
        item8: i.active_per,
        item9: i.ride_card_INSUR,
        item10: i.ride_card_INSUR_per,
        item11: i.ride_times_INSUR,
        item12: i.ride_times_INSUR_per,
      });
    });
    data.value = [...arr];
    makeExecl(data.value, column, "投保率分析週報");
  } catch (error) {
    console.log(error);
  }
};
const search = () => {
  if (city.value.length === 0) {
    return NotAlert("請選擇城市");
  } else if (date.value.length === 0) {
    return NotAlert("請選擇每周一日期");
  }
  getData();
};
</script>

<style></style>
