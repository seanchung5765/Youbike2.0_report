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
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto; white-space: nowrap;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0">城市:</label>
        <div style="width: 140px;">
          <n-select
            v-model:value="cityvalue"
            placeholder="請選擇"
            multiple
            :options="options"
            :max-tag-count="1"
            size="medium"
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <label class="fw-bolder mb-0">時段:</label>
        <n-checkbox v-model:checked="isAllHours" size="large">全選</n-checkbox>
        <div style="width: 160px;">
          <n-select
            v-model:value="hoursValue"
            placeholder="請選擇"
            multiple
            :options="gethours()"
            :max-tag-count="1"
            size="medium"
            :disabled="isAllHours" 
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <div style="width: 140px;">
          <n-date-picker
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
        <span class="fw-bold">至</span>
        <div style="width: 140px;">
          <n-date-picker
            v-model:formatted-value="endtimestamp"
            type="date"
            :actions="null"
            :input-readonly="true"
            :update-value-on-close="true"
            placeholder="結束日期"
            value-format="yyyy-MM-dd"
            :is-date-disabled="disableEndDate"
          />
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-info text-light" @click="cleardate">清空日期</button>
        <button type="button" class="btn btn-success text-light" @click="search">搜尋</button>
        <output-excel
          class="btn btn-primary text-light"
          :data="exceldata"
          :name="excelename"
          :header="excelecolumn"
        />
      </div>
    </form>
    
    <div style="height: calc(100vh - 180px); padding-bottom: 20px; margin-top: 10px;">
      <n-data-table
        v-show="totaldata.length > 0"
        ref="dataTable"
        size="small"
        :columns="columns"
        :data="totaldata"
        :max-height="600"
        :scroll-x="1200"
        :bordered="false"
        :single-line="false"
        striped
        flex-height
        style="height: 100%;"
        :row-class-name="rowClassName" 
      />
    </div>
  </div>
</template>

<script setup>
// 🚀 記得補上 watch 的引入
import { ref, inject, onMounted, watch } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import OutputExcel from "../../components/OutputExcel.vue";
// 🚀 記得補上 NCheckbox 的引入
import { NDataTable, NDatePicker, NSelect, NCheckbox } from "naive-ui";
import { useUserStore } from "../../stores/userdata";

import { getAllCities } from "@/api/admin";
import { getGcpReport } from "@/api/report"; 

const store = useUserStore();
const canusecitys = store.citys || [];

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
        let rawCode = c.codes.split(',')[0].trim();
        gcpVal = rawCode.replace(/2E$/i, '').replace(/2$/i, ''); 
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

const rowClassName = (row, index) => {
  return index % 2 === 1 ? 'gray-row' : '';
};

// 🚀 時段全選邏輯
const hoursValue = ref([]);
const isAllHours = ref(false);

watch(isAllHours, (newVal) => {
  if (newVal) {
    // 全選：自動塞入 0 到 23
    hoursValue.value = Array.from({ length: 24 }, (_, i) => i);
  } else {
    // 取消全選：清空
    hoursValue.value = [];
  }
});

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
  { key: "item13", align: "center", title: "可用率" },
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
      item13: item.bike_used_percent, 
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
    const res = await getGcpReport(params);
    isLoading.value = false;
    
    const resdata = res.data.data || []; 

    makeData(resdata);

    // 🚀 已經把報錯的 dataTable.value.page(1) 拿掉囉！
    
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
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

:deep(.n-data-table .n-data-table-tr.gray-row:hover td) {
  background-color: #d1d1d1 !important;
}
</style>