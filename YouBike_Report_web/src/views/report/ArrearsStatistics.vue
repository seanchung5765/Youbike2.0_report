<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">欠費統計(金額區分)</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto">
        <n-date-picker
          class="px-0"
          v-model:formatted-value="timestamp"
          type="year"
          :actions="null"
          :is-date-disabled="disablePreviousDate"
          value-format="yyyy"
        />
      </div>
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
            <option value="2.0+2.0e">2.0+2.0E</option>
          </select>
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder">城市:</label>
        <div class="col-md-auto px-0">
          <select class="form-select form-select-sm" aria-label="car" v-model="city">
            <option selected disabled>請選擇</option>
            <template v-if="category == 1">
              <option value="Taipei" v-if="canusecitys.includes(2)">台北市</option>
              <option value="Newtaipei" v-if="canusecitys.includes(3)">新北市</option>
              <option value="Taoyuan" v-if="canusecitys.includes(4)">桃園縣</option>
              <option value="Hsinchu" v-if="canusecitys.includes(5)">新竹市</option>
              <option value="Miaoli" v-if="canusecitys.includes(7)">苗栗縣</option>
              <option value="Taichung" v-if="canusecitys.includes(8)">台中市</option>
            </template>
            <template v-else-if="category == '2.0+2.0e'">
              <option value="Taipei2" v-if="canusecitys.includes(2)">台北市2.0</option>
              <option value="Taipei2E" v-if="canusecitys.includes(2)">台北市2.0E</option>
              <option value="Newtaipei2" v-if="canusecitys.includes(3)">新北市2.0</option>
              <option value="Newtaipei2E" v-if="canusecitys.includes(3)">新北市2.0E</option>
              <option value="Taoyuan2" v-if="canusecitys.includes(4)">桃園市2.0</option>
              <option value="Taoyuan2E" v-if="canusecitys.includes(4)">桃園市2.0E</option>
              <option value="Hsinchu2" v-if="canusecitys.includes(5)">新竹市2.0</option>
              <option value="Hsinchu2E" v-if="canusecitys.includes(5)">新竹市2.0E</option>
              <option value="Hsinchu_Country2" v-if="canusecitys.includes(6)">新竹縣2.0</option>
              <option value="Hsinchu_Country2E" v-if="canusecitys.includes(6)">新竹縣2.0E</option>
              <option value="HsinchuScience2" v-if="canusecitys.includes(20)">竹科2.0</option>
              <option value="HsinchuScience2E" v-if="canusecitys.includes(20)">竹科2.0E</option>
              <option value="Miaoli2" v-if="canusecitys.includes(7)">苗栗縣2.0</option>
              <option value="Miaoli2E" v-if="canusecitys.includes(7)">苗栗縣2.0E</option>
              <option value="Taichung2" v-if="canusecitys.includes(8)">台中市2.0</option>
              <option value="Taichung2E" v-if="canusecitys.includes(8)">台中市2.0E</option>
              <option value="Chiayi2" v-if="canusecitys.includes(12)">嘉義市2.0</option>
              <option value="Chiayi2E" v-if="canusecitys.includes(12)">嘉義市2.0E</option>
              <option value="Chiayi_Country2" v-if="canusecitys.includes(13)">嘉義縣2.0</option>
              <option value="Chiayi_Country2E" v-if="canusecitys.includes(13)">嘉義縣2.0E</option>
              <option value="Tainan2" v-if="canusecitys.includes(14)">台南市2.0</option>
              <option value="Tainan2E" v-if="canusecitys.includes(14)">台南市2.0E</option>
              <option value="Kaohsiung2" v-if="canusecitys.includes(15)">高雄市2.0</option>
              <option value="Kaohsiung2E" v-if="canusecitys.includes(15)">高雄市2.0E</option>
              <option value="Pingtung2" v-if="canusecitys.includes(16)">屏東縣2.0</option>
              <option value="Pingtung2E" v-if="canusecitys.includes(16)">屏東縣2.0E</option>
              <option value="Taitung2" v-if="canusecitys.includes(19)">台東縣2.0</option>
              <option value="Taitung2E" v-if="canusecitys.includes(19)">台東縣2.0E</option>
            </template>
          </select>
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <button
          type="button"
          class="btn btn-success text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="search">
          搜尋
        </button>
        <output-excel
          class="btn btn-primary text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          :data="exceldata"
          :name="excelename"
          :header="excelecolumn"/>
      </div>
    </form>
    <n-data-table
      v-if="data.length > 0 && whatcheck == 1"
      ref="dataTable"
      :data="data"
      :columns="column1"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="1000"
      :bordered="false"
      size="small"
      :single-line="false"
      striped
    /><n-data-table
      v-if="data.length > 0 && whatcheck == 2"
      ref="dataTable"
      size="small"
      :data="data"
      :columns="column2"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :bordered="false"
      :single-line="false"
      :scroll-x="1000"
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
import { useUserStore } from "../../stores/userdata";
const ischange = inject("ischange");
const swal = inject("$swal");
async function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const store = useUserStore();
const canusecitys = store.citys;
const isLoading = ref(false);
const dataTable = ref();
const category = ref("請選擇");
const whatcheck = ref(null);
const data = ref([]);
const timestamp = ref();
const city = ref("請選擇");
const column1 = [
  {
    key: "num1",
    align: "center",
    fixed: "left",
    title: "欠費級距(元)",
    width: 150,
  },
  {
    key: "num2",
    align: "center",
    title: "真實筆數",
  },
  {
    key: "num3",
    align: "center",
    title: "真實欠款",
  },
  {
    key: "num4",
    align: "center",
    title: "特殊狀況筆數",
  },
  {
    key: "num5",
    align: "center",
    title: "特殊狀況欠款",
  },
  {
    key: "num6",
    align: "center",
    title: "市府應收款(10元)",
  },
  {
    key: "num7",
    align: "center",
    title: "市府應收款(5元)",
  },
  {
    key: "num8",
    align: "center",
    title: "合計市府應收款",
  },
  {
    key: "num9",
    align: "center",
    title: "合計欠費",
  },
];
const column2 = [
  {
    key: "num1",
    align: "center",
    fixed: "left",
    title: "欠費級距(元)",
    width: 150,
  },
  {
    key: "num2",
    align: "center",
    title: "特殊筆數",
  },
  {
    key: "num3",
    align: "center",
    title: "特殊欠款",
  },
  {
    key: "num4",
    align: "center",
    title: "特殊狀況筆數",
  },
  {
    key: "num5",
    align: "center",
    title: "特殊狀況欠款",
  },
  {
    key: "num6",
    align: "center",
    title: "市府應收款(10元)",
  },
  {
    key: "num7",
    align: "center",
    title: "市府應收款(5元)",
  },
  {
    key: "num8",
    align: "center",
    title: "市府應收款(2元)",
  },
  {
    key: "num9",
    align: "center",
    title: "合計市府應收款",
  },
  {
    key: "num10",
    align: "center",
    title: "合計欠費",
  },
];

