<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">每月新增會員投保數</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto">
        <n-date-picker
          class="px-0"
          v-model:formatted-value="timestamp"
          type="month"
          :actions="null"
          update-value-on-close
          :is-date-disabled="disablePreviousDate"
          value-format="yyyy-MM"
        />
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
      v-show="data.length"
      ref="dataTable"
      :data="data"
      :columns="columns"
      :pagination="{ pageSize: 15 }"
      :max-height="500"
      :scroll-x="300"
      size="small"
      :bordered="false"
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
import { NDataTable, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
const ischange = inject("ischange");
const swal = inject("$swal");
async function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const columns = ref([]);
const isLoading = ref(false);
const dataTable = ref();
const data = ref([]);
const timestamp = ref(getLastMonthDate());
let exceldata = [];
let excelename = "";
let excelecolumn = [];
const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [];
  excelecolumn = [];
  excelename = "";

  exceldata = [...nowdata];
  excelename = name;
  nowcolumn.forEach((item) => {
    excelecolumn.push(item.title);
  });
};

function getLastMonthDate() {
  const currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth();

  if (month === 0) {
    year--;
    month = 11;
  } else {
    month--;
  }

  month = (month + 1).toString().padStart(2, "0");
  const formattedDate = `${year}-${month}`;

  return formattedDate;
}

const disablePreviousDate = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const now = new Date(); // 获取当前时间
  const nowyear = now.getFullYear();
  const nowmonth = now.getMonth() + 1;

  // 禁用2012年8月之前的日期和当前月份以后的日期
  if (year < 2023 || year > nowyear || (year === nowyear && month > nowmonth)) {
    return true;
  }

  // 禁用本月以后的日期
  if (year === nowyear && month >= nowmonth) {
    return true;
  }

  return false;
};

columns.value = [
  {
    key: "item1",
    align: "center",
    title: "縣市",
  },
  {
    key: "item2",
    align: "center",
    title: "新增會員卡投保數",
  },
  {
    key: "item3",
    align: "center",
    title: "新增註冊卡數",
  },
  {
    key: "item4",
    align: "center",
    title: "投保率",
  },
];

const getData = async () => {
  try {
    isLoading.value = true;
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    let params = {
      dataset_id: "report",
      table_id: "month_insur",
      date: timestamp.value,
    };
    const res = await axios.get(url, { params });
    const resdata = res.data.data;
    let arr = [];
    resdata.forEach((item) => {
      arr.push({
        item1: item.city,
        item2: item.insur,
        item3: item.total,
        item4: item.percentage,
      });
    });
    data.value = [...arr];
    makeExecl(data.value, columns.value, "每月新增會員投保數");
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (!timestamp.value) {
    NotCityAlert("日期不能為空");
    return;
  }
  getData();
};
</script>

<style></style>
