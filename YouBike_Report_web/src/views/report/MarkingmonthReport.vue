<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">行銷月報(每月10號更新資料)</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >系統別:</label
        >
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="category"
          >
            <option selected disabled>請選擇</option>
            <option value="1">1.0</option>
            <option value="2_E">2.0+2.0E</option>
          </select>
        </div>
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
      :scroll-x="1000"
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

const timestamp = ref();
const ischange = inject("ischange");
const isLoading = ref(false);
const category = ref("請選擇");
const data = ref([]);
const columns = ref([]);
const dataTable = ref(null);

const swal = inject("$swal");
function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}

const disablePreviousDate = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const now = new Date(); // 获取当前时间
  const nowyear = now.getFullYear();
  const nowmonth = now.getMonth() + 1;

  // 禁用2023年6月之前的日期和当前月份之后的日期
  if (
    year < 2023 ||
    year > nowyear ||
    (year === nowyear && month >= nowmonth)
  ) {
    return true;
  }

  return false;
};

const makedata = (i) => {
  let arr = [];
  i[0].forEach((item, index) => {
    if (index === 0 || index === 1) {
      return;
    }
    arr.push({});
  });
  i.forEach((items, indexes) => {
    items.forEach((item, index) => {
      if (index === 0 || index === 1 || index === 2) {
        return;
      }
      arr[index - 3][`item${indexes + 1}`] = item;
    });
  });
  data.value = [...arr];
};

const makecol = (data) => {
  let arr = [];
  // data.forEach((i) => ({console.log(i)}))
  arr = data.map((i, index) => ({
    key: `item${index + 1}`,
    align: "center",
    title: i[2],
  }));
  arr[0]["fixed"] = "left";

  if (category.value != "1") {
    arr[0]["width"] = "100px";
  }
  columns.value = [...arr];
};

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

const getData = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;

    let params = {
      dataset_id: "marketing_report",
      table_id: `monthly_report${category.value}`,
      date: `${timestamp.value}-01`,
    };
    isLoading.value = true;
    const res = await axios.get(url, { params });
    isLoading.value = false;
    const resdata = res.data.data;
    makedata(resdata);
    makecol(resdata);

    if (dataTable.value.page) {
      dataTable.value.page(1);
    }
    // isLoading.value = false
    makeExecl(data.value, columns.value, "行銷月報");
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (category.value == "請選擇") {
    return NotCityAlert("請選擇系統別");
  } else if (!timestamp.value) {
    return NotCityAlert("請選擇日期");
  }
  getData();
};
</script>

<style></style>
