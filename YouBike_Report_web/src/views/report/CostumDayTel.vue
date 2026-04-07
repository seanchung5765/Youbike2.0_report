<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">補償券月報</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
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
      ref="dataTable"
      size="small"
      v-if="totaldata.length > 1"
      :columns="columns"
      :data="totaldata"
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
const ischange = inject("ischange");
const swal = inject("$swal");
async function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const dataTable = ref(null);
const isLoading = ref(false);
const totaldata = ref([]);
const timestamp = ref();

const disablePreviousDate = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 注意这里加 1

  const now = new Date(); // 获取当前时间
  const nowyear = now.getFullYear();
  const nowmonth = now.getMonth() + 1;

  if ((year === nowyear && month > nowmonth) || year > nowyear || year < 2023) {
    return true;
  }
  return false;
};

const columns = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "項目",
  },
  {
    key: "item2",
    align: "center",
    title: "使用縣市",
  },
  {
    key: "item3",
    align: "center",
    title: "車種",
  },
  {
    key: "item4",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item5",
    align: "center",
    title: "使用金額",
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

const getdata = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    let params = {
      dataset_id: "report",
      table_id: "refund_report",
      date: timestamp.value,
    };
    isLoading.value = true;
    const res = await axios.get(url, { params });
    const resdata = res.data.data;
    let arr = [];
    resdata.forEach((item) => {
      arr.push({
        item1: item.item,
        item2: item.city,
        item3: item.sys,
        item4: item.numbers,
        item5: item.total,
      });
    });
    totaldata.value = [...arr];
    makeExecl(totaldata.value, columns, `${timestamp.value}補償卷月報`);
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const search = async () => {
  if (!timestamp.value) {
    return NotCityAlert("請選擇日期");
  }
  await getdata();
};
</script>

<style scoped></style>
