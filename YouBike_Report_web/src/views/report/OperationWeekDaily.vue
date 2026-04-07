<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">營運管理週報</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder">系統別:</label>
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="category"
            @change="city = '請選擇'"
          >
            <option selected disabled>請選擇</option>
            <option value="1">1.0</option>
            <option value="2">2.0</option>
            <option value="2E">2.0E</option>
          </select>
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder">城市:</label>
        <div class="col-md-auto px-0">
          <select class="form-select form-select-sm" aria-label="car" v-model="city">
            <option selected disabled>請選擇</option>
            <template v-if="category == 2">
              <option value="Taipei2" v-if="canusecitys.includes(2)">台北市</option>
              <option value="Newtaipei2" v-if="canusecitys.includes(3)">新北市</option>
              <option value="Taoyuan2" v-if="canusecitys.includes(4)">桃園市</option>
              <option value="Hsinchu2" v-if="canusecitys.includes(5)">新竹市</option>
              <option value="Hsinchu_Country2" v-if="canusecitys.includes(6)">
                新竹縣
              </option>
              <option value="HsinchuScience2" v-if="canusecitys.includes(20)">
                竹科
              </option>
              <option value="Miaoli2" v-if="canusecitys.includes(7)">苗栗縣</option>
              <option value="Taichung2" v-if="canusecitys.includes(8)">台中市</option>
              <option value="Chiayi2" v-if="canusecitys.includes(12)">嘉義市</option>
              <option value="Chiayi_Country2" v-if="canusecitys.includes(13)">
                嘉義縣
              </option>
              <option value="Tainan2" v-if="canusecitys.includes(14)">台南市</option>
              <option value="Kaohsiung2" v-if="canusecitys.includes(15)">高雄市</option>
              <option value="Pingtung2" v-if="canusecitys.includes(16)">屏東縣</option>
              <option value="Taitung2" v-if="canusecitys.includes(19)">台東縣</option>
            </template>
            <template v-else-if="category == 1">
              <option value="Newtaipei" v-if="canusecitys.includes(3)">新北市</option>
              <option value="Taoyuan" v-if="canusecitys.includes(4)">桃園市</option>
              <option value="Miaoli" v-if="canusecitys.includes(7)">苗栗縣</option>
            </template>
            <template v-else-if="category == '2E'">
              <option value="Taipei2E" v-if="canusecitys.includes(2)">台北市</option>
              <option value="Newtaipei2E" v-if="canusecitys.includes(3)">新北市</option>
              <option value="Taoyuan2E" v-if="canusecitys.includes(4)">桃園市</option>
              <option value="Hsinchu_Country2E" v-if="canusecitys.includes(6)">
                新竹縣
              </option>
              <option value="HsinchuScience2E" v-if="canusecitys.includes(20)">
                竹科
              </option>
              <option value="Miaoli2E" v-if="canusecitys.includes(7)">苗栗縣</option>
              <option value="Taichung2E" v-if="canusecitys.includes(8)">台中市</option>
              <option value="Chiayi2E" v-if="canusecitys.includes(12)">嘉義市</option>
              <option value="Chiayi_Country2E" v-if="canusecitys.includes(13)">
                嘉義縣
              </option>
              <option value="Tainan2E" v-if="canusecitys.includes(14)">台南市</option>
              <option value="Kaohsiung2E" v-if="canusecitys.includes(15)">高雄市</option>
              <option value="Pingtung2E" v-if="canusecitys.includes(16)">屏東縣</option>
              <option value="Taitung2E" v-if="canusecitys.includes(19)">台東縣</option>
            </template>
          </select>
        </div>
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
            placeholder="請選每週一日期"
            value-format="yyyy-MM-dd"
            :is-date-disabled="disablestartDate"
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
      :row-class-name="rowClassName"
      :pagination="{ pageSize: 100 }"
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
async function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const dataTable = ref(null);
const city = ref("請選擇");
const category = ref("請選擇");
const isLoading = ref(false);
const columns = ref([]);
const totaldata = ref([]);
const timestamp = ref();

