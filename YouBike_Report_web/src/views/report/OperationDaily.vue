<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">營運管理日報</h1>
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
            <option value="daily_report_query1">1.0</option>
            <option value="daily_report_query2">2.0</option>
            <option value="daily_report_query2E">2.0E</option>
          </select>
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder">城市:</label>
        <div class="col-md-auto px-0">
          <select class="form-select form-select-sm" aria-label="car" v-model="city">
            <option selected disabled>請選擇</option>
            <template v-if="category == 'daily_report_query1'">
              <option selected value="Taipei" v-if="canusecitys.includes(2)">
                台北市
              </option>
              <option selected value="Newtaipei" v-if="canusecitys.includes(3)">
                新北市
              </option>
              <option selected value="Taoyuan" v-if="canusecitys.includes(4)">
                桃園市
              </option>
              <option selected value="Hsinchu" v-if="canusecitys.includes(5)">
                新竹市
              </option>
              <option selected value="Miaoli" v-if="canusecitys.includes(7)">
                苗栗縣
              </option>
              <option selected value="Taichung" v-if="canusecitys.includes(8)">
                台中市
              </option>
            </template>
            <template v-else-if="category == 'daily_report_query2'">
              <option value="Taipei2" v-if="canusecitys.includes(2)">
                台北市
              </option>
              <option value="Newtaipei2" v-if="canusecitys.includes(3)">
                新北市
              </option>
              <option value="Taoyuan2" v-if="canusecitys.includes(4)">
                桃園市
              </option>
              <option value="Hsinchu2" v-if="canusecitys.includes(5)">
                新竹市
              </option>
              <option value="Hsinchu_Country2" v-if="canusecitys.includes(6)">
                新竹縣
              </option>
              <option value="HsinchuScience2" v-if="canusecitys.includes(20)">
                竹科
              </option>
              <option value="Miaoli2" v-if="canusecitys.includes(7)">
                苗栗縣
              </option>
              <option value="Taichung2" v-if="canusecitys.includes(8)">
                台中市
              </option>
              <option value="Chiayi2" v-if="canusecitys.includes(12)">
                嘉義市
              </option>
              <option value="Chiayi_Country2" v-if="canusecitys.includes(13)">
                嘉義縣
              </option>
              <option value="Tainan2" v-if="canusecitys.includes(14)">
                台南市
              </option>
              <option value="Kaohsiung2" v-if="canusecitys.includes(15)">
                高雄市
              </option>
              <option value="Pingtung2" v-if="canusecitys.includes(16)">
                屏東縣
              </option>
              <option value="Taitung2" v-if="canusecitys.includes(19)">
                台東縣
              </option>
            </template>
            <template v-else-if="category == 'daily_report_query2E'">
              <option value="Taipei2E" v-if="canusecitys.includes(2)">
                台北市
              </option>
              <option value="Newtaipei2E" v-if="canusecitys.includes(3)">
                新北市
              </option>
              <option value="Taoyuan2E" v-if="canusecitys.includes(4)">
                桃園市
              </option>
              <option value="Hsinchu_Country2E" v-if="canusecitys.includes(6)">
                新竹縣
              </option>
              <option value="HsinchuScience2E" v-if="canusecitys.includes(20)">
                竹科
              </option>
              <option value="Miaoli2E" v-if="canusecitys.includes(7)">
                苗栗縣
              </option>
              <option value="Taichung2E" v-if="canusecitys.includes(8)">
                台中市
              </option>
              <option value="Chiayi2E" v-if="canusecitys.includes(12)">
                嘉義市
              </option>
              <option value="Chiayi_Country2E" v-if="canusecitys.includes(13)">
                嘉義縣
              </option>
              <option value="Tainan2E" v-if="canusecitys.includes(14)">
                台南市
              </option>
              <option value="Kaohsiung2E" v-if="canusecitys.includes(15)">
                高雄市
              </option>
              <option value="Pingtung2E" v-if="canusecitys.includes(16)">
                屏東縣
              </option>
              <option value="Taitung2E" v-if="canusecitys.includes(19)">
                台東縣
              </option>
            </template>
          </select>
        </div>
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
      v-show="'item2' in totaldata[0]"
      ref="dataTable"
      size="small"
      :columns="columns"
      :data="totaldata"
      :row-class-name="rowClassName"
      :pagination="{ pageSize: 100 }"
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
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import OutputExcel from "../../components/OutputExcel.vue";
import { NDataTable, NDatePicker } from "naive-ui";

//亮亮模式暗暗模式切換
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
const starttimestamp = ref();
const endtimestamp = ref();
const category = ref("請選擇");
const city = ref("請選擇");
const isLoading = ref(false);
const dataTable = ref(null);
const totaldata = ref([{}]);
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

const makecol = (data) => {
  const column = [];
  data.forEach((item, index) => {
    if (index === 0) {
      column.push({
        key: `item${index + 1}`,
        align: "center",
        fixed: "left",
        title: `${item[2]}`,
        width: 150,
      });
    } else {
      column.push({
        key: `item${index + 1}`,
        align: "center",
        title: `${item[2]}`,
      });
    }
  });
  columns.value = [...column];
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
  //確認是否為

  const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
  const params = {
    dataset_id: "report",
    table_id: category.value,
    begin_date: starttimestamp.value,
    end_date: endtimestamp.value,
    city: [city.value],
  };
  try {
    isLoading.value = true;
    const res = await axios.get(url, { params });
    const resdata = res.data.data;
    console.log(resdata);
    makecol(resdata);
    isLoading.value = false;

    //column長度
    let columnlength = resdata[0].length - 2;
    //data長度
    let fordata = [];
    for (let i = 1; i <= columnlength; i++) {
      fordata.push({});
    }
    resdata.forEach((items, indexs) => {
      items.forEach((item, index) => {
        if (index === 0 || index === 1 || index === 2) {
          return;
        }
        fordata[index - 3][`item${indexs + 1}`] = item;
      });
    });

    totaldata.value = [...fordata];
    makeExecl(totaldata.value, columns.value, "營運管理日報");
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (category.value == "請選擇") {
    return NotCityAlert("請選擇系統");
  } else if (city.value == "請選擇") {
    return NotCityAlert("請選擇城市");
  } else if (starttimestamp.value == null) {
    return NotCityAlert("請選擇開始日期");
  } else if (endtimestamp.value == null) {
    return NotCityAlert("請選擇結束日期");
  }
  getData();
};

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

const rowClassName = (row) => {
  if (
    row.item1 === "場站資訊" ||
    row.item1 === "租借資訊" ||
    row.item1 === "收入資訊" ||
    row.item1 === "妥善率資訊" ||
    row.item1 === "票卡資訊" ||
    row.item1 === "租借資訊" ||
    row.item1 === "各時段使用資訊" ||
    row.item1 === "租賃收入明細" ||
    (row.item1 === "當日租借車次" && !row.item2) ||
    row.item1 === "營運資訊" ||
    row.item1 === "租賃時間使用資訊" ||
    row.item1 === "調度管理" ||
    row.item1 === "騎乘距離分析" ||
    row.item1 === "維護管理" ||
    (row.item1 === "註冊票卡淨增加數" && !row.item2 && row.item2 !== 0)
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
