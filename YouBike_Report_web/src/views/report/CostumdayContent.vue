<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">客服每日來電詢問內容</h1>
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
            <option value="1.0">1.0</option>
            <option value="2.0">2.0</option>
          </select>
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder">城市:</label>
        <div class="col-md-auto px-0">
          <select class="form-select form-select-sm" aria-label="car" v-model="city">
            <option selected disabled>請選擇</option>
            <template v-if="category == 1">
              <option value="Newtaipei" v-if="canusecitys.includes(3)">新北市</option>
              <option value="Taoyuan" v-if="canusecitys.includes(4)">桃園市</option>
              <option value="Miaoli" v-if="canusecitys.includes(7)">苗栗縣</option>
            </template>
            <template v-else-if="category == '2.0'">
              <option value="Taipei" v-if="canusecitys.includes(2)">台北市</option>
              <option value="Newtaipei" v-if="canusecitys.includes(3)">新北市</option>
              <option value="Hsinchu" v-if="canusecitys.includes(5)">新竹市</option>
              <option value="Hsinchu_Country" v-if="canusecitys.includes(6)">
                新竹縣
              </option>
              <option value="Miaoli" v-if="canusecitys.includes(7)">苗栗縣</option>
              <option value="Taichung" v-if="canusecitys.includes(8)">台中市</option>
              <option value="Chiayi" v-if="canusecitys.includes(12)">嘉義市</option>
              <option value="Chiayi_Country" v-if="canusecitys.includes(13)">
                嘉義縣
              </option>
              <option value="Tainan" v-if="canusecitys.includes(14)">台南市</option>
              <option value="Kaohsiung" v-if="canusecitys.includes(15)">高雄市</option>
              <option value="Pingtung" v-if="canusecitys.includes(16)">屏東縣</option>
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
      v-show="data.length > 0"
      size="small"
      :data="data"
      ref="dataTable"
      :columns="columns"
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
import { useUserStore } from "../../stores/userdata";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
const ischange = inject("ischange");
const swal = inject("$swal");
const store = useUserStore();
const canusecitys = store.citys;
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
const data = ref([]);
const category = ref("請選擇");
const dataTable = ref(null);
const columns = ref([]);
const city = ref("請選擇");
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

function convertToYYYYMMDD(dateString) {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const makecol = (resdata) => {
  if (!resdata.length) {
    columns.value = [];
  } else {
    let arr = [
      {
        key: "item1",
        align: "center",
        title: "",
      },
      {
        key: "item2",
        align: "center",
        title: "",
      },
    ];

    resdata.forEach((item, index) => {
      arr.push({
        key: `item${index + 3}`,
        align: "center",
        title: convertToYYYYMMDD(item[0].date),
      });
    });

    if (category.value === "1.0") {
      arr[0]["rowSpan"] = (rowData, rowIndex) => {
        if (rowIndex === 0) {
          return 5;
        } else if (rowIndex === 5) {
          return 4;
        } else if (rowIndex === 9) {
          return 12;
        } else if (rowIndex === 21) {
          return 3;
        } else if (rowIndex === 24) {
          return 3;
        } else if (rowIndex === 27) {
          return 4;
        } else if (rowIndex === 31) {
          return 4;
        } else if (rowIndex === 35) {
          return 5;
        }
      };
    } else {
      arr[0]["rowSpan"] = (rowData, rowIndex) => {
        if (rowIndex === 0) {
          return 3;
        } else if (rowIndex === 3) {
          return 5;
        } else if (rowIndex === 8) {
          return 12;
        } else if (rowIndex === 20) {
          return 3;
        } else if (rowIndex === 23) {
          return 3;
        } else if (rowIndex === 26) {
          return 2;
        } else if (rowIndex === 28) {
          return 5;
        } else if (rowIndex === 33) {
          return 3;
        }
      };
    }
    columns.value = [...arr];
  }
};

const makedata = (resdata) => {
  if (!resdata[0]) {
    data.value = [];
  } else {
    const arr = [];
    resdata[0].forEach((item) => {
      arr.push({
        item1: item.category,
        item2: item.service,
        item3: item.total,
      });
    });
    resdata.forEach((items, indexs) => {
      if (indexs !== 0) {
        items.forEach((item, index) => {
          arr[index][`item${indexs + 3}`] = item.total;
        });
      }
    });
    data.value = [...arr];
  }
};

const getData = async () => {
  const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
  const params = {
    dataset_id: "report",
    table_id: "CTI_daily_detail",
    begin_date: starttimestamp.value,
    end_date: endtimestamp.value,
    city: city.value,
    sys: category.value,
  };
  isLoading.value = true;
  const res = await axios.get(url, { params });

  const resdata = res.data.data;
  makecol([...resdata]);
  makedata([...resdata]);
  makeExecl(data.value, columns.value, "客服每日來電詢問內容");
  isLoading.value = false;
};

const search = () => {
  if (category.value === "請選擇") {
    NotCityAlert("請選擇系統別");
    return;
  } else if (city.value === "請選擇") {
    NotCityAlert("請選擇城市");
    return;
  } else if (!starttimestamp.value) {
    return NotCityAlert("請選擇開始時間");
  } else if (!endtimestamp.value) {
    return NotCityAlert("請選擇結束時間");
  }
  getData();
};

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};
</script>

<style></style>
