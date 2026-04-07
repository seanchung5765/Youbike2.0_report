<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">客服每月話務報</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >城市:</label
        >
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="city"
          >
            <option selected disabled>請選擇</option>
            <option
              value="Taipei_NewTaipei"
              v-if="canusecitys.includes(2) && canusecitys.includes(3)"
            >
              雙北
            </option>
            <option
              value="Taoyuan_Hsinchu_Miaoli"
              v-if="
                canusecitys.includes(5) &&
                canusecitys.includes(6) &&
                canusecitys.includes(20) &&
                canusecitys.includes(4) &&
                canusecitys.includes(7)
              "
            >
              桃竹苗
            </option>
            <option value="Taichung" v-if="canusecitys.includes(8)">
              台中市
            </option>
            <option value="Chiayi" v-if="canusecitys.includes(12)">
              嘉義市
            </option>
            <option
              value="Tainan_Kaohsiung_Pingtung"
              v-if="
                canusecitys.includes(14) &&
                canusecitys.includes(15) &&
                canusecitys.includes(16)
              "
            >
              南高屏
            </option>
          </select>
        </div>
      </div>
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
      size="small"
      v-if="dataTable.length"
      ref="table"
      :row-class-name="rowClassName"
      :columns="columns"
      :data="dataTable"
      :scroll-x="2000"
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
import { useUserStore } from "../../stores/userdata";
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

const disableDate = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();

  const now = new Date(); // 取得當前時間
  const nowYear = now.getFullYear();

  // 禁用 2023 年之前的日期
  if (year < 2023) {
    return true;
  }

  // 禁用未来日期
  if (year > nowYear) {
    return true;
  }

  return false;
};

const table = ref(null);
const city = ref("請選擇");
const isLoading = ref(false);
const dataTable = ref([]);
const columns = ref([]);
const timestamp = ref();

let exceldata = [];
let excelename = "";
let excelecolumn = [];

const makeExecl = (nowdata, name) => {
  exceldata = [];
  excelename = "";
  excelecolumn = [];

  exceldata = nowdata.filter((item, index) => index !== 0);
  excelename = name;

  for (let i = 1; i <= 34; i++) {
    excelecolumn.push(nowdata[0][`item${i}`]);
  }
};

//colmun製作
const makecol = () => {
  const arr = [];
  arr.push({
    key: `item1`,
    align: "center",
    title: "",
    fixed: "left",
    width: 100,
  });
  for (let i = 1; i <= 31; i++) {
    arr.push({
      key: `item${i + 1}`,
      align: "center",
      title: "",
    });
  }

  arr.push({
    key: `item33`,
    align: "center",
    title: "",
  });
  arr.push({
    key: "item34",
    align: "center",
    title: "",
  });
  columns.value = [...arr];
};

//data製作
const makedata = (data) => {
  const arr = [];
  data.forEach((item) => {
    let obj = {
      item1: item["item"],
    };
    for (let i = 1; i <= 33; i++) {
      if (i === 32) {
        obj[`item${i + 1}`] = item[`total`];
      } else if (i === 33) {
        obj[`item${i + 1}`] =
          item[`percent`] === ".00%" ? "0%" : item[`percent`];
      } else {
        obj[`item${i + 1}`] = item[`date${i}`];
      }
    }
    arr.push(obj);
  });
  dataTable.value = [...arr];
};

const getDate = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "report",
      table_id: "CTI_monthly_report",
      date: timestamp.value,
      city: city.value,
    };
    isLoading.value = true;
    const res = await axios.get(url, { params });
    console.log(res);
    isLoading.value = false;
    const resdata = res.data.data;
    //製作column
    makecol(resdata[0]);
    //製作資料
    makedata(resdata);

    makeExecl(dataTable.value, "客服每月話務報");
  } catch (error) {
    console.log(error);
  }
};

const search = async () => {
  if (city.value == "請選擇") {
    return NotCityAlert("請選擇城市");
  } else if (!timestamp.value) {
    return NotCityAlert("請選擇日期");
  }
  getDate();
};

const rowClassName = (row) => {
  if (row.item1 === "日期") {
    return "too-old";
  }
};
</script>
<style scoped>
:deep(.too-old td) {
  background-color: rgba(225, 232, 23) !important;
}
</style>
