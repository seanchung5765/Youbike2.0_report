<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">見車率統計日報</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >城市:</label
        >
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="city"
          >
            <option selected disabled>請選擇</option>
            <option value="台北市" v-if="canusecitys.includes(2)">
              台北市
            </option>
            <option value="新北市" v-if="canusecitys.includes(3)">
              新北市
            </option>
            <option value="桃園市" v-if="canusecitys.includes(4)">
              桃園市
            </option>
            <option value="新竹市" v-if="canusecitys.includes(5)">
              新竹市
            </option>
            <option value="新竹縣" v-if="canusecitys.includes(6)">
              新竹縣
            </option>
            <option value="竹科" v-if="canusecitys.includes(20)">竹科</option>
            <option value="苗栗縣" v-if="canusecitys.includes(7)">
              苗栗縣
            </option>
            <option value="台中市" v-if="canusecitys.includes(8)">
              台中市
            </option>
            <option value="嘉義市" v-if="canusecitys.includes(12)">
              嘉義市
            </option>
            <option value="嘉義縣" v-if="canusecitys.includes(13)">
              嘉義縣
            </option>
            <option value="台南市" v-if="canusecitys.includes(14)">
              台南市
            </option>
            <option value="高雄市" v-if="canusecitys.includes(15)">
              高雄市
            </option>
            <option value="屏東縣" v-if="canusecitys.includes(16)">
              屏東縣
            </option>
            <option value="台東縣" v-if="canusecitys.includes(19)">
              台東縣
            </option>
          </select>
        </div>
      </div>
      <div class="row col-md-auto col-12 my-auto pt-2">
        <n-checkbox v-model:checked="stationAll" size="large"
          >場站全選</n-checkbox
        >
      </div>

      <div class="row col-md-auto col-12 mx-auto mx-md-0">
        <el-select-v2
          :disabled="stationAll"
          v-model="selectstationvalue"
          filterable
          :options="options"
          placeholder="請選擇場站名稱"
          :remote-method="remoteMethod"
          :loading="isloading2"
          class="text-light mt-3 mt-md-0 px-0 mt-md-1 w240"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
        />
      </div>

      <div class="row mx-0 ms-md-0 align-items-center col-md-auto col-12">
        <label class="col-md-auto ms-md-0 col-form-label px-0 px-md-2 fw-bolder"
          >類型:</label
        >
      </div>
      <div class="row col-md-2 align-items-center mx-0 ps-md-0">
        <n-select
          class="px-0"
          v-model:value="category"
          placeholder="請選擇"
          multiple
          :options="status"
          :max-tag-count="1"
          size="medium"
        />
      </div>

      <div
        class="row ps-md-4 mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0"
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
        class="row ps-md-4 mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0"
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
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <button
          type="button"
          class="btn btn-info text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="clearDate"
        >
          清空日期
        </button>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <button
          type="button"
          class="btn btn-primary text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="search"
        >
          搜尋匯出
        </button>
      </div>
    </form>
    <n-result class="mt-5" status="info" title="此頁面只供下載EXCEL">
    </n-result>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, inject, watch } from "vue";
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDatePicker, NSelect, NResult, NCheckbox } from "naive-ui";

const store = useUserStore();
const canusecitys = store.citys;
const isLoading = ref(false);
const ischange = inject("ischange");

import * as XLSX from "xlsx";
const swal = inject("$swal");
const city = ref("請選擇");
async function errorAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
///全部場站資訊
let StationValue = [];
const columns = ref([
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "date",
    width: 100,
    // rowSpan: (rowData,index) => {
    //     return getcolumnum(data.value,rowData,index);
    // }
  },
  {
    key: "item2",
    align: "center",
    title: "責任區",
    width: 60,
    // rowSpan: (rowData,index) => {
    //     if(rowData){
    //         return getcolumnum(data.value,rowData,index);
    //     }
    // }
  },
  {
    key: "item3",
    align: "center",
    title: "場站代號",
    width: 100,
    // rowSpan: (rowData,index) => {
    //     if(rowData){
    //         return getcolumnum(data.value,rowData,index);
    //     }
    // }
  },
  {
    key: "item4",
    align: "center",
    title: "站名",
    width: 250,
    // rowSpan: (rowData,index) => {
    //     if(rowData){
    //         return getcolumnum(data.value,rowData,index);
    //     }
    // }
  },
  {
    key: "item5",
    align: "center",
    title: "狀態",
    width: 60,
  },
  {
    key: "item6",
    align: "center",
    title: "項目",
    width: 70,
  },
  {
    key: "item7",
    align: "center",
    title: "0",
  },
  {
    key: "item8",
    align: "center",
    title: "1",
  },
  {
    key: "item9",
    align: "center",
    title: "2",
  },
  {
    key: "item10",
    align: "center",
    title: "3",
  },
  {
    key: "item11",
    align: "center",
    title: "4",
  },
  {
    key: "item12",
    align: "center",
    title: "5",
  },
  {
    key: "item13",
    align: "center",
    title: "6",
  },
  {
    key: "item14",
    align: "center",
    title: "7",
  },
  {
    key: "item15",
    align: "center",
    title: "8",
  },
  {
    key: "item16",
    align: "center",
    title: "9",
  },
  {
    key: "item17",
    align: "center",
    title: "10",
  },
  {
    key: "item18",
    align: "center",
    title: "11",
  },
  {
    key: "item19",
    align: "center",
    title: "12",
  },
  {
    key: "item20",
    align: "center",
    title: "13",
  },
  {
    key: "item21",
    align: "center",
    title: "14",
  },
  {
    key: "item22",
    align: "center",
    title: "15",
  },
  {
    key: "item23",
    align: "center",
    title: "16",
  },
  {
    key: "item24",
    align: "center",
    title: "17",
  },
  {
    key: "item25",
    align: "center",
    title: "18",
  },
  {
    key: "item26",
    align: "center",
    title: "19",
  },
  {
    key: "item27",
    align: "center",
    title: "20",
  },
  {
    key: "item28",
    align: "center",
    title: "21",
  },
  {
    key: "item29",
    align: "center",
    title: "22",
  },
  {
    key: "item30",
    align: "center",
    title: "23",
  },
  {
    key: "item31",
    align: "center",
    title: "總計",
    width: 50,
  },
]);
const data = ref([]);
const category = ref([]);
const starttimestamp = ref();
const endtimestamp = ref();

