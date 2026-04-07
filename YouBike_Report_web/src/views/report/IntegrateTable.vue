<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">統整表</h1>
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
            v-model="city"
          >
            <option selected disabled>請選擇</option>
            <option
              value="1"
              v-if="canusecitys.includes(2) && canusecitys.includes(3)"
            >
              雙北
            </option>
            <option
              value="2"
              v-if="
                canusecitys.includes(4) &&
                canusecitys.includes(5) &&
                canusecitys.includes(6) &&
                canusecitys.includes(7)
              "
            >
              桃竹苗
            </option>
            <option value="3" v-if="canusecitys.includes(8)">台中</option>
            <option value="4" v-if="canusecitys.includes(12)">嘉義</option>
            <option
              value="5"
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
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <div
          class="row px-0 ps-md-4 mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0"
        >
          <n-date-picker
            class="px-0"
            v-model:formatted-value="timestamp"
            type="date"
            :actions="null"
            :input-readonly="true"
            :update-value-on-close="true"
            placeholder="請選擇日期"
            value-format="yyyy-MM-dd"
            :is-date-disabled="disableStartDate"
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
      v-if="totaldata.length >= 1"
      :pagination="{ pageSize: 17 }"
      :columns="columns"
      :data="totaldata"
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
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";
const store = useUserStore();
const canusecitys = store.citys;
const ischange = inject("ischange");
const swal = inject("$swal");
async function NotAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const dataTable = ref(null);
const city = ref("請選擇");
const isLoading = ref(false);
const columns = ref([
  {
    key: "item1",
    align: "center",
    title: "縣市",
  },
  {
    key: "item2",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電數",
  },
  {
    key: "item4",
    align: "center",
    title: "長時間通話數",
  },
  {
    key: "item5",
    align: "center",
    title: "掛斷數(大於6秒)",
  },
  {
    key: "item6",
    align: "center",
    title: "掛斷率(大於6秒)",
  },
]);
const totaldata = ref([]);
const timestamp = ref();

const disableStartDate = (ts) => {
  const date = new Date(ts);
  const now = new Date(); // 获取当前时间
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 将时间重设为今天的凌晨，以去掉时、分、秒和毫秒

  // 禁用2023年12月1日之前的日期和未来的日期
  if (date < new Date(2023, 11, 1) || date >= today) {
    return true;
  }
  return false;
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

const getdata = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    let params = {
      dataset_id: "report",
      table_id: "CTI_summary_table",
      date: timestamp.value,
      item: city.value,
    };
    isLoading.value = true;
    const res = await axios.get(url, { params });
    const arr = res.data.data.map((item) => ({
      item1: item.city,
      item2: item.ride_times,
      item3: item.total,
      item4: item.long_answer,
      item5: item.hangup_gt_six,
      item6: item.hangup_gt_six_percentage,
    }));
    totaldata.value = [...arr];
    makeExecl(totaldata.value, columns.value, "統整表");
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const search = async () => {
  if (city.value === "請選擇") {
    return NotAlert("請選擇城市");
  } else if (!timestamp.value) {
    return NotAlert("請選擇日期");
  }
  await getdata();
};
</script>

<style scoped></style>
