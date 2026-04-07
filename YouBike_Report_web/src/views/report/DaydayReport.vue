<template>
  <div class="container-fluid px-0">
    <Loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">
        各專案N天以上卡數達成率(每月5號更新資料)
      </h1>
    </div>

    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div
        class="row mx-0 mx-md-2 align-items-center col-md-2 col-12 mt-3 mt-md-0"
      >
        <n-date-picker
          class="px-0"
          v-model:formatted-value="timestamp"
          type="year"
          :actions="null"
          :input-readonly="true"
          :is-date-disabled="disableDate"
          placeholder="請選擇日期"
          value-format="yyyy"
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
      v-show="data.length > 1"
      ref="dataTable"
      :columns="column"
      :data="data"
      :pagination="{ pageSize: 20 }"
      :max-height="600"
      :scroll-x="1300"
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
const swal = inject("$swal");
async function NotAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}

const ischange = inject("ischange");
const isLoading = ref(false);
const data = ref([]);
const dataTable = ref(null);
const timestamp = ref();

let exceldata = [];
let excelename = "";
let excelecolumn = [];

const disableDate = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();

  const now = new Date(); // 取得當前時間
  const nowYear = now.getFullYear();

  // 禁用 2020 年之前的日期
  if (year < 2022) {
    return true;
  }

  // 禁用未来日期
  if (year > nowYear) {
    return true;
  }

  return false;
};

const column = ref([]);
const makecolumn = () => {
  column.value.push({
    key: "item",
    align: "center",
    fixed: "left",
    title: "項目",
    width: 200,
  });
  for (let i = 1; i <= 12; i++) {
    column.value.push({
      key: `month${i}`,
      align: "center",
      title: `${i}月`,
    });
  }
};
makecolumn();

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

const getDate = async () => {
  try {
    data.value = [];
    isLoading.value = true;
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "data_analysis",
      table_id: "tan_tan_1",
      date: timestamp.value,
    };
    const res = await axios.get(url, { params });

    res.data.data.forEach((element, index) => {
      data.value.push({
        item: element.item,
      });
      for (let i = 1; i <= 12; i++) {
        data.value[index][`month${i}`] = element[`month${i}`];
      }
    });
    makeExecl(data.value, column.value, "各專案N天以上卡數達成率");
    dataTable.value.page(1);
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (!timestamp.value) {
    return NotAlert("請選擇日期");
  }

  getDate();
};
</script>

<style></style>
