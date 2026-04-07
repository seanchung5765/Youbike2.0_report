<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">無車無位統計</h1>
    </div>

    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >類別:</label
        >
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="itemcategory"
            @change="cleardateall"
          >
            <option selected disabled>請選擇</option>
            <option value="day_empty_full">日報</option>
            <option value="weekly_empty_full">週報</option>
            <option value="monthly_empty_full">月報</option>
          </select>
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >系統別:</label
        >
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="category"
            @change="changecity"
          >
            <option selected disabled>請選擇</option>
            <option value="1.0">1.0</option>
            <option value="2.0">2.0+2.0E</option>
          </select>
        </div>
      </div>
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">城市:</label>
      </div>

      <div class="row mx-0 mx-md-2 align-items-center col-md-2 col-12">
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
      <div class="row col-md-auto col-12 ps-md-0 pe-md-3 mx-auto mx-md-0">
        <button
          type="button"
          class="btn btn-success text-light mt-3 mt-md-0"
          @click="searchcityall"
        >
          城市全選
        </button>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >項目:</label
        >
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="item"
          >
            <option selected disabled>請選擇</option>
            <option value="無車5分鐘">無車5分鐘</option>
            <option value="無車10分鐘">無車10分鐘</option>
            <option value="無車20分鐘">無車20分鐘</option>
            <option value="無車30分鐘">無車30分鐘</option>
            <option value="無位5分鐘">無位5分鐘</option>
            <option value="無位10分鐘">無位10分鐘</option>
            <option value="無位20分鐘">無位20分鐘</option>
            <option value="無位30分鐘">無位30分鐘</option>
          </select>
        </div>
      </div>
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">狀態:</label>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-2 col-12">
        <n-select
          class="px-0"
          v-model:value="status"
          placeholder="請選擇"
          multiple
          :options="statusoptions"
          :max-tag-count="1"
          size="medium"
        />
      </div>

      <template v-if="itemcategory === 'day_empty_full'">
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
            clearable
            :is-date-disabled="disablestartDate1"
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
            :is-date-disabled="disableEndDate1"
            :update-value-on-close="true"
            placeholder="結束日期"
            value-format="yyyy-MM-dd"
            clearable
          />
        </div>
        <button
          type="button"
          class="btn btn-info text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="cleardate"
        >
          清空日期
        </button>
      </template>

      <template v-else-if="itemcategory === 'weekly_empty_full'">
        <div
          class="row px-0 ps-md-4 mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0"
        >
          <n-date-picker
            class="px-0"
            v-model:formatted-value="starttimestamp2"
            type="date"
            :actions="null"
            :input-readonly="true"
            :update-value-on-close="true"
            placeholder="開始日期"
            value-format="yyyy-MM-dd"
            :is-date-disabled="disablestartDate2"
            clearable
          />
        </div>

        <div
          class="row px-0 ps-md-4 mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0"
        >
          <n-date-picker
            class="px-0"
            v-model:formatted-value="endtimestamp2"
            type="date"
            :actions="null"
            :input-readonly="true"
            :is-date-disabled="disableEndDate2"
            :update-value-on-close="true"
            placeholder="結束日期"
            value-format="yyyy-MM-dd"
          />
        </div>
        <button
          type="button"
          class="btn btn-info text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="cleardate2"
        >
          清空日期
        </button>
      </template>
      <template v-else-if="itemcategory === 'monthly_empty_full'">
        <div class="row mx-0 mx-md-2 align-items-center col-md-auto">
          <n-date-picker
            class="px-0"
            :input-readonly="true"
            v-model:formatted-value="starttimestamp3"
            type="month"
            :actions="null"
            update-value-on-close
            placeholder="開始月份"
            :is-date-disabled="disablestartDate3"
            value-format="yyyy-MM"
            :on-update:formatted-value="monthcontrl1"
          />
        </div>
        <div
          class="row px-0 ps-md-4 mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0"
        >
          <div class="row mx-0 mx-md-2 align-items-center col-md-auto">
            <n-date-picker
              class="px-0"
              :input-readonly="true"
              v-model:formatted-value="endtimestamp3"
              type="month"
              :actions="null"
              update-value-on-close
              placeholder="結束月份"
              :is-date-disabled="disableEndDate3"
              value-format="yyyy-MM"
              :on-update:formatted-value="monthcontrl2"
            />
          </div>
        </div>
        <button
          type="button"
          class="btn btn-info text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="cleardate3"
        >
          清空月份
        </button>
      </template>
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
import { ref, inject } from "vue";
import * as XLSX from "xlsx";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDatePicker, NSelect, NResult } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
const swal = inject("$swal");
async function errorAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const ischange = inject("ischange");
const isLoading = ref(false);
const data = ref([]);
const category = ref("請選擇");
const itemcategory = ref("請選擇");
const item = ref("請選擇");
const columns = ref([
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "date",
    width: 100,
  },
  {
    key: "item2",
    align: "center",
    title: "責任區",
    width: 60,
  },
  {
    key: "item3",
    align: "center",
    title: "場站代號",
  },
  {
    key: "item4",
    align: "center",
    title: "站名",
    width: 250,
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

const city = ref([]);
const store = useUserStore();
const canusecitys = store.citys;
const cityoptions = ref([]);

const changecity = () => {
  city.value = [];
  if (category.value === "1.0") {
    cityoptions.value = [
      {
        label: "新北市",
        value: "新北市",
        disabled: !canusecitys.includes(3),
      },
      {
        label: "桃園市",
        value: "桃園市",
        disabled: !canusecitys.includes(4),
      },
      {
        label: "苗栗縣",
        value: "苗栗縣",
        disabled: !canusecitys.includes(7),
      },
    ];
  } else if (category.value === "2.0") {
    cityoptions.value = [
      {
        label: "台北市",
        value: "台北市",
        disabled: !canusecitys.includes(2),
      },
      {
        label: "新北市",
        value: "新北市",
        disabled: !canusecitys.includes(3),
      },
      {
        label: "桃園市",
        value: "桃園市",
        disabled: !canusecitys.includes(4),
      },
      {
        label: "新竹市",
        value: "新竹市",
        disabled: !canusecitys.includes(5),
      },
      {
        label: "新竹縣",
        value: "新竹縣",
        disabled: !canusecitys.includes(6),
      },
      {
        label: "竹科",
        value: "竹科",
        disabled: !canusecitys.includes(20),
      },
      {
        label: "苗栗縣",
        value: "苗栗縣",
        disabled: !canusecitys.includes(7),
      },
      {
        label: "台中市",
        value: "台中市",
        disabled: !canusecitys.includes(8),
      },
      {
        label: "嘉義市",
        value: "嘉義市",
        disabled: !canusecitys.includes(12),
      },
      {
        label: "嘉義縣",
        value: "嘉義縣",
        disabled: !canusecitys.includes(13),
      },
      {
        label: "台南市",
        value: "台南市",
        disabled: !canusecitys.includes(14),
      },
      {
        label: "高雄市",
        value: "高雄市",
        disabled: !canusecitys.includes(15),
      },
      {
        label: "屏東縣",
        value: "屏東縣",
        disabled: !canusecitys.includes(16),
      },
      {
        label: "台東縣",
        value: "台東縣",
        disabled: !canusecitys.includes(19),
      },
    ];
  }
};

const searchcityall = () => {
  let arr = [];
  cityoptions.value.forEach((item) => {
    if (!item.disabled) {
      arr.push(item.value);
    }
  });
  city.value = arr;
};

const cleardateall = () => {
  cleardate();
  cleardate2();
  cleardate3();
};

const starttimestamp = ref();
const endtimestamp = ref();
const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};
const disablestartDate1 = (ts) => {
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
const disableEndDate1 = (ts) => {
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

const starttimestamp2 = ref(null);
const endtimestamp2 = ref(null);
const cleardate2 = () => {
  endtimestamp2.value = null;
  starttimestamp2.value = null;
};
const disablestartDate2 = (ts) => {
  const date = new Date(ts);
  const now = new Date(); // 取得当前时间
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 将时间重设为今天的凌晨，以去掉时、分、秒和毫秒
  const startOfWeek = new Date(today); // 复制今天的日期
  startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1); // 设置禮拜一的日期
  const dayOfWeek = date.getDay(); // 取得星期几，星期日为0，星期一为1，以此类推

  // 禁用禮拜一之后的日期
  if (date >= startOfWeek) {
    return true;
  }

  // 禁用非禮拜一的日期
  if (dayOfWeek !== 1) {
    return true;
  }

  const year = date.getFullYear();

  // 禁用2023年以前的日期
  if (year < 2023) {
    return true;
  }

  // 获取 endtimestamp2.value 前的 28 天日期
  const endDate = new Date(endtimestamp2.value);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 27);

  // 禁用超过 endtimestamp2.value 前 28 天的日期
  if (date < startDate) {
    return true;
  }
  // 禁用超过 endtimestamp2.value 的日期
  if (endtimestamp2.value && date >= endDate) {
    return true;
  }

  return false;
};

const disableEndDate2 = (ts) => {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  const now = new Date(); // 取得当前时间
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 将时间重设为今天的凌晨，以去掉时、分、秒和毫秒
  const startOfWeek = new Date(today); // 复制今天的日期
  startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1); // 设置礼拜一的日期
  const dayOfWeek = date.getDay(); // 取得星期几，星期日为 0，星期一为 1，以此类推
  // if(!starttimestamp2.value){
  //     return true
  // }
  // 禁用礼拜一之后的日期
  if (date >= startOfWeek) {
    return true;
  }

  // 禁用非礼拜一的日期
  if (dayOfWeek !== 1) {
    return true;
  }

  const year = date.getFullYear();

  // 禁用 2023 年以前的日期
  if (year < 2023) {
    return true;
  }

  // 获取 starttimestamp2.value 后的 27 天日期
  const startDate = new Date(starttimestamp2.value);
  startDate.setHours(0, 0, 0, 0); // 设置小时、分钟、秒和毫秒为零
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 27);
  // 禁用超过 28 天后的日期
  if (starttimestamp2.value && date > endDate) {
    return true;
  }
  if (date.getTime() < startDate.getTime()) {
    return true;
  }

  return false;
};

