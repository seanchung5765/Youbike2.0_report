<template>
  <div class="container-fluid px-0">
    <Loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">卡片騎乘天數(每月5號更新資料)</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >城市:</label
        >
      </div>
      <div class="row col-md-2 align-items-center mx-0">
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
      <div class="row col-md-auto col-12 ps-md-2 pe-md-3 mx-auto mx-md-0">
        <button
          type="button"
          class="btn btn-success text-light mt-3 mt-md-0"
          @click="setallcity"
        >
          城市全選
        </button>
      </div>
      <div class="row align-items-center col-md-2 col-12 mt-3 mt-md-0 pe-0">
        <div class="mx-0 mx-md-2 col-md-auto pe-0">
          <n-date-picker
            class="px-0"
            v-model:formatted-value="timestamp"
            type="month"
            :actions="null"
            update-value-on-close
            :is-date-disabled="disablePreviousDate"
            value-format="yyyy-MM"
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
      v-show="data.length > 0"
      ref="dataTable"
      size="small"
      :columns="column"
      :data="data"
      :pagination="{ pageSize: 17 }"
      :max-height="600"
      :scroll-x="400"
      :bordered="false"
      :single-line="false"
      striped
    />
  </div>
</template>

<script setup>
import { useUserStore } from "../../stores/userdata";
import axios from "axios";
import { ref, inject } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
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

const city = ref([]);
const isLoading = ref(false);
const data = ref([]);
const dataTable = ref(null);
const timestamp = ref();

const setallcity = () => {
  let arr = [];
  cityoptions.forEach((item) => {
    arr.push(item.value);
  });
  city.value = arr;
};

let cityoptions = [
  {
    label: "臺北",
    value: "1",
    disabled: !canusecitys.includes(2),
  },
  {
    label: "新北",
    value: "2",
    disabled: !canusecitys.includes(3),
  },
  {
    label: "桃園",
    value: "3",
    disabled: !canusecitys.includes(4),
  },
  {
    label: "新竹市+竹科",
    value: "5",
    disabled: !canusecitys.includes(5),
  },
  {
    label: "新竹縣",
    value: "4",
    disabled: !canusecitys.includes(6),
  },
  {
    label: "苗栗",
    value: "6",
    disabled: !canusecitys.includes(7),
  },
  {
    label: "臺中",
    value: "7",
    disabled: !canusecitys.includes(8),
  },
  {
    label: "嘉義",
    value: "9",
    disabled: !(canusecitys.includes(12) || canusecitys.includes(13)),
  },
  {
    label: "台南",
    value: "11",
    disabled: !canusecitys.includes(14),
  },

  {
    label: "高雄",
    value: "10",
    disabled: !canusecitys.includes(15),
  },
  {
    label: "屏東",
    value: "12",
    disabled: !canusecitys.includes(16),
  },
  {
    label: "台東",
    value: "13",
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

const disablePreviousDate = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const now = new Date(); // 获取当前时间
  const nowyear = now.getFullYear();
  const nowmonth = now.getMonth() + 1;

  // 禁用2022年之前和当前年份的日期
  if (year < 2022 || year > nowyear) {
    return true;
  }

  // 禁用当前年份的当前月份以后的日期
  if (year === nowyear && month >= nowmonth) {
    return true;
  }

  // 禁用当前年份的上个月以后的日期
  if (year === nowyear && month === nowmonth && now.getDate() < 2) {
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

const column = ref([
  {
    key: "city",
    align: "center",
    fixed: "left",
    title: "城市",
  },
  {
    key: "month",
    align: "center",
    title: "月份",
  },
  {
    key: "rideday",
    align: "center",
    title: "騎乘天數",
  },
  {
    key: "cardnum",
    align: "center",
    title: "卡片數量",
  },
]);

const getDate = async () => {
  try {
    isLoading.value = true;
    data.value = [];
    // isLoading.value = true
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "data_analysis",
      table_id: "tan_tan_2",
      city: city.value,
      date: timestamp.value,
    };
    const res = await axios.get(url, { params });
    isLoading.value = false;
    dataTable.value.page(1);

    res.data.data.forEach((element) => {
      data.value.push({
        city: element.city,
        month: element.date,
        rideday: element.times,
        cardnum: element.card_number,
      });
    });
    makeExecl(data.value, column.value, "卡片騎乘天數");
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (city.value.length <= 0) {
    return NotCityAlert("請選擇城市");
  } else if (!timestamp.value) {
    return NotCityAlert("請選擇日期");
  }
  getDate();
};
</script>

<style></style>
