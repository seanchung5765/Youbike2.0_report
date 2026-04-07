<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">騎乘次數明細比例</h1>
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
    title: "使用次數",
  },
  {
    key: "item2",
    align: "center",
    title: "未加保卡數",
  },
  {
    key: "item3",
    align: "center",
    title: "已加保卡數",
  },
  {
    key: "item4",
    align: "center",
    title: "卡數合計",
  },
  {
    key: "item5",
    align: "center",
    title: "未加保比例",
  },
  {
    key: "item6",
    align: "center",
    title: "已加保比例",
  },
];

//日期轉格式
function removeHyphensFromArray(datesArray) {
  return datesArray.map((date) => date.replace(/-/g, ""));
}

const getData = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "report",
      table_id: "alluse2",
      date: removeHyphensFromArray(date.value),
      city: city.value,
    };
    isLoading.value = true;
    const res = await axios.get(url, { params });
    isLoading.value = false;
    const saultdata = res.data.data;
    let arr = [];
    saultdata.forEach((i) => {
      arr.push({
        item1: i.usetime,
        item2: i.N,
        item3: i.Y,
        item4: i.Card_CNT,
        item5: i.N_prop,
        item6: i.Y_prop,
      });
    });
    data.value = [...arr];
    makeExecl(data.value, column, "騎乘次數明細比例");
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
