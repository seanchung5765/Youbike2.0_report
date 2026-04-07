<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">平日、假日熱門的OD點(每月10號更新資料)</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">平日/假日:</label>
      </div>

      <div class="row mx-0 mx-md-2 align-items-center col-md-2 col-12">
        <n-select
          class="px-0"
          v-model:value="isweek"
          placeholder="請選擇"
          multiple
          :options="isWeekoptions"
          :max-tag-count="1"
          size="medium"
        />
      </div>
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">城市:</label>
      </div>

      <div class="row mx-0 mx-md-2 align-items-center col-md-3 col-12">
        <n-select
          class="px-0"
          v-model:value="city"
          placeholder="請選擇"
          multiple
          :options="cityoptions"
          :max-tag-count="1"
          size="medium"
        />
      </div>

      <div class="row col-md-auto col-12 ps-md-0 pe-md-3 mx-auto mx-md-0 mb-3 mb-md-0">
        <button
          type="button"
          class="btn btn-success text-light mt-3 mt-md-0"
          @click="setallcity"
        >
          城市全選
        </button>
      </div>
      <div class="row col-md-auto col-12 ps-md-0 pe-md-3 mx-auto mx-md-0">
        <n-date-picker
          class="px-0"
          v-model:formatted-value="timestamp"
          type="month"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="請選擇日期"
          value-format="yyyy-MM"
          :is-date-disabled="disablePreviousDate"
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
      v-show="data.length > 1"
      size="small"
      :data="data"
      ref="dataTable"
      :columns="columns"
      :pagination="{ pageSize: 17 }"
      :max-height="600"
      :scroll-x="1300"
      :bordered="false"
      :single-line="false"
      striped
    />
  </div>
</template>

<script setup>
import axios from "axios";
import { useUserStore } from "../../stores/userdata";
import { ref, inject } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NSelect, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
const store = useUserStore();
const canusecitys = store.citys;
const ischange = inject("ischange");
const isLoading = ref(false);
const isweek = ref([]);
const data = ref([]);
const dataTable = ref(null);
const city = ref([]);
const timestamp = ref();
const isWeekoptions = [
  {
    label: "平日",
    value: "是",
  },
  {
    label: "假日",
    value: "否",
  },
];

const disablePreviousDate = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const now = new Date(); // 获取当前时间
  const nowyear = now.getFullYear();
  const nowmonth = now.getMonth() + 1;

  // 禁用2023年6月之前的日期和当前月份之后的日期
  if (year < 2023 || year > nowyear || (year === nowyear && month >= nowmonth)) {
    return true;
  }

  return false;
};

