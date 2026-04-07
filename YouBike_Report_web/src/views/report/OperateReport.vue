<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">經營日報</h1>
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
            <option value="TurnoverData">上線周轉率排序</option>
            <option value="TurnoverTaiwanData">實際周轉率排序(台灣)</option>
            <option value="TotalData">詳細資訊(台灣)</option>
          </select>
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0">
        <n-date-picker
          class="px-0"
          v-model:formatted-value="timestamp"
          type="date"
          :actions="null"
          :disabled="category === '請選擇'"
          update-value-on-close
          :is-date-disabled="disablePreviousDate"
          value-format="yyyy-MM-dd"
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
    <template v-if="clickwhat == 1">
      <n-data-table
        ref="dataTable"
        size="small"
        :columns="column"
        :data="data"
        :pagination="{ pageSize: 15 }"
        :max-height="600"
        :scroll-x="300"
        :bordered="false"
        :single-line="false"
        striped
      />
    </template>
    <template v-else-if="clickwhat == 2">
      <n-data-table
        ref="dataTable"
        :data="data"
        size="small"
        :columns="column2"
        :pagination="{ pageSize: 15 }"
        :max-height="600"
        :scroll-x="300"
        :bordered="false"
        :single-line="false"
        striped
      />
    </template>
    <template v-else-if="clickwhat == 3">
      <n-data-table
        ref="dataTable"
        size="small"
        :columns="column3"
        :data="data"
        :pagination="{ pageSize: 15 }"
        :max-height="600"
        :scroll-x="300"
        :bordered="false"
        :single-line="false"
        striped
      />
    </template>
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

const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;

const isLoading = ref(false);
const clickwhat = ref(null);
const category = ref("請選擇");
const timestamp = ref();
const data = ref([]);
const dataTable = ref(null);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

const column = ref([
  {
    key: "city",
    align: "center",
    fixed: "left",
    title: "城市",
  },
  {
    key: "num1",
    align: "center",
    title: "騎乘次數",
  },
  {
    key: "num2",
    align: "center",
    title: "周轉率",
  },
]);
const column2 = ref([
  {
    key: "city",
    align: "center",
    fixed: "left",
    title: "城市",
  },
  {
    key: "num1",
    align: "center",
    title: "實際營運車輛數",
  },
  {
    key: "num2",
    align: "center",
    title: "周轉率",
  },
]);
const column3 = ref([
  {
    key: "city",
    align: "center",
    fixed: "left",
    title: "城市",
  },
  {
    key: "num1",
    align: "center",
    title: "騎乘次數",
  },
  {
    key: "num2",
    align: "center",
    title: "場站數",
  },
  {
    key: "num3",
    align: "center",
    title: "上線車輛數",
  },
  {
    key: "num4",
    align: "center",
    title: "上線周轉率",
  },
  {
    key: "num5",
    align: "center",
    title: "月累計騎乘次數",
  },
]);

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
  const today = new Date(); // Get today's date
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000); // Get yesterday's date
  const limitDate = new Date("2023-01-01"); // Set the date limit to January 1, 2023

  // If the date is before 2023 or after yesterday, return true to disable the date
  if (date < limitDate || date > yesterday) {
    return true;
  }
  return false; // Enable the date for selection if it is within the allowed range
};

const getTurnoverData = async () => {
  try {
    const params = {
      dataset_id: "founder_report",
      table_id: "daily_turnover_rank",
      date: timestamp.value,
      city: ["all"],
    };

    const res = await axios.get(url, { params });
    res.data.data.forEach((element) => {
      data.value.push({
        city: element.city,
        num1: element.rent_number,
        num2: element.turnover,
      });
    });
    makeExecl(data.value, column.value, "上線周轉率排序");
    if (dataTable.value.page) {
      dataTable.value.page(1);
    }
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const getTurnoverTaiwanData = async () => {
  try {
    const params = {
      dataset_id: "founder_report",
      table_id: "daily_turnover_rank_real",
      date: timestamp.value,
      city: ["all"],
    };
    const res = await axios.get(url, { params });
    res.data.data.forEach((element) => {
      data.value.push({
        city: element.city,
        num1: element.rent_number,
        num2: element.turnover,
      });
    });
    makeExecl(data.value, column2.value, "實際周轉率排序(台灣)");
    if (dataTable.value.page) {
      dataTable.value.page(1);
    }
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const getTotalData = async () => {
  try {
    const params = {
      dataset_id: "founder_report",
      table_id: "daily_summary_Taiwan",
      begin_date: timestamp.value,
      end_date: timestamp.value,
      city: ["all"],
    };
    const res = await axios.get(url, { params });
    res.data.data.forEach((element) => {
      data.value.push({
        city: element.city,
        num1: element.rent_number,
        num2: element.current_station,
        num3: element.bike_number,
        num4: element.turnover,
        num5: element.monthly_rent_number,
      });
    });
    makeExecl(data.value, column3.value, "詳細資訊(台灣)");
    if (dataTable.value.page) {
      dataTable.value.page(1);
    }
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (data.value === "請選擇") {
    NotCityAlert("請選擇系統別");
    return;
  } else if (!timestamp.value) {
    NotCityAlert("日期不能為空");
    return;
  }

  data.value = [];
  isLoading.value = true;
  switch (category.value) {
    case "TurnoverData":
      clickwhat.value = 1;
      // dataTable.value.page(1)
      getTurnoverData();
      break;

    case "TurnoverTaiwanData":
      clickwhat.value = 2;
      // dataTable.value.page(1)
      getTurnoverTaiwanData();
      break;

    case "TotalData":
      clickwhat.value = 3;
      // dataTable.value.page(1)
      getTotalData();
      break;

    default:
      break;
  }
};
</script>

<style></style>
