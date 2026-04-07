<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">投保率分析月報</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >類別:</label
        >
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="category"
          >
            <option selected disabled>請選擇</option>
            <option value="monthly_report_ride_INSUR">騎乘投保率(月)</option>
            <option value="monthly_report_INSUR">保險加保統計</option>
            <option value="monthly_report_MEBER">實名會員統計</option>
          </select>
        </div>
      </div>
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">城市:</label>
      </div>
      <div
        class="row mx-0 ms-md-2 align-items-center col-md-2 col-12 px-0 mt-md-0"
      >
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
      <div
        class="row mx-0 ms-md-2 align-items-center col-md-2 col-12 px-0 mt-md-0"
      >
        <n-select
          v-model:value="date"
          placeholder="請選擇"
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
const category = ref("請選擇");
const data = ref([]);
const city = ref([]);
const column = ref([]);
const date = ref([]);
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

//城市迴圈
function getArrayOfMonths() {
  const startDate = new Date("2018-01-01"); // Start date is January 2018
  const currentDate = new Date(); // Current date

  const monthsArray = [];
  let currentDateOfMonth = new Date(startDate);

  // Increment the month until reaching the month before the current date
  while (currentDateOfMonth < currentDate) {
    const year = currentDateOfMonth.getFullYear();
    const month = String(currentDateOfMonth.getMonth() + 1).padStart(2, "0");
    const label = `${year}-${month}`;
    const value = `${year}-${month}`;
    monthsArray.push({ label, value });
    currentDateOfMonth.setMonth(currentDateOfMonth.getMonth() + 1);
  }

  // Remove the last item if it's the current month
  if (monthsArray.length > 0) {
    const lastMonth = monthsArray[monthsArray.length - 1].value;
    const currentMonth =
      currentDate.getFullYear() +
      "-" +
      String(currentDate.getMonth() + 1).padStart(2, "0");
    if (lastMonth === currentMonth) {
      monthsArray.reverse();
    }
  }

  return monthsArray;
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

  //時間迴圈
  const result = getArrayOfMonths();
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

const setalldate = () => {
  let arr = [];
  dateoptions.forEach((item) => {
    arr.push(item.value);
  });
  date.value = [...arr];
};

const column1 = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "月份",
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
    title: "有使用紀錄卡片占比(D=C/A)",
  },
  {
    key: "item9",
    align: "center",
    title: "有使用紀錄卡片加保張數(E)",
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

const column2 = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "月份",
  },
  {
    key: "item2",
    align: "center",
    title: "縣市",
  },
  {
    key: "item3",
    align: "center",
    title: "總加保數",
  },
  {
    key: "item4",
    align: "center",
    title: "總退保數",
  },
  {
    key: "item5",
    align: "center",
    title: "累積有效加保數",
  },
  {
    key: "item6",
    align: "center",
    title: "累積總會員卡片術",
  },
  {
    key: "item7",
    align: "center",
    title: "總會員加保率",
  },
];

const column3 = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "月份",
  },
  {
    key: "item2",
    align: "center",
    title: "縣市",
  },
  {
    key: "item3",
    align: "center",
    title: "總會員數",
  },
  {
    key: "item4",
    align: "center",
    title: "實名會員數",
  },
  {
    key: "item5",
    align: "center",
    title: "非實名會員數",
  },
  {
    key: "item6",
    align: "center",
    title: "總會員卡片數",
  },
  {
    key: "item7",
    align: "center",
    title: "實名會員卡片數",
  },
  {
    key: "item8",
    align: "center",
    title: "非實名會員卡片數",
  },
];

//日期轉格式
function removeHyphensFromArray(datesArray) {
  return datesArray.map((date) => date.replace(/-/g, ""));
}

//時間格式轉換
function convertToFormattedDate(inputNumber) {
  if (typeof inputNumber !== "number") {
    throw new Error("Input must be a number.");
  }

  const year = Math.floor(inputNumber / 100);
  const month = inputNumber % 100;

  return `${year}年${month.toString().padStart(2, "0")}月`;
}

function convertToPercentage(value) {
  if (typeof value !== "number") {
    return value; // 非數字不處理，直接返回
  }

  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return value; // 無限大/小或NaN，直接返回
  }

  if (Number.isInteger(value)) {
    return value; // 整數，不需要轉換，直接返回
  }

  return (value * 100).toFixed(1) + "%"; // 轉換成百分比形式，保留一位小數
}

const getData = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "report",
      table_id: category.value,
      date: removeHyphensFromArray(date.value),
      city: city.value,
    };
    isLoading.value = true;
    const res = await axios.get(url, { params });
    isLoading.value = false;
    const saultdata = res.data.data;
    let arr = [];

    if (category.value === "monthly_report_ride_INSUR") {
      saultdata.forEach((i) => {
        arr.push({
          item1: convertToFormattedDate(i.date),
          item2: i.city,
          item3: i.total_card,
          item4: i.ride_times,
          item5: i.ride_card,
          item6: i.ride_card_incity,
          item7: i.ride_card_nocity,
          item8: convertToPercentage(i.active_per),
          item9: i.ride_card_INSUR,
          item10: convertToPercentage(i.ride_card_INSUR_per),
          item11: i.ride_times_INSUR,
          item12: convertToPercentage(i.ride_times_INSUR_per),
        });
      });
      column.value = [...column1];
      data.value = [...arr];
      makeExecl(data.value, column.value, "騎乘投保率(月)");
    } else if (category.value === "monthly_report_INSUR") {
      saultdata.forEach((i) => {
        arr.push({
          item1: convertToFormattedDate(i.date),
          item2: i.city,
          item3: i.total_add,
          item4: i.total_minus,
          item5: i.total_card_name,
          item6: i.total_card,
          item7: convertToPercentage(i.INSUR_rate),
        });
      });
      column.value = [...column2];
      data.value = [...arr];
      makeExecl(data.value, column.value, "保險加保統計");
    } else if (category.value === "monthly_report_MEBER") {
      saultdata.forEach((i) => {
        arr.push({
          item1: convertToFormattedDate(i.date),
          item2: i.city,
          item3: i.total_meber,
          item4: i.total_meber_name,
          item5: i.total_meber_no_name,
          item6: i.total_card,
          item7: i.total_card_name,
          item8: i.total_card_no_name,
        });
      });
      column.value = [...column3];
      data.value = [...arr];
      makeExecl(data.value, column.value, "實名會員統計");
    }

    if (dataTable.value.page) {
      dataTable.value.page(1);
    }
  } catch (error) {
    console.log(error);
  }
};
const search = () => {
  if (category.value === "請選擇") {
    return NotAlert("請選擇系統別");
  } else if (city.value.length <= 0) {
    return NotAlert("請選擇城市");
  } else if (date.value.length <= 0) {
    return NotAlert("請選擇日期");
  }

  getData();
};
</script>

<style></style>
