<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">每小時車輛狀態</h1>
    </div>

    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">城市:</label>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-2 col-12">
        <n-select
          class="px-0"
          v-model:value="cityvalue"
          placeholder="請選擇"
          multiple
          :options="options"
          :max-tag-count="1"
          size="medium"
        />
      </div>
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">時段:</label>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-2 col-12">
        <n-select
          class="px-0"
          v-model:value="hoursValue"
          placeholder="請選擇"
          multiple
          :options="gethours()"
          :max-tag-count="1"
          size="medium"
        />
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
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
      v-show="totaldata.length > 0"
      ref="dataTable"
      size="small"
      :columns="columns"
      :data="totaldata"
      :pagination="{ pageSize: 13 }"
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
import OutputExcel from "../../components/OutputExcel.vue";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
const store = useUserStore();
const canusecitys = store.citys;
//亮亮模式暗暗模式切換
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

const isLoading = ref(false);
const dataTable = ref(null);
const totaldata = ref([]);

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

const cityvalue = ref([]);

let options = [
  {
    label: "台北市",
    value: "Taipei",
    disabled: !canusecitys.includes(2),
  },
  {
    label: "新北市",
    value: "Newtaipei",
    disabled: !canusecitys.includes(3),
  },

  {
    label: "桃園市",
    value: "Taoyuan",
    disabled: !canusecitys.includes(4),
  },
  {
    label: "新竹市",
    value: "Hsinchu",
    disabled: !canusecitys.includes(5),
  },
  {
    label: "新竹縣",
    value: "Hsinchu_Country",
    disabled: !canusecitys.includes(6),
  },
  {
    label: "竹科",
    value: "HsinchuScience",
    disabled: !canusecitys.includes(20),
  },
  {
    label: "苗栗縣",
    value: "Miaoli",
    disabled: !canusecitys.includes(7),
  },
  {
    label: "台中市",
    value: "Taichung",
    disabled: !canusecitys.includes(8),
  },

  {
    label: "嘉義市",
    value: "Chiayi",
    disabled: !canusecitys.includes(12),
  },
  {
    label: "嘉義縣",
    value: "Chiayi_Country",
    disabled: !canusecitys.includes(13),
  },

  {
    label: "台南市",
    value: "Tainan",
    disabled: !canusecitys.includes(14),
  },

  {
    label: "高雄市",
    value: "Kaohsiung",
    disabled: !canusecitys.includes(15),
  },
  {
    label: "屏東縣",
    value: "Pingtung",
    disabled: !canusecitys.includes(16),
  },
  {
    label: "台東縣",
    value: "Taitung",
    disabled: !canusecitys.includes(19),
  },
];

const hoursValue = ref([]);
//把counts 變成0~23
function gethours() {
  let arr = [];
  for (let index = 0; index < 24; index++) {
    arr.push({
      label: index,
      value: index,
    });
  }
  return arr;
}

function formatDate(selectDate) {
  const dateObject = new Date(selectDate);
  const year = dateObject.getFullYear();
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObject.getDate().toString().padStart(2, "0");
  const formattedDate = year + "-" + month + "-" + day;
  return formattedDate;
}

const disablestartDate = (ts) => {
  const endDateValue = endtimestamp.value;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // 设置当前日期的时间为午夜

  const date = new Date(ts);
  const year = date.getFullYear();
  if (year < 2024) {
    return true;
  }

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
      selectedDate > currentDate
    ) {
      // 如果选中日期在结束日期之前、结束日期后的31天之外，或是今天及未来的日期，禁用选中日期
      return true;
    }
  } else {
    const selectedDate = new Date(ts);
    selectedDate.setHours(0, 0, 0, 0); // 设置选中日期的时间为午夜

    if (selectedDate > currentDate) {
      // 如果选中日期是今天及未来的日期，禁用选中日期
      return true;
    }
  }
};

const disableEndDate = (ts) => {
  const startDateValue = starttimestamp.value;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // 设置当前日期的时间为午夜

  const date = new Date(ts);
  const year = date.getFullYear();
  if (year < 2024) {
    return true;
  }

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
      selectedDate > currentDate
    ) {
      // 如果选中日期在起始日期之前、起始日期后的31天之外，或是今天及未来的日期，禁用选中日期
      return true;
    }
  } else {
    const selectedDate = new Date(ts);
    selectedDate.setHours(0, 0, 0, 0); // 设置选中日期的时间为午夜

    if (selectedDate > currentDate) {
      // 如果选中日期是今天及未来的日期，禁用选中日期
      return true;
    }
  }
};

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

const columns = ref([
  {
    key: "item1",
    align: "center",
    title: "日期",
  },
  {
    key: "item2",
    align: "center",
    title: "時段",
  },
  {
    key: "item3",
    align: "center",
    title: "縣市",
  },
  {
    key: "item4",
    align: "center",
    title: "系統",
  },
  {
    key: "item5",
    align: "center",
    title: "在站",
  },
  {
    key: "item6",
    align: "center",
    title: "使用",
  },
  {
    key: "item7",
    align: "center",
    title: "維修",
  },
  {
    key: "item8",
    align: "center",
    title: "調度",
  },
  {
    key: "item9",
    align: "center",
    title: "合計",
  },
  {
    key: "item10",
    align: "center",
    title: "合約車輛數",
  },
  {
    key: "item11",
    align: "center",
    title: "境內車輛數占比",
  },
  {
    key: "item12",
    align: "center",
    title: "差異數",
  },
]);

function makeData(data) {
  // totaldata
  totaldata.value = [];
  totaldata.value = data.map((item) => {
    return {
      item1: formatDate(item.date),
      item2: item.hour,
      item3: item.city,
      item4: item.sys,
      item5: item.in_station,
      item6: item.use,
      item7: item.repair,
      item8: item.dispatch,
      item9: item.total,
      item10: item.bike_number,
      item11: item.percentage,
      item12: item.different,
    };
  });
}

//切割字串,得到
// function getCity(str) {
//   const arr = [...str];
// }

const getData = async () => {
  //確認是否為

  const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;

  const params = {
    dataset_id: "report",
    table_id: "bike_checklist_hour_report",
    begin_date: starttimestamp.value,
    end_date: endtimestamp.value,
    city: [...cityvalue.value],
    hour: hoursValue.value,
  };
  // console.log(params);
  try {
    isLoading.value = true;
    const res = await axios.get(url, { params });
    console.log(res);
    isLoading.value = false;
    const resdata = res.data.data;

    makeData(resdata);

    if (dataTable.value) {
      dataTable.value.page(1);
    }
    makeExecl(totaldata.value, columns.value, "每小時車輛狀態");
  } catch (error) {
    console.log(error);
  }
};

const search = () => {
  if (cityvalue.value.length === 0) {
    NotCityAlert("請選擇城市");
    return;
  } else if (hoursValue.value.length === 0) {
    NotCityAlert("請選擇小時");
    return;
  } else if (!starttimestamp.value) {
    NotCityAlert("請選擇開始日期");
    return;
  } else if (!endtimestamp.value) {
    NotCityAlert("請選擇結束日期");
    return;
  }

  getData();
};
</script>

<style scoped></style>
