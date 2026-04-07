<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">2.0E電池狀況查詢</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder">城市:</label>
        <div class="col-md-auto px-0">
          <select class="form-select form-select-sm" aria-label="car" v-model="city">
            <option selected disabled>請選擇</option>
            <option value="台北市2.0E" v-if="canusecitys.includes(2)">台北市2.0E</option>
            <option value="新北市2.0E" v-if="canusecitys.includes(3)">新北市2.0E</option>
            <option value="桃園市2.0E" v-if="canusecitys.includes(4)">桃園市2.0E</option>
            <option value="新竹2.0E" v-if="canusecitys.includes(5)">新竹市2.0E</option>
            <option value="竹縣2.0E" v-if="canusecitys.includes(6)">新竹縣2.0E</option>
            <option value="竹科2.0E" v-if="canusecitys.includes(20)">竹科2.0E</option>
            <option value="苗栗縣2.0E" v-if="canusecitys.includes(7)">苗栗縣2.0E</option>
            <option value="台中市2.0E" v-if="canusecitys.includes(8)">台中市2.0E</option>
            <option value="嘉義市2.0E" v-if="canusecitys.includes(12)">嘉義市2.0E</option>
            <option value="嘉義縣2.0E" v-if="canusecitys.includes(13)">嘉義縣2.0E</option>
            <option value="台南市2.0E" v-if="canusecitys.includes(14)">台南市2.0E</option>
            <option value="高雄市2.0E" v-if="canusecitys.includes(15)">高雄市2.0E</option>
            <option value="屏東縣2.0E" v-if="canusecitys.includes(16)">屏東縣2.0E</option>
            <option value="台東縣2.0E" v-if="canusecitys.includes(19)">台東縣2.0E</option>
          </select>
        </div>
      </div>

      <div class="row mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0">
        <n-date-picker
          class="px-0 mx-0"
          v-model:formatted-value="starttimestamp"
          type="date"
          :actions="null"
          :is-date-disabled="disablestartDate"
          update-value-on-close
          placeholder="開始日期"
          value-format="yyyy-MM-dd"
        />
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0">
        <n-date-picker
          class="px-0 mx-0"
          v-model:formatted-value="endtimestamp"
          type="date"
          :actions="null"
          :is-date-disabled="disableEndDate"
          update-value-on-close
          placeholder="結束日期"
          value-format="yyyy-MM-dd"
        />
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
      v-show="data.length > 0"
      ref="dataTable"
      :data="data"
      :columns="columns"
      size="small"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="1500"
      :bordered="false"
      :single-line="false"
      striped
    />
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, inject } from "vue";
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
const ischange = inject("ischange");
const store = useUserStore();
const canusecitys = store.citys;
const swal = inject("$swal");
async function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const isLoading = ref(false);
const data = ref([]);
const starttimestamp = ref();
const endtimestamp = ref();
const city = ref("請選擇");
const dataTable = ref(null);
const columns = ref([]);

let exceldata = [];
let excelename = "";
let excelecolumn = [];
const makeExecl = (nowdata, col, name) => {
  //初始化
  exceldata = [];
  excelename = "";
  excelecolumn = [];

  exceldata = [...nowdata];
  excelename = name;
  col.forEach((item) => {
    excelecolumn.push(item.title);
  });
};

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

const disablestartDate = (ts) => {
  const endDateValue = endtimestamp.value;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // 设置当前日期的时间为午夜

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

const getData = async () => {
  try {
    isLoading.value = true;
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "data_analysis",
      table_id: "battery_analysis",
      begin_date: starttimestamp.value,
      end_date: endtimestamp.value,
      city: city.value,
    };
    // console.log(params);
    const res = await axios.get(url, { params });

    const resdata = res.data.data;
    console.log(res);
    //製作column
    const col = [];
    resdata[0].forEach((item, index) => {
      col.push({
        key: `item${index + 1}`,
        align: "center",
        title: item,
      });
    });
    col[0]["fixed"] = "left";
    col[0]["width"] = 100;
    col[1]["width"] = 210;
    //製作data
    let arr = [];
    resdata.forEach((items, indexes) => {
      if (indexes === 0) {
        return;
      }
      arr.push({});
      items.forEach((item, index) => {
        arr[indexes - 1][`item${index + 1}`] = item;
      });
    });
    data.value = [...arr];
    columns.value = [...col];
    makeExecl(data.value, columns.value, "2.0E電池狀況查詢");
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (city.value == "請選擇") {
    return NotCityAlert("請選擇城市");
  } else if (!starttimestamp.value) {
    return NotCityAlert("請選擇開始日期");
  } else if (!endtimestamp.value) {
    return NotCityAlert("請選擇結束日期");
  }
  getData();
};
</script>

<style></style>