const starttimestamp3 = ref();
const endtimestamp3 = ref();
const cleardate3 = () => {
  endtimestamp3.value = null;
  starttimestamp3.value = null;
};

const disablestartDate3 = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const now = new Date(); // 获取当前时间
  const nowyear = now.getFullYear();
  const nowmonth = now.getMonth() + 1;

  const endValue = endtimestamp3.value;

  // 如果结束值不为 null，则获取结束日期的年份和月份
  let endYear, endMonth;
  if (endValue !== null) {
    const endDate = new Date(endValue);
    endYear = endDate.getFullYear();
    endMonth = endDate.getMonth() + 1;
  }

  // 计算选择日期和结束日期之间的月份差
  const monthDiff = (endYear - year) * 12 + (endMonth - month);

  // 禁用2023年6月之前的日期和当前月份之后的日期，
  // 以及选择的日期晚于结束日期或与结束日期相差12个月以上
  if (
    year < 2023 ||
    year > nowyear ||
    (year === nowyear && month >= nowmonth) ||
    (endYear !== undefined &&
      (year > endYear || (year === endYear && month > endMonth))) ||
    monthDiff >= 12
  ) {
    return true;
  }

  return false;
};

const disableEndDate3 = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const now = new Date(); // 获取当前时间
  const nowyear = now.getFullYear();
  const nowmonth = now.getMonth() + 1;

  const startValue = starttimestamp3.value;

  // 如果起始值不为 null，则获取起始日期的年份和月份
  let startYear, startMonth;
  if (startValue !== null) {
    const startDate = new Date(startValue);
    startYear = startDate.getFullYear();
    startMonth = startDate.getMonth() + 1;
  }

  // 计算选择日期和起始日期之间的月份差
  const monthDiff = (year - startYear) * 12 + (month - startMonth);

  // 禁用2023年6月之前的日期和当前月份之后的日期
  // 以及选择的日期早于起始日期或与起始日期相差12个月以上
  if (
    year < 2023 ||
    year > nowyear ||
    (year === nowyear && month >= nowmonth) ||
    (startYear !== undefined &&
      (year < startYear || (year === startYear && month < startMonth))) ||
    monthDiff >= 12
  ) {
    return true;
  }

  return false;
};

