<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">每日新增&刪減票卡數</h1>
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
            v-model:formatted-value="starttimestamp"
            type="date"
            :actions="null"
            :input-readonly="true"
            :update-value-on-close="true"
            default-time="2023-06-20"
            placeholder="開始日期"
            value-format="yyyy-MM-dd"
            :is-date-disabled="disablestartDate"
          />
        </div>
        <div
          class="row px-0 ps-md-4 mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0"
        >
          <n-date-picker
            class="px-0"
            v-model:formatted-value="endtimestamp"
            type="date"
            :actions="null"
            :input-readonly="true"
            :is-date-disabled="disableEndDate"
            :update-value-on-close="true"
            placeholder="結束日期"
            value-format="yyyy-MM-dd"
          />
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <button
          type="button"
          class="btn btn-info text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="cleardate"
        >
          清空日期
        </button>
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
      v-show="totaldata.length > 0"
      ref="dataTable"
      size="small"
      :columns="columns"
      :data="totaldata"
      :pagination="{ pageSize: 13 }"
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
import OutputExcel from "../../components/OutputExcel.vue";
import { NDataTable, NDatePicker } from "naive-ui";

//亮亮模式暗暗模式切換
const ischange = inject("ischange");
const swal = inject("$swal");
async function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const starttimestamp = ref();
const endtimestamp = ref();

const isLoading = ref(false);
const dataTable = ref(null);
const totaldata = ref([]);
const columns = ref();

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

const disablestartDate = (ts) => {
  const endDateValue = endtimestamp.value;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // 设置当前日期的时间为午夜

  const date = new Date(ts);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  // 禁用2012年8月之前的日期和当前月份以后的日期
  if (year < 2023 || (year === 2023 && month < 9)) {
    return true;
  }

  if (endDateValue) {
    const endDate = new Date(endDateValue);
    endDate.setHours(0, 0, 0, 0); // 设置结束日期的时间为午夜

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    const selectedDate = new Date(ts);
    selectedDate.setHours(0, 0, 0, 0); // 设置选中日期的时间为午夜

    if (
      selectedDate < startDate ||
      selectedDate > endDate ||
      selectedDate >= currentDate
    ) {
      // 如果选中日期在结束日期之前、结束日期后的31天之外，或是今天及未来的日期，禁用选中日期
      return true;
    }
  } else {
    const selectedDate = new Date(ts);
    selectedDate.setHours(0, 0, 0, 0); // 设置选中日期的时间为午夜

    if (selectedDate >= currentDate) {
      // 如果选中日期是今天及未来的日期，禁用选中日期
      return true;
    }
  }
};

const disableEndDate = (ts) => {
  const startDateValue = starttimestamp.value;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // 设置当前日期的时间为午夜

  const date = new Date(ts);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  // 禁用2012年8月之前的日期和当前月份以后的日期
  if (year < 2023 || (year === 2023 && month < 9)) {
    return true;
  }

  if (startDateValue) {
    const startDate = new Date(startDateValue);
    startDate.setHours(0, 0, 0, 0); // 设置起始日期的时间为午夜

    if (startDate > currentDate) {
      // 如果起始日期大于当前日期，禁用所有日期
      return true;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    const selectedDate = new Date(ts);
    selectedDate.setHours(0, 0, 0, 0); // 设置选中日期的时间为午夜

    if (
      selectedDate < startDate ||
      selectedDate > endDate ||
      selectedDate >= currentDate
    ) {
      // 如果选中日期在起始日期之前、起始日期后的31天之外，或是今天及未来的日期，禁用选中日期
      return true;
    }
  } else {
    const selectedDate = new Date(ts);
    selectedDate.setHours(0, 0, 0, 0); // 设置选中日期的时间为午夜

    if (selectedDate >= currentDate) {
      // 如果选中日期是今天及未来的日期，禁用选中日期
      return true;
    }
  }
};

function formatDateToYYYYMMDD(dateString) {
  // 創建一個 Date 物件
  const originalDate = new Date(dateString);

  // 獲得年、月、日
  const year = originalDate.getUTCFullYear(); // 獲得年份
  const month = (originalDate.getUTCMonth() + 1).toString().padStart(2, "0"); // 獲得月份，並填充到兩位數
  const day = originalDate.getUTCDate().toString().padStart(2, "0"); // 獲得日期，並填充到兩位數

  // 將日期轉換為 "YYYY-MM-DD" 的格式
  return `${year}-${month}-${day}`;
}

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

const makecol = () => {
  let arr = [
    {
      key: "item1",
      align: "center",
      title: "日期",
    },
    {
      key: "item2",
      align: "center",
      title: "縣市",
    },
    {
      key: "item3",
      align: "center",
      title: "刪減票卡數",
    },
    {
      key: "item4",
      align: "center",
      title: "增加票卡數",
    },
  ];
  columns.value = [...arr];
  // columns
};

const makedata = (item) => {
  let arr = [];
  item.forEach((item) => {
    arr.push({
      item1: formatDateToYYYYMMDD(item.date),
      item2: item.city,
      item3: item.del_card,
      item4: item.add_card,
    });
  });
  totaldata.value = [...arr];
};

const getData = async () => {
  //確認是否為

  const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;

  const params = {
    dataset_id: "report",
    table_id: "add_del_card",
    begin_date: starttimestamp.value,
    end_date: endtimestamp.value,
  };
  try {
    isLoading.value = true;
    const res = await axios.get(url, { params });
    isLoading.value = false;
    const resdata = res.data.data;
    makecol();
    makedata(resdata);
    if (dataTable.value) {
      dataTable.value.page(1);
    }
    makeExecl(totaldata.value, columns.value, "每日新增&刪減票卡數");
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (!starttimestamp.value) {
    NotCityAlert("請選擇開始日期");
    return;
  } else if (!endtimestamp.value) {
    NotCityAlert("請選擇結束日期");
    return;
  }

  getData();
};
</script>

<style scoped></style>