// const cityoptions = [];
let cityoptions = [
{
    label: "台北市2.0",
    value: "台北市2.0",
    disabled: !canusecitys.includes(2),
  },
  {
    label: "台北市2.0E",
    value: "台北市2.0E",
    disabled: !canusecitys.includes(2),
  },
/*
  {
    label: "新北市",
    value: "新北市",
    disabled: !canusecitys.includes(3),
  },
*/
{
    label: "新北市2.0",
    value: "新北市2.0",
    disabled: !canusecitys.includes(3),
  },
  {
    label: "新北市2.0E",
    value: "新北市2.0E",
    disabled: !canusecitys.includes(3),
  },
/*
  {
    label: "桃園市",
    value: "桃園市",
    disabled: !canusecitys.includes(4),
  },
*/
  {
    label: "桃園市2.0",
    value: "桃園市2.0",
    disabled: !canusecitys.includes(4),
  },
  {
    label: "桃園市2.0E",
    value: "桃園市2.0E",
    disabled: !canusecitys.includes(4),
  },
/*
  {
    label: "新竹市",
    value: "新竹市",
    disabled: !canusecitys.includes(5),
  },
*/
  {
    label: "新竹市2.0",
    value: "新竹市2.0",
    disabled: !canusecitys.includes(5),
  },
  {
    label: "新竹市2.0E",
    value: "新竹市2.0E",
    disabled: !canusecitys.includes(5),
  },
  {
    label: "新竹縣2.0",
    value: "新竹縣2.0",
    disabled: !canusecitys.includes(6),
  },
  {
    label: "新竹縣2.0E",
    value: "新竹縣2.0E",
    disabled: !canusecitys.includes(6),
  },
/*
  {
    label: "竹科",
    value: "竹科",
    disabled: !canusecitys.includes(20),
  },
*/
  {
    label: "竹科2.0",
    value: "竹科2.0",
    disabled: !canusecitys.includes(20),
  },
  {
    label: "竹科2.0E",
    value: "竹科2.0E",
    disabled: !canusecitys.includes(20),
  },
/*
  {
    label: "苗栗縣",
    value: "苗栗縣",
    disabled: !canusecitys.includes(7),
  },
*/
  {
    label: "苗栗縣2.0",
    value: "苗栗縣2.0",
    disabled: !canusecitys.includes(7),
  },
  {
    label: "苗栗縣2.0E",
    value: "苗栗縣2.0E",
    disabled: !canusecitys.includes(7),
  },
/*
  {
    label: "台中市",
    value: "台中市",
    disabled: !canusecitys.includes(8),
  },
*/
  {
    label: "台中市2.0",
    value: "台中市2.0",
    disabled: !canusecitys.includes(8),
  },
  {
    label: "台中市2.0E",
    value: "台中市2.0E",
    disabled: !canusecitys.includes(8),
  },
  {
    label: "嘉義市2.0",
    value: "嘉義市2.0",
    disabled: !canusecitys.includes(12),
  },
  {
    label: "嘉義市2.0E",
    value: "嘉義市2.0E",
    disabled: !canusecitys.includes(12),
  },
  {
    label: "嘉義縣2.0",
    value: "嘉義縣2.0",
    disabled: !canusecitys.includes(13),
  },
  {
    label: "嘉義縣2.0E",
    value: "嘉義縣2.0E",
    disabled: !canusecitys.includes(13),
  },
  {
    label: "台南市2.0",
    value: "台南市2.0",
    disabled: !canusecitys.includes(14),
  },
  {
    label: "台南市2.0E",
    value: "台南市2.0E",
    disabled: !canusecitys.includes(14),
  },
  {
    label: "高雄市2.0",
    value: "高雄市2.0",
    disabled: !canusecitys.includes(15),
  },
  {
    label: "高雄市2.0E",
    value: "高雄市2.0E",
    disabled: !canusecitys.includes(15),
  },
  {
    label: "屏東縣2.0",
    value: "屏東縣2.0",
    disabled: !canusecitys.includes(16),
  },
  {
    label: "屏東縣2.0E",
    value: "屏東縣2.0E",
    disabled: !canusecitys.includes(16),
  },
  {
    label: "台東縣2.0",
    value: "台東縣2.0",
    disabled: !canusecitys.includes(19),
  },
  {
    label: "台東縣2.0E",
    value: "台東縣2.0E",
    disabled: !canusecitys.includes(19),
  },
];

(function start() {
  let arr = [];
  cityoptions.forEach((item) => {
    if (item.disabled) {
      return;
    } else {
      arr.push(item);
    }
  });
  cityoptions = [...arr];
})();

const swal = inject("$swal");
async function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}

const columns = [
  {
    key: "num1",
    align: "center",
    fixed: "left",
    title: "名次",
    width: 80,
  },
  {
    key: "num2",
    align: "center",
    title: "平日/假日",
  },
  {
    key: "num3",
    align: "center",
    title: "城市",
  },
  {
    key: "num4",
    align: "center",
    title: "借車站代碼",
  },
  {
    key: "num5",
    align: "center",
    title: "借車站",
    width: 230,
  },
  {
    key: "num6",
    align: "center",
    title: "還車站代碼",
  },
  {
    key: "num7",
    align: "center",
    title: "還車站",
    width: 230,
  },
  {
    key: "num8",
    align: "center",
    title: "租借次數",
  },
];

const setallcity = () => {
  let arr = [];
  cityoptions.forEach((item) => {
    arr.push(item.value);
  });
  city.value = arr;
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

const getData = async () => {
  try {
    isLoading.value = true;
    data.value = [];
    const params = {
      dataset_id: "marketing_report",
      table_id: "OD_rank",
      item: isweek.value,
      city: city.value,
      date: `${timestamp.value}-01`,
    };
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const res = await axios.get(url, { params });
    res.data.data.forEach((item) => {
      data.value.push({
        num1: item.rank,
        num2: item.weekday === "是" ? "平日" : "假日",
        num3: item.city,
        num4: item.rent_s_no,
        num5: item.rent_s_name,
        num6: item.s_no,
        num7: item.s_name,
        num8: item.times,
      });
    });
    if (dataTable.value.page) {
      dataTable.value.page(1);
    }
    makeExecl(data.value, columns, `平日、假日熱門的OD點`);
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (isweek.value.length == "0") {
    return NotCityAlert("請選擇是否平日");
  } else if (city.value.length == "0") {
    return NotCityAlert("請選擇城市");
  } else if (!timestamp.value) {
    NotCityAlert("請選擇日期");
  }
  getData();
};
</script>

<style></style>
