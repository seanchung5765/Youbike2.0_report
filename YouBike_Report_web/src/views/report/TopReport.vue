<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">TOP50 排名週報</h1>
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
      <div class="row col-md-auto col-12 ps-md-0 pe-md-3 mx-auto mx-md-0">
        <button
          type="button"
          class="btn btn-success text-light mt-3 mt-md-0"
          @click="setallcity"
        >
          城市全選
        </button>
      </div>
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">借/還:</label>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-2 col-12 mb-3 mb-md-0">
        <n-select
          class="px-0"
          v-model:value="sendvalue"
          placeholder="請選擇"
          multiple
          :options="sendoptions"
          :max-tag-count="1"
          size="medium"
        />
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-2 col-12">
        <n-date-picker
          class="px-0"
          v-model:formatted-value="timestamp"
          type="date"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="請選每週一日期"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disablestartDate"
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
      :scroll-x="700"
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
import { NDataTable, NSelect, NDatePicker } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";
const store = useUserStore();
const canusecitys = store.citys;
const isLoading = ref(false);
const ischange = inject("ischange");
const dataTable = ref(null);
const timestamp = ref();
const swal = inject("$swal");
async function errorAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const columns = ref([
  {
    key: "item1",
    align: "center",
    title: "借/還",
  },
  {
    key: "item2",
    align: "center",
    title: "城市",
  },
  {
    key: "item3",
    align: "center",
    title: "場站名稱",
    width: 300,
  },
  {
    key: "item4",
    align: "center",
    title: "開站時間",
  },
  {
    key: "item5",
    align: "center",
    title: "本週次數",
  },
  {
    key: "item6",
    align: "center",
    title: "本週排名",
  },
  {
    key: "item7",
    align: "center",
    title: "上週次數",
  },
  {
    key: "item8",
    align: "center",
    title: "上週排名",
  },
  {
    key: "item9",
    align: "center",
    title: "與上週比較次數成長率",
  },
]);
const data = ref([]);
const cityvalue = ref([]);
let options = [
{
    label: "台北市2.0",
    value: "Taipei2",
    disabled: !canusecitys.includes(2),
  },
  {
    label: "台北市2.0E",
    value: "Taipei2E",
    disabled: !canusecitys.includes(2),
  },
/*
  {
    label: "新北市1.0",
    value: "Newtaipei",
    disabled: !canusecitys.includes(3),
  },
*/
{
    label: "新北市2.0",
    value: "Newtaipei2",
    disabled: !canusecitys.includes(3),
  },
  {
    label: "新北市2.0E",
    value: "Newtaipei2E",
    disabled: !canusecitys.includes(3),
  },
/*
  {
    label: "桃園市1.0",
    value: "Taoyuan",
    disabled: !canusecitys.includes(4),
  },
*/
  {
    label: "桃園市2.0",
    value: "Taoyuan2",
    disabled: !canusecitys.includes(4),
  },
  {
    label: "桃園市2.0E",
    value: "Taoyuan2E",
    disabled: !canusecitys.includes(4),
  },
  {
    label: "新竹市2.0",
    value: "Hsinchu2",
    disabled: !canusecitys.includes(5),
  },
  {
    label: "新竹市2.0E",
    value: "Hsinchu2E",
    disabled: !canusecitys.includes(5),
  },
  {
    label: "新竹縣2.0",
    value: "Hsinchu_Country2",
    disabled: !canusecitys.includes(6),
  },
  {
    label: "新竹縣2.0E",
    value: "Hsinchu_Country2E",
    disabled: !canusecitys.includes(6),
  },
  {
    label: "竹科2.0",
    value: "HsinchuScience2",
    disabled: !canusecitys.includes(20),
  },
  {
    label: "竹科2.0E",
    value: "HsinchuScience2E",
    disabled: !canusecitys.includes(20),
  },
/*
  {
    label: "苗栗縣1.0",
    value: "Miaoli",
    disabled: !canusecitys.includes(7),
  },
*/
  {
    label: "苗栗縣2.0",
    value: "Miaoli2",
    disabled: !canusecitys.includes(7),
  },
  {
    label: "苗栗縣2.0E",
    value: "Miaoli2E",
    disabled: !canusecitys.includes(7),
  },
/*
  {
    label: "台中市1.0",
    value: "Taichung",
    disabled: !canusecitys.includes(8),
  },
*/
  {
    label: "台中市2.0",
    value: "Taichung2",
    disabled: !canusecitys.includes(8),
  },
  {
    label: "台中市2.0E",
    value: "Taichung2E",
    disabled: !canusecitys.includes(8),
  },
  {
    label: "嘉義市2.0",
    value: "Chiayi2",
    disabled: !canusecitys.includes(12),
  },
  {
    label: "嘉義市2.0E",
    value: "Chiayi2E",
    disabled: !canusecitys.includes(12),
  },
  {
    label: "嘉義縣2.0",
    value: "Chiayi_Country2",
    disabled: !canusecitys.includes(13),
  },
  {
    label: "嘉義縣2.0E",
    value: "Chiayi_Country2E",
    disabled: !canusecitys.includes(13),
  },
  {
    label: "台南市2.0",
    value: "Tainan2",
    disabled: !canusecitys.includes(14),
  },
  {
    label: "台南市2.0E",
    value: "Tainan2E",
    disabled: !canusecitys.includes(14),
  },
  {
    label: "高雄市2.0",
    value: "Kaohsiung2",
    disabled: !canusecitys.includes(15),
  },
  {
    label: "高雄市2.0E",
    value: "Kaohsiung2E",
    disabled: !canusecitys.includes(15),
  },
  {
    label: "屏東縣2.0",
    value: "Pingtung2",
    disabled: !canusecitys.includes(16),
  },
  {
    label: "屏東縣2.0E",
    value: "Pingtung2E",
    disabled: !canusecitys.includes(16),
  },
  {
    label: "台東縣2.0",
    value: "Taitung2",
    disabled: !canusecitys.includes(19),
  },
  {
    label: "台東縣2.0E",
    value: "Taitung2E",
    disabled: !canusecitys.includes(19),
  },
];