const disablestartDate = (ts) => {
  const date = new Date(ts);
  const now = new Date(); // 取得当前时间
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 将时间重设为今天的凌晨，以去掉时、分、秒和毫秒
  const startOfWeek = new Date(today); // 复制今天的日期
  startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1); // 设置禮拜一的日期
  const dayOfWeek = date.getDay(); // 取得星期几，星期日为0，星期一为1，以此类推
  // 禁用禮拜一之後的日期
  if (date >= startOfWeek) {
    return true;
  }
  // 禁用非禮拜一的日期
  if (dayOfWeek !== 1) {
    return true;
  }

  const year = date.getFullYear();

  // 禁用2023年以前的日期
  if (year < 2023) {
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
  const arr = [];
  nowdata.forEach((items, index) => {
    arr.push([]);
    for (let i = 1; i <= Object.keys(items).length; i++) {
      arr[index].push(items[`item${i}`]);
    }
  });
  exceldata = [...arr];
  excelename = name;
  nowcolumn.forEach((item) => {
    excelecolumn.push(item.title);
  });
};

const mackcol = (data) => {
  console.log("mackcol");
  columns.value = [];
  //把第四筆陣列刪掉
  let newdata = [];
  newdata = data.filter((item, index) => index !== 4);
  console.log(newdata);
  //再把丟到最後一個
  newdata.push(data[4]);
  let arr = [];
  newdata.forEach((item, index) => {
    arr.push({
      key: `item${index + 1}`,
      align: "center",
      title: item[2],
    });
    if (index === 0) arr[arr.length - 1]["fixed"] = "left";
  });

  columns.value = [...arr];
  // console.log(columns.value);
};

const mackdata = (data) => {
  console.log("mackdata");
  totaldata.value = [];
  let newdata = [];
  //把第四筆陣列刪掉
  newdata = data.filter((item, index) => index !== 4);
  //再把丟到最後一個
  newdata.push(data[4]);
  //column長度
  let columnlength = newdata[0].length - 2;
  //data長度
  let arr = [];
  for (let i = 1; i <= columnlength; i++) {
    arr.push({});
  }
  newdata.forEach((items, indexs) => {
    items.forEach((item, index) => {
      if (index === 0 || index === 1 || index === 2) {
        return;
      }
      arr[index - 3][`item${indexs + 1}`] = item;
    });
  });
  totaldata.value = [...arr];
};

const getdata = async () => {
  const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
  let params = {
    dataset_id: "report",
    table_id: `weekly_report_query${category.value}`,
    date: timestamp.value,
    city: [city.value],
  };
  isLoading.value = true;
  const res = await axios.get(url, { params });
  const { data } = res.data;
  // console.log(data);
  //如果為空資料則跳出
  if (data.length === 0) {
    totaldata.value = [];
    isLoading.value = false;
    return;
  }
  console.log(1);
  mackcol([...data[0]]);
  mackdata([...data[0]]);
  isLoading.value = false;
  makeExecl(totaldata.value, columns.value, "營運管理週報");
};

const search = async () => {
  if (category.value == "請選擇") {
    NotCityAlert("系統別不能為空");
    return;
  } else if (city.value == "請選擇") {
    NotCityAlert("城市不能為空");
    return;
  } else if (timestamp.value === undefined) {
    NotCityAlert("日期不能為空");
    return;
  }
  await getdata();
};

const rowClassName = (row) => {
  if (
    row.item1 === "場站資訊" ||
    row.item1 === "租借資訊" ||
    row.item1 === "收入資訊" ||
    row.item1 === "妥善率資訊" ||
    row.item1 === "票卡資訊" ||
    row.item1 === "當週租借車次" ||
    (row.item1 === "註冊票卡淨增加數" && !row.item2) ||
    row.item1 === "各時段使用資訊" ||
    row.item1 === "租賃收入明細" ||
    (row.item1 === "當週/日租借車次" && !row.item2) ||
    row.item1 === "租賃時間使用資訊" ||
    row.item1 === "維護管理" ||
    row.item1 === "調度管理" ||
    row.item1 === "營運資訊" ||
    row.item1 === "騎乘距離分析" ||
    row.item1 === "當日租借車次"
  ) {
    return "too-old";
  }
};
</script>

<style scoped>
:deep(.too-old td) {
  background-color: rgba(225, 232, 23, 0.75) !important;
}
</style>
