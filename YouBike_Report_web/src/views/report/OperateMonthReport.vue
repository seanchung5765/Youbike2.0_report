<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />

    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">累積業績</h1>
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
          :on-update:formatted-value="monthcontrl"
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
      :columns="column"
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
const isLoading = ref(false);
const dataTable = ref();
const timestamp = ref(null);
const data = ref([]);

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

const column = [
  {
    key: "month",
    align: "center",
    fixed: "left",
    title: "月份",
  },
  {
    key: "city",
    align: "center",
    title: "城市",
  },
  {
    key: "num1",
    align: "center",
    title: "單月騎乘次數",
  },
  {
    key: "num2",
    align: "center",
    title: "去年同期騎乘次數",
  },
  {
    key: "num3",
    align: "center",
    title: "單月最高騎乘次數紀錄",
  },
];

const disablePreviousDate = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const now = new Date(); // 获取当前时间
  const nowyear = now.getFullYear();
  const nowmonth = now.getMonth() + 1;

  // 禁用2012年8月之前的日期和当前月份以后的日期
  if (
    year < 2012 ||
    (year === 2012 && month < 8) ||
    year > nowyear ||
    (year === nowyear && month > nowmonth)
  ) {
    return true;
  }

  // 禁用本月以后的日期
  if (year === nowyear && month >= nowmonth) {
    return true;
  }

  return false;
};

const getData = async () => {
  try {
    isLoading.value = true;
    data.value = [];
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    let params = {
      dataset_id: "founder_report",
      table_id: "monthly_operation_report",
      date: timestamp.value,
    };
    const res = await axios.get(url, { params });
    res.data.data.forEach((element) => {
      data.value.push({
        month: element.month,
        city: element.city,
        num1: element.monthly_rent_number,
        num2: element.last_year_monthly_rent_number,
        num3: element.max_monthly_rent_number,
      });
    });
    makeExecl(data.value, column, "累積業績");
    if (dataTable.value.page) {
      dataTable.value.page(1);
    }

    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const monthcontrl = (value) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 注意：getMonth() 返回的月份范围是 0 到 11
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDate = `${year}-${formattedMonth}`;
  if (formattedDate !== value) {
    timestamp.value = value;
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
