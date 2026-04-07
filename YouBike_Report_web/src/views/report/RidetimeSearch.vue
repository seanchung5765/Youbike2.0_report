<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">yb2騎乘時間查詢</h1>
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
            <option value="2.0">2.0</option>
            <option value="2.0E">2.0E</option>
          </select>
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder">城市:</label>

        <div class="col-md-auto px-0">
          <select class="form-select form-select-sm" aria-label="car" v-model="city">
            <option selected disabled>請選擇</option>
            <template v-if="category === '2.0'">
              <option value="台北市" v-if="canusecitys.includes(2)">台北市</option>
              <option value="新北市" v-if="canusecitys.includes(3)">新北市</option>
              <option value="桃園市" v-if="canusecitys.includes(4)">桃園市</option>
              <option value="新竹市" v-if="canusecitys.includes(5)">新竹市</option>
              <option value="新竹縣" v-if="canusecitys.includes(6)">新竹縣</option>
              <option value="竹科" v-if="canusecitys.includes(20)">竹科</option>
              <option value="苗栗縣" v-if="canusecitys.includes(7)">苗栗縣</option>
              <option value="台中市" v-if="canusecitys.includes(8)">台中市</option>
              <option value="嘉義市" v-if="canusecitys.includes(12)">嘉義市</option>
              <option value="嘉義縣" v-if="canusecitys.includes(13)">嘉義縣</option>
              <option value="台南市" v-if="canusecitys.includes(14)">台南市</option>
              <option value="高雄市" v-if="canusecitys.includes(15)">高雄市</option>
              <option value="屏東縣" v-if="canusecitys.includes(16)">屏東縣</option>
              <option value="台東縣" v-if="canusecitys.includes(19)">台東縣</option>
            </template>
            <template v-else-if="category === '2.0E'">
              <option value="台北市" v-if="canusecitys.includes(2)">台北市</option>
              <option value="新北市" v-if="canusecitys.includes(3)">新北市</option>
              <option value="桃園市" v-if="canusecitys.includes(4)">桃園市</option>
              <option value="新竹市" v-if="canusecitys.includes(5)">新竹市</option>
              <option value="新竹縣" v-if="canusecitys.includes(6)">新竹縣</option>
              <option value="竹科" v-if="canusecitys.includes(20)">竹科</option>
              <option value="苗栗縣" v-if="canusecitys.includes(7)">苗栗縣</option>
              <option value="台中市" v-if="canusecitys.includes(8)">台中市</option>
              <option value="嘉義市" v-if="canusecitys.includes(12)">嘉義市</option>
              <option value="嘉義縣" v-if="canusecitys.includes(13)">嘉義縣</option>
              <option value="台南市" v-if="canusecitys.includes(14)">台南市</option>
              <option value="高雄市" v-if="canusecitys.includes(15)">高雄市</option>
              <option value="屏東縣" v-if="canusecitys.includes(16)">屏東縣</option>
              <option value="台東縣" v-if="canusecitys.includes(19)">台東縣</option>
            </template>
          </select>
        </div>
      </div>
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">項目:</label>
      </div>
      <div class="row mx-0 ms-md-2 align-items-center col-md-2 col-12 me-0">
        <n-select
          class="px-0"
          v-model:value="optionsvalue"
          placeholder="請選擇"
          multiple
          :options="options"
          :max-tag-count="1"
          size="medium"
        />
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0">
        <n-date-picker
          class="px-0"
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
          class="px-0"
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
      :columns="column"
      size="small"
      :pagination="{ pageSize: 17 }"
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
import { useUserStore } from "../../stores/userdata";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
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
const category = ref("請選擇");
const column = [
  {
    key: "num1",
    align: "center",
    fixed: "left",
    width: 150,
    title: "縣市",
  },
  {
    key: "num2",
    align: "center",
    title: "鄉鎮市區",
  },
  {
    key: "num3",
    align: "center",
    title: "同站／跨站",
  },
  {
    key: "num4",
    align: "center",
    title: "費率別",
  },
  {
    key: "num5",
    align: "center",
    title: "騎乘時間",
  },
  {
    key: "num6",
    align: "center",
    title: "次數",
  },
];

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
const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

const options = [
  {
    label: "同站借還",
    value: "同站借還",
  },
  {
    label: "跨站借還",
    value: "跨站借還",
  },
];
const optionsvalue = ref([]);

const getData = async () => {
  try {
    isLoading.value = true;
    data.value = [];
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "report",
      table_id: "rent_minute_report2",
      // "table_id_test": 1,
      begin_date: starttimestamp.value,
      end_date: endtimestamp.value,
      city: `${city.value}${category.value}`,
      item: optionsvalue.value,
    };
    const res = await axios.get(url, { params });
    console.log(res.data.data);
    let arr = [];
    res.data.data.forEach((element, index) => {
      if (index == 0) {
        arr.push({
          num1: element.city,
          num2: element.SxPSArea,
          num3: element.same_station,
          num4: element.rate_info,
          num5: element.rent_minute,
          num6: element.times,
        });
        return;
      }

      if (
        arr[arr.length - 1].num2 == element.SxPSArea &&
        arr[arr.length - 1].num3 == element.same_station &&
        arr[arr.length - 1].num4 == element.rate_info &&
        arr[arr.length - 1].num5 == element.rent_minute
      ) {
        arr[arr.length - 1].num6 += element.times;
      } else {
        arr.push({
          num1: element.city,
          num2: element.SxPSArea,
          num3: element.same_station,
          num4: element.rate_info,
          num5: element.rent_minute,
          num6: element.times,
        });
      }
    });

    data.value = [...arr];

    isLoading.value = false;
    makeExecl(data.value, column, "yb2騎乘時間查詢");
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (category.value === "請選擇") {
    return NotCityAlert("請選擇系統別");
  } else if (city.value == "請選擇") {
    return NotCityAlert("請選擇城市");
  } else if (optionsvalue.value.length === 0) {
    return NotCityAlert("請選擇項目");
  } else if (!starttimestamp.value) {
    return NotCityAlert("請選擇開始日期");
  } else if (!endtimestamp.value) {
    return NotCityAlert("請選擇結束日期");
  }
  getData();
};
</script>

<style></style>