const monthcontrl1 = (value) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 注意：getMonth() 返回的月份范围是 0 到 11
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDate = `${year}-${formattedMonth}`;
  if (formattedDate !== value) {
    starttimestamp3.value = value;
  }
};

const monthcontrl2 = (value) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 注意：getMonth() 返回的月份范围是 0 到 11
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDate = `${year}-${formattedMonth}`;
  if (formattedDate !== value) {
    endtimestamp3.value = value;
  }
};

function formatDate(dateString) {
  var date = new Date(dateString);
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  var formattedDateString = year + "-" + month + "-" + day;
  return formattedDateString;
}

const getData = async () => {
  try {
    let catestart = null;
    let cateend = null;
    if (itemcategory.value === "day_empty_full") {
      catestart = starttimestamp.value;
      cateend = endtimestamp.value;
    } else if (itemcategory.value === "weekly_empty_full") {
      catestart = starttimestamp2.value;
      cateend = endtimestamp2.value;
    } else if (itemcategory.value === "monthly_empty_full") {
      catestart = `${starttimestamp3.value}-01`;
      cateend = `${endtimestamp3.value}-01`;
    }
    isLoading.value = true;
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "data_analysis",
      table_id: itemcategory.value,
      begin_date: catestart,
      end_date: cateend,
      city: city.value,
      item: item.value,
      status: status.value,
      sys: category.value,
    };
    const res = await axios.get(url, { params });
    const resdata = res.data.data;
    console.log(resdata);
    let arr = [];
    resdata.forEach((element) => {
      let obj = [];
      obj = {
        item1: formatDate(element.date),
        item2: element.responsible_area,
        item3: element.s_no,
        item4: element.s_name,
        item5: element.status,
        item6: element.item,
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
    makeExecl(data.value, columns.value, `無車無位統計`);
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};
const status = ref([]);
const statusoptions = [
  {
    label: "分鐘",
    value: "分鐘",
  },
  {
    label: "次數",
    value: "次數",
  },
];

const search = () => {
  if (itemcategory.value === "請選擇") {
    return errorAlert("請選擇類別");
  } else if (category.value === "請選擇") {
    return errorAlert("請選擇系統別");
  } else if (city.value.length === 0) {
    return errorAlert("請選擇城市");
  } else if (item.value === "請選擇") {
    return errorAlert("請選擇項目");
  } else if (status.value.length === 0) {
    return errorAlert("請選擇狀態");
  } else if (itemcategory.value === "day_empty_full") {
    if (!starttimestamp.value) {
      return errorAlert("請選擇開始日期");
    } else if (!endtimestamp.value) {
      return errorAlert("請選擇結束日期");
    }
  } else if (itemcategory.value === "weekly_empty_full") {
    if (!starttimestamp2.value) {
      return errorAlert("請選擇開始日期");
    } else if (!endtimestamp2.value) {
      return errorAlert("請選擇結束日期");
    }
  } else if (itemcategory.value === "monthly_empty_full") {
    if (!starttimestamp3.value) {
      return errorAlert("請選擇開始日期");
    } else if (!endtimestamp3.value) {
      return errorAlert("請選擇結束日期");
    }
  }
  getData();
};
</script>

<style></style>
