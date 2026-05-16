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
      :row-class-name="rowClassName" 
    />
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import OutputExcel from "../../components/OutputExcel.vue";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import { useUserStore } from "../../stores/userdata";

// 1. 正規化：透過 src/api 呼叫，完全拔除 axios
import { getAllCities } from "@/api/admin";
import { getGcpReport } from "@/api/report"; // 請確認你的報告 API 是這支

const store = useUserStore();
const canusecitys = store.citys || [];

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
const options = ref([]);

// 2. 動態載入縣市邏輯
const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];

    const fallbackBqMap = {
      2: "Taipei", 3: "Newtaipei", 4: "Taoyuan", 5: "Hsinchu", 6: "Hsinchu_Country",
      20: "HsinchuScience", 7: "Miaoli", 8: "Taichung", 12: "Chiayi", 13: "Chiayi_Country",
      14: "Tainan", 15: "Kaohsiung", 16: "Pingtung", 19: "Taitung"
    };

    options.value = dbCities.map(c => {
      let gcpVal = "";
      if (c.codes) {
        gcpVal = c.codes.split(',')[0].trim();
      } else {
        gcpVal = fallbackBqMap[c.city_id] || "";
      }

      return {
        label: c.city_name,
        value: gcpVal,
        disabled: !canusecitys.includes(c.city_id)
      };
    }).filter(opt => opt.value !== ""); 
  } catch (error) {
    console.error("載入縣市失敗:", error);
  }
};

onMounted(() => {
  loadCities();
});

// 🌟 3. 一灰一白斑馬紋設定
const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

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
  currentDate.setHours(0, 0, 0, 0); 

  const date = new Date(ts);
  const year = date.getFullYear();
  if (year < 2024) {
    return true;
  }

  if (endDateValue) {
    const endDate = new Date(endDateValue);
    endDate.setHours(0, 0, 0, 0); 

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    const selectedDate = new Date(ts);
    selectedDate.setHours(0, 0, 0, 0); 

    if (
      selectedDate < startDate ||
      selectedDate > endDate ||
      selectedDate > currentDate
    ) {
      return true;
    }
  } else {
    const selectedDate = new Date(ts);
    selectedDate.setHours(0, 0, 0, 0); 

    if (selectedDate > currentDate) {
      return true;
    }
  }
};

const disableEndDate = (ts) => {
  const startDateValue = starttimestamp.value;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); 

  const date = new Date(ts);
  const year = date.getFullYear();
  if (year < 2024) {
    return true;
  }

  if (startDateValue) {
    const startDate = new Date(startDateValue);
    startDate.setHours(0, 0, 0, 0); 

    if (startDate > currentDate) {
      return true;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    const selectedDate = new Date(ts);
    selectedDate.setHours(0, 0, 0, 0); 

    if (
      selectedDate < startDate ||
      selectedDate > endDate ||
      selectedDate > currentDate
    ) {
      return true;
    }
  } else {
    const selectedDate = new Date(ts);
    selectedDate.setHours(0, 0, 0, 0); 

    if (selectedDate > currentDate) {
      return true;
    }
  }
};

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

const columns = ref([
  { key: "item1", align: "center", title: "日期" },
  { key: "item2", align: "center", title: "時段" },
  { key: "item3", align: "center", title: "縣市" },
  { key: "item4", align: "center", title: "系統" },
  { key: "item5", align: "center", title: "在站" },
  { key: "item6", align: "center", title: "使用" },
  { key: "item7", align: "center", title: "維修" },
  { key: "item8", align: "center", title: "調度" },
  { key: "item9", align: "center", title: "合計" },
  { key: "item10", align: "center", title: "合約車輛數" },
  { key: "item11", align: "center", title: "境內車輛數占比" },
  { key: "item12", align: "center", title: "差異數" },
]);

function makeData(data) {
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

const getData = async () => {
  const params = {
    dataset_id: "report",
    table_id: "bike_checklist_hour_report",
    begin_date: starttimestamp.value,
    end_date: endtimestamp.value,
    city: [...cityvalue.value],
    hour: hoursValue.value,
  };
  
  try {
    isLoading.value = true;
    // 🌟 透過集中管理的 src/api 呼叫
    const res = await getGcpReport(params);
    isLoading.value = false;
    
    // axios 封裝通常回傳結構會包在 data 裡面
    const resdata = res.data.data || []; 

    makeData(resdata);

    if (dataTable.value) {
      dataTable.value.page(1);
    }
    makeExecl(totaldata.value, columns.value, "每小時車輛狀態");
  } catch (error) {
    isLoading.value = false;
    console.error(error);
    swal({ icon: "error", title: "查詢失敗，請檢查網路狀態或條件" });
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

<style scoped>
/* 🚀 灰色行的背景顏色 */
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

/* 確保滑鼠移過去時有回饋顏色 */
:deep(.n-data-table .n-data-table-tr.gray-row:hover td) {
  background-color: #d1d1d1 !important;
}
</style>