const disablestartDate = (ts) => {
  const date = new Date(ts);
  const now = new Date(); // 取得当前时间
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 将时间重设为今天的凌晨，以去掉时、分、秒和毫秒
  const startOfWeek = new Date(today); // 复制今天的日期
  startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1); // 设置禮拜一的日期
  const dayOfWeek = date.getDay(); // 取得星期几，星期日为0，星期一为1，以此类推
  // 禁用禮拜一之後的日期
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

  return false;
};

(function start() {
  let arr = [];
  options.forEach((item) => {
    if (item.disabled) {
      return;
    } else {
      arr.push(item);
    }
  });
  options = [...arr];
})();

const sendvalue = ref([]);
const sendoptions = [
  {
    label: "借",
    value: "rent",
  },
  {
    label: "還",
    value: "return",
  },
];

const setallcity = () => {
  let arr = [];
  options.forEach((item) => {
    arr.push(item.value);
  });
  cityvalue.value = arr;
};

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
};

const getdata = async () => {
  const params = {
    dataset_id: "report",
    table_id: "weekly_rank",
    item: sendvalue.value,
    city: cityvalue.value,
    date: timestamp.value,
  };
  isLoading.value = true;
  const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
  const res = await axios.get(url, { params });

  const reslist = res.data.data;
  const arr = [];
  reslist.forEach((element) => {
    arr.push({
      item1: element.item_ch,
      item2: element.city_ch,
      item3: element.station_name,
      item4: element.start_time,
      item5: element.times_this_week,
      item6: element.rank_this_week,
      item7: element.times_last_week,
      item8: element.rank_last_week,
      item9: element.growth_rate,
    });
  });
  if (dataTable.value.page) {
    dataTable.value.page(1);
  }
  data.value = [...arr];
  makeExecl(data.value, columns.value, "Top50 排名週報");
  isLoading.value = false;
};

const search = async () => {
  if (sendvalue.value.length == 0) {
    return errorAlert("請選擇借/還");
  } else if (cityvalue.value.length == 0) {
    return errorAlert("請選擇城市");
  } else if (!timestamp.value) {
    return errorAlert("請選擇日期");
  }
  await getdata();
};
</script>

<style></style>