let exceldata = [];
let excelename = "";
let excelecolumn = [];
const makeExecl = (nowdata, name) => {
  exceldata = [];
  excelename = "";
  excelecolumn = [];

  let col = [];
  exceldata = [...nowdata];
  excelename = name;
  if (category.value == "1") {
    col = [...column1];
  } else if (category.value == "2.0+2.0e") {
    col = [...column2];
  }
  col.forEach((item) => {
    excelecolumn.push(item.title);
  });
};

const disablePreviousDate = (ts) => {
  const date = new Date(ts);
  const previousYear = new Date(2012, 0, 1); // 取得 2012 年的第一天日期
  const nextYear = new Date(new Date().getFullYear() + 1, 0, 0); // 取得明年的第一天日期

  // 如果日期早於等於 2012 年的第一天，或晚於等於明年的第一天，則返回 true，即禁用日期
  if (date <= previousYear || date >= nextYear) {
    return true;
  }

  return false;
};

const getData = async () => {
  try {
    isLoading.value = true;
    data.value = [];
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "data_analysis",
      year: timestamp.value,
      city: city.value,
    };
    if (category.value == 1) {
      params.table_id = "arrearsall_report1";
    } else if (category.value == "2.0+2.0e") {
      params.table_id = "arrearsall_report2";
    }
    const res = await axios.get(url, { params });
    isLoading.value = false;

    if (!res.data.data) {
      return;
    }
    res.data.data.forEach((element) => {
      const dataitem = {};
      if (category.value == "1") {
        (dataitem.num1 = null), (dataitem.num2 = element.CNT_real);
        dataitem.num3 = element.Total_real;
        dataitem.num4 = element.CNT_special;
        dataitem.num5 = element.Total_special;
        dataitem.num6 = element.gov10;
        dataitem.num7 = element.gov5;
        dataitem.num8 = element.gov;
        dataitem.num9 = element.total_arrearsall;
      } else if (category.value == "2.0+2.0e") {
        (dataitem.num1 = null), (dataitem.num2 = element.CNT_real);
        dataitem.num3 = element.Total_real;
        dataitem.num4 = element.CNT_special;
        dataitem.num5 = element.Total_special;
        dataitem.num6 = element.gov10;
        dataitem.num7 = element.gov5;
        dataitem.num8 = element.gov2;
        dataitem.num9 = element.gov;
        dataitem.num10 = element.total_arrearsall;
      }
      switch (element.amt_range) {
        case 0:
          dataitem.num1 = "0";
          break;

        case 1:
          dataitem.num1 = "5";
          break;

        case 2:
          dataitem.num1 = "10";
          break;
        case 3:
          dataitem.num1 = "15";
          break;
        case 4:
          dataitem.num1 = "20";
          break;
        case 5:
          dataitem.num1 = "25";
          break;
        case 6:
          dataitem.num1 = "30";
          break;
        case 7:
          dataitem.num1 = "35";
          break;
        case 8:
          dataitem.num1 = "40";
          break;
        case 9:
          dataitem.num1 = "45";
          break;
        case 10:
          dataitem.num1 = "50";
          break;
        case 11:
          dataitem.num1 = "55-100";
          break;
        case 12:
          dataitem.num1 = "105-200";
          break;
        case 13:
          dataitem.num1 = "205-500";
          break;
        case 14:
          dataitem.num1 = "505-1000";
          break;
        case 15:
          dataitem.num1 = "1005-5000";
          break;
        case 16:
          dataitem.num1 = "5005-9995";
          break;
        case 17:
          dataitem.num1 = "9999以上";
          break;
        case 18:
          dataitem.num1 = "臺大專區(200元以下)";
          break;
        case 19:
          dataitem.num1 = "臺大專區(201元以上)";
          break;
        case 20:
          dataitem.num1 = "總計";
          break;
        default:
          break;
      }
      data.value.push(dataitem);
      makeExecl(data.value, "欠費統計(金額區分)");
    });
  } catch (error) {
    console.log(error);
  }
};
const search = () => {
  if (!timestamp.value) {
    NotCityAlert("請選擇日期");
    return;
  } else if (category.value == "請選擇") {
    NotCityAlert("系統不能為空");
    return;
  } else if (city.value == "請選擇") {
    NotCityAlert("城市不能為空");
    return;
  }

  if (category.value == "1") {
    whatcheck.value = 1;
  } else if (category.value == "2.0+2.0e") {
    whatcheck.value = 2;
  }
  getData();
};
</script>

<style></style>