function formatDate(dateString) {
  var date = new Date(dateString);

  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);

  var formattedDateString = year + "-" + month + "-" + day;

  return formattedDateString;
}

function disablestartDate(ts) {
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
}

let status = [
  {
    label: "無車",
    value: "無車",
  },
  {
    label: "無位",
    value: "無位",
  },
  {
    label: "見車率",
    value: "見車率",
  },
  {
    label: "見位率",
    value: "見位率",
  },
];

let exceldata = [];
let excelename = "";
let excelecolumn = [];
const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata = [];
  excelecolumn = [];
  excelename = "";

  exceldata = [...nowdata];
  excelename = name;
  nowcolumn.forEach((item) => {
    excelecolumn.push(item.title);
  });

  //匯出excel code    let data = [...props.data];
  if (!exceldata.length) {
    return errorAlert("空資料不能匯出");
  } else {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exceldata);
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.utils.sheet_add_aoa(worksheet, [excelecolumn], { origin: "A1" });
    XLSX.writeFile(workbook, `${excelename}.xlsx`);
  }
};

function disableEndDate(ts) {
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
}

function clearDate() {
  starttimestamp.value = null;
  endtimestamp.value = null;
}

const getdata = async () => {
  const params = {
    station:
      stationAll.value === true
        ? ["all"]
        : selectstationvalue.value.map((item) => parseInt(item.split("-")[0])),
    dataset_id: "data_analysis",
    table_id: "daily_empty_full",
    begin_date: starttimestamp.value,
    end_date: endtimestamp.value,
    city: [city.value],
    status: category.value,
  };
  console.log(params);
  isLoading.value = true;
  const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
  const res = await axios.get(url, { params });

  isLoading.value = false;
  const resdata = res.data.data;
  let arr = [];
  resdata.forEach((element) => {
    let obj = [];
    obj = {
      item1: formatDate(element.date),
      item2: element.responsible_area,
      item3: element.s_no,
      item4: element.s_name,
      item5: element.item,
      item6: element.status,
      item7: element.r0,
      item8: element.r1,
      item9: element.r2,
      item10: element.r3,
      item11: element.r4,
      item12: element.r5,
      item13: element.r6,
      item14: element.r7,
      item15: element.r8,
      item16: element.r9,
      item17: element.r10,
      item18: element.r11,
      item19: element.r12,
      item20: element.r13,
      item21: element.r14,
      item22: element.r15,
      item23: element.r16,
      item24: element.r17,
      item25: element.r18,
      item26: element.r19,
      item27: element.r20,
      item28: element.r21,
      item29: element.r22,
      item30: element.r23,
      item31: element.total,
    };
    arr.push({ ...obj });
  });
  data.value = [...arr];
  makeExecl(data.value, columns.value, "見車率統計日報");
};

const search = async () => {
  if (city.value === "請選擇") {
    return errorAlert("請選擇城市");
  } else if (selectstationvalue.value.length === 0 && !stationAll.value) {
    errorAlert("請選擇場站");
    return;
  } else if (category.value.length === 0) {
    errorAlert("請選擇類型");
    return;
  } else if (starttimestamp.value == null) {
    errorAlert("請選擇結束日期");
    return;
  } else if (endtimestamp.value == null) {
    errorAlert("請選擇結束日期");
    return;
  }
  try {
    await getdata();
  } catch (error) {
    console.log(error);
  }
};

const options = ref([]);
const selectstationvalue = ref([]);
const isloading2 = ref(false);
const stationAll = ref(true);
//把filter好的資料加到場站名稱
function remoteMethod(newX) {
  if (newX.length === 0) {
    options.value = [];
    selectstationvalue.value = [];
    return;
  }

  isloading2.value = true;
  setTimeout(() => {
    //增加城市

    isloading2.value = false;

    const arr = [];
    //把城市有的廠站丟過去
    StationValue.forEach((item) => {
      if (newX.includes(item.city)) {
        arr.push({
          label: item["s_name_tw"],
          value: `${item.s_no}-${item.city}`,
        });
      }
    });

    //檢查以選擇的場站跟城市是否有一致
    const filterData = selectstationvalue.value.filter((item) =>
      newX.includes(item.split("-")[1])
    );
    selectstationvalue.value = [...filterData];

    options.value = [...arr];
  }, 200);
}

//監聽城市
watch(city, (newX) => {
  remoteMethod(newX);
});

async function getStationData() {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "yb2",
      table_id: "station",
    };
    const res = await axios.get(url, { params });
    console.log(res);
    const resdata = res.data.data;

    StationValue = [...resdata];
  } catch (error) {
    console.log(error);
  }
}

(async () => {
  await getStationData();
})();
</script>

<style>
@media (min-width: 767.98px) {
  .w240 {
    width: 240px;
  }
}
</style>
