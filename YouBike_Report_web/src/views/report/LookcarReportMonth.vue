<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">見車率統計月報</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >城市:</label
        >
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="city"
          >
            <option selected disabled>請選擇</option>
            <option value="台北市" v-if="canusecitys.includes(2)">
              台北市
            </option>
            <option value="新北市" v-if="canusecitys.includes(3)">
              新北市
            </option>
            <option value="桃園市" v-if="canusecitys.includes(4)">
              桃園市
            </option>
            <option value="新竹市" v-if="canusecitys.includes(5)">
              新竹市
            </option>
            <option value="新竹縣" v-if="canusecitys.includes(6)">
              新竹縣
            </option>
            <option value="竹科" v-if="canusecitys.includes(20)">竹科</option>
            <option value="苗栗縣" v-if="canusecitys.includes(7)">
              苗栗縣
            </option>
            <option value="台中市" v-if="canusecitys.includes(8)">
              台中市
            </option>
            <option value="嘉義市" v-if="canusecitys.includes(12)">
              嘉義市
            </option>
            <option value="嘉義縣" v-if="canusecitys.includes(13)">
              嘉義縣
            </option>
            <option value="台南市" v-if="canusecitys.includes(14)">
              台南市
            </option>
            <option value="高雄市" v-if="canusecitys.includes(15)">
              高雄市
            </option>
            <option value="屏東縣" v-if="canusecitys.includes(16)">
              屏東縣
            </option>
            <option value="台東縣" v-if="canusecitys.includes(19)">
              台東縣
            </option>
          </select>
        </div>
      </div>
      <div class="row col-md-auto col-12 my-auto pt-2">
        <n-checkbox v-model:checked="stationAll" size="large"
          >場站全選</n-checkbox
        >
      </div>

      <div class="row col-md-auto col-12 mx-auto mx-md-0">
        <el-select-v2
          :disabled="stationAll"
          v-model="selectstationvalue"
          filterable
          :options="options"
          placeholder="請選擇場站名稱"
          :remote-method="remoteMethod"
          :loading="isloading2"
          class="text-light mt-3 mt-md-0 px-0 mt-md-1 w240"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
        />
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >區間:</label
        >
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="item"
          >
            <option selected disabled>請選擇</option>
            <option value="all_day">全天</option>
            <option value="6_to_24_hour">6-24點</option>
          </select>
        </div>
      </div>
      <div class="row mx-0 ms-md-0 align-items-center col-md-auto col-12">
        <label class="col-md-auto ms-md-0 col-form-label px-0 px-md-2 fw-bolder"
          >類型:</label
        >
      </div>
      <div class="row col-md-2 align-items-center mx-0 ps-md-0">
        <n-select
          class="px-0"
          v-model:value="category"
          placeholder="請選擇"
          multiple
          :options="status"
          :max-tag-count="1"
          size="medium"
        />
      </div>

      <div
        class="row ps-md-4 mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0"
      >
        <n-date-picker
          class="px-0"
          v-model:formatted-value="timestamp"
          type="month"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="選擇星期一的日期"
          value-format="yyyy-MM"
          :is-date-disabled="disableDate"
        />
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <button
          type="button"
          class="btn btn-primary text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="search"
        >
          搜尋匯出
        </button>
      </div>
    </form>
    <n-result class="mt-5" status="info" title="此頁面只供下載EXCEL">
    </n-result>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, inject, watch } from "vue";
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDatePicker, NSelect, NResult, NCheckbox } from "naive-ui";

const store = useUserStore();
const canusecitys = store.citys;
const isLoading = ref(false);
const ischange = inject("ischange");

import * as XLSX from "xlsx";
const swal = inject("$swal");
const city = ref("請選擇");
async function errorAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
///全部場站資訊
let StationValue = [];
const data = ref([]);
const category = ref([]);
const timestamp = ref(getPreviousMonth());
const item = ref("請選擇");

function getPreviousMonth() {
  const date = new Date();
  // 获取上个月的年份和月份
  const year = date.getFullYear();
  const month = date.getMonth();

  const previousYear = month === 0 ? year - 1 : year;
  const previousMonth = month === 0 ? 12 : month;
  const previousMonthString =
    previousYear + "-" + ("0" + previousMonth).slice(-2);
  console.log(previousMonthString);
  return previousMonthString;
}

function disableDate(ts) {
  const compare = ts === undefined ? new Date() : new Date(ts);
  // console.log(`compare = ${compare}`);
  const now = new Date(); // 取得当前时间
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const compareYear = compare.getFullYear();
  const compareMonth = compare.getMonth() + 1;
  if (compareYear < 2024 ||
      (compareYear === currentYear && compareMonth > currentMonth - 1) ||
      compareYear > currentYear) {
    return true;
  }

  return false;
}

disableDate();

