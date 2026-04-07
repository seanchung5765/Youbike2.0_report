<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">TPASS補助款月報</h1>
    </div>

    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div
        class="row px-0 ps-md-4 mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0"
      >
        <div
          class="row px-0 ps-md-4 mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0"
        >
          <n-date-picker
            class="px-0"
            v-model:formatted-value="timestamp"
            type="month"
            :actions="null"
            :input-readonly="true"
            :update-value-on-close="true"
            placeholder="請選擇日期"
            value-format="yyyy-MM"
            :is-date-disabled="disablePreviousDate"
          />
        </div>
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
      v-show="data.length > 1"
      size="small"
      :data="data"
      ref="dataTable"
      :columns="columns"
      :pagination="{ pageSize: 17 }"
      :max-height="600"
      :scroll-x="500"
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
const swal = inject("$swal");
async function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const ischange = inject("ischange");

const timestamp = ref();
const isLoading = ref(false);
const data = ref([]);
const dataTable = ref(null);
const columns = [
  {
    key: "num1",
    align: "center",
    fixed: "left",
    title: "專案別",
  },
  {
    key: "num2",
    align: "center",
    title: "系統別",
  },
  {
    key: "num3",
    align: "center",
    title: "補助款項目",
  },
  {
    key: "num4",
    align: "center",
    title: "票卡",
  },
  {
    key: "num5",
    align: "center",
    title: "筆數",
  },
  {
    key: "num6",
    align: "center",
    title: "補助金額",
  },
  {
    key: "num7",
    align: "center",
    fixed: "left",
    title: "單筆補助金額",
  },
];

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
const disablePreviousDate = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const now = new Date(); // 获取当前时间
  const nowyear = now.getFullYear();
  const nowmonth = now.getMonth() + 1;

  if ((year === nowyear && month > nowmonth) || year > nowyear || year < 2023) {
    return true;
  }

  return false;
};

const getData = async () => {
  try {
    data.value = [];
    isLoading.value = true;
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "financial_report",
      table_id: "monthly_pass",
      date: `${timestamp.value}-01`,
    };
    const res = await axios.get(url, { params });
    const arr = [...res.data.data];
    arr.sort((a, b) => a.rank - b.rank);
    let arrdata = [];
    arr.forEach((item) => {
      arrdata.push({
        num1: item.project,
        num2: item.sys,
        num3: item.item,
        num4: item.card,
        num5: item.CNT,
        num6: item.amount,
        num7: item.subsidy,
      });
    });
    data.value = [...arrdata];
    makeExecl(data.value, columns, `${timestamp.value}TPASS補助款月報`);
    dataTable.value.page(1);
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (!timestamp.value) {
    return NotCityAlert("請選擇日期");
  }
  getData();
};
</script>

<style></style>