let status = [
  {
    label: "無車",
    value: "無車",
  },
  {
    label: "無位",
    value: "無位",
  },
  {
    label: "見車率",
    value: "見車率",
  },
  {
    label: "見位率",
    value: "見位率",
  },
];

let exceldata = [];
let excelename = "";
let excelecolumn = [];
const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [];
  excelecolumn = [];
  excelename = "";

  exceldata = [...nowdata];
  excelename = name;

  excelecolumn = [...nowcolumn];

  if (!exceldata.length) {
    return errorAlert("空資料不能匯出");
  } else {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exceldata);
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.utils.sheet_add_aoa(worksheet, [excelecolumn], { origin: "A1" });
    XLSX.writeFile(workbook, `${excelename}.xlsx`);
  }
};

let column = [];
function makecolumn() {
  //清除cloumn
  column = [];

  function getdays() {
    // 設定初始日期
    const arr = [];
    for (let i = 1; i <= 31; i++) {
      arr.push(`${i}`);
    }

    return arr;
  }

  column = [
    "責任區",
    "場站代號",
    "站名",
    "車位數",
    "狀態",
    ...getdays(),
    "總計",
  ];
}

const getdata = async () => {
  const params = {
    dataset_id: "data_analysis",
    table_id: "monthly_empty_full_station",
    date: `${timestamp.value}-01`,
    city: [city.value],
    item: item.value,
    status: category.value,
    station:
      stationAll.value === true
        ? ["all"]
        : selectstationvalue.value.map((item) => parseInt(item.split("-")[0])),
  };

  isLoading.value = true;
  const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
  const res = await axios.get(url, { params });
  isLoading.value = false;
  const resdata = res.data.data;
  let arr = [];
  resdata.forEach((element) => {
    let obj = [];
    obj = {
      item1: element.responsible_area,
      item3: element.s_no,
      item4: element.s_name,
      item5: element.s_total,
      item6: element.status,
      item7: element.day1,
      item8: element.day2,
      item9: element.day3,
      item10: element.day4,
      item11: element.day5,
      item12: element.day6,
      item13: element.day7,
      item14: element.day8,
      item15: element.day9,
      item16: element.day10,
      item17: element.day11,
      item18: element.day12,
      item19: element.day13,
      item20: element.day14,
      item21: element.day15,
      item22: element.day16,
      item23: element.day17,
      item24: element.day18,
      item25: element.day19,
      item26: element.day20,
      item27: element.day21,
      item28: element.day22,
      item29: element.day23,
      item30: element.day24,
      item31: element.day25,
      item32: element.day26,
      item33: element.day27,
      item34: element.day28,
      item35: element.day29,
      item36: element.day30,
      item37: element.day31,
      item38: element.total,
    };
    arr.push({ ...obj });
  });

  data.value = [...arr];
  makecolumn();
  makeExecl(
    data.value,
    column,
    `${item.value === "all_day" ? "全天" : "6-24點"}_見車率統計月報`
  );
};

const search = async () => {
  if (city.value === "請選擇") {
    return errorAlert("請選擇城市");
  } else if (item.value === "請選擇") {
    errorAlert("請選擇區間");
    return;
  } else if (selectstationvalue.value.length === 0 && !stationAll.value) {
    errorAlert("請選擇場站");
    return;
  } else if (category.value.length === 0) {
    errorAlert("請選擇類型");
    return;
  } else if (timestamp.value == null) {
    errorAlert("請選擇日期");
    return;
  }
  try {
    await getdata();
  } catch (error) {
    console.log(error);
  }
};

const options = ref([]);
const selectstationvalue = ref([]);
const isloading2 = ref(false);
const stationAll = ref(true);
//把filter好的資料加到場站名稱
function remoteMethod(newX) {
  if (newX.length === 0) {
    options.value = [];
    selectstationvalue.value = [];
    return;
  }

  isloading2.value = true;
  setTimeout(() => {
    //增加城市

    isloading2.value = false;

    const arr = [];
    //把城市有的廠站丟過去
    StationValue.forEach((item) => {
      if (newX.includes(item.city)) {
        arr.push({
          label: item["s_name_tw"],
          value: `${item.s_no}-${item.city}`,
        });
      }
    });

    //檢查以選擇的場站跟城市是否有一致
    const filterData = selectstationvalue.value.filter((item) =>
      newX.includes(item.split("-")[1])
    );
    selectstationvalue.value = [...filterData];

    options.value = [...arr];
  }, 200);
}

//監聽城市
watch(city, (newX) => {
  remoteMethod(newX);
});

async function getStationData() {
  const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
  const params = {
    dataset_id: "yb2",
    table_id: "station",
  };
  const res = await axios.get(url, { params });
  const resdata = res.data.data;
  StationValue = [...resdata];
}

(async () => {
  await getStationData();
})();
</script>

<style>
@media (min-width: 767.98px) {
  .w240 {
    width: 240px;
  }
}
</style>
