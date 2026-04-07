<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">每小時明細表</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >系統別:</label
        >
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
            <template v-if="category == 2">
              <option value="TP" v-if="canusecitys.includes(2)">台北市</option>
              <option value="NTP2" v-if="canusecitys.includes(3)">
                新北市
              </option>
              <option value="Taoyuan_two" v-if="canusecitys.includes(4)">
                桃園市
              </option>
              <option value="Hsinchu2" v-if="canusecitys.includes(5)">
                新竹市
              </option>
              <option value="Hsinchu_Country" v-if="canusecitys.includes(6)">
                新竹縣
              </option>
              <option value="Miaoli_two" v-if="canusecitys.includes(7)">
                苗栗縣
              </option>
              <option value="Taichung2" v-if="canusecitys.includes(8)">
                台中市
              </option>
              <option value="Chiayi" v-if="canusecitys.includes(12)">
                嘉義市
              </option>
              <option value="Tainan" v-if="canusecitys.includes(14)">
                台南市
              </option>
              <option value="Kaohsiung" v-if="canusecitys.includes(15)">
                高雄市
              </option>
              <option value="Pingtung" v-if="canusecitys.includes(16)">
                屏東縣
              </option>
            </template>
            <template v-else-if="category == 1">
              <option value="NTP" v-if="canusecitys.includes(3)">新北市</option>
              <option value="Taoyuan" v-if="canusecitys.includes(4)">
                桃園縣
              </option>
              <option value="Miaoli" v-if="canusecitys.includes(7)">
                苗栗縣
              </option>
              <option value="Taichung" v-if="canusecitys.includes(8)">
                台中市
              </option>
            </template>
          </select>
        </div>
        <div
          class="row px-0 ps-md-4 mx-0 mx-md-2 align-items-center col-md-auto mt-3 mt-md-0"
        >
          <n-date-picker
            class="px-0"
            v-model:formatted-value="timestamp"
            type="date"
            :actions="null"
            :input-readonly="true"
            :update-value-on-close="true"
            placeholder="請選擇日期"
            value-format="yyyy-MM-dd"
            :is-date-disabled="disableStartDate"
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
      ref="dataTable"
      size="small"
      v-if="totaldata.length > 1"
      :pagination="{ pageSize: 17 }"
      :columns="columns"
      :data="totaldata"
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
import { NDataTable, NDatePicker } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";
const store = useUserStore();
const canusecitys = store.citys;
const ischange = inject("ischange");
const swal = inject("$swal");
async function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const dataTable = ref(null);
const city = ref("請選擇");
const category = ref("請選擇");
const isLoading = ref(false);
const totaldata = ref([]);
const timestamp = ref();

const disableStartDate = (ts) => {
  const date = new Date(ts);
  const now = new Date(); // 获取当前时间
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 将时间重设为今天的凌晨，以去掉时、分、秒和毫秒

  // 禁用2023年8月8日之前的日期和未来的日期
  if (date < new Date(2023, 7, 8) || date >= today) {
    return true;
  }

  return false;
};

const columns = ref([]);
const TPcol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "台北2.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "台北2.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "台北2.0接通數",
  },
  {
    key: "item5",
    align: "center",
    title: "1999進線數",
  },
  {
    key: "item6",
    align: "center",
    title: "1999掛斷數",
  },
  {
    key: "item7",
    align: "center",
    title: "1999接通數",
  },
  {
    key: "item8",
    align: "center",
    title: "5511進線數",
  },
  {
    key: "item9",
    align: "center",
    title: "5511掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: "5511接通數",
  },
];
const NTPcol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "新北2.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "新北2.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "新北2.0接通數",
  },
];
const NTP2col = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "新北1.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "新北1.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "新北1.0接通數",
  },
];
const Taoyuancol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "桃園1.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "桃園1.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "桃園1.0接通數",
  },
];

const Taoyuan_twocol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "桃園2.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "桃園2.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "桃園2.0接通數",
  },
];
const Hsinchu2col = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "新竹2.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "新竹2.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "新竹2.0接通數",
  },
];
const Hsinchu_Countrycol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "竹縣2.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "竹縣2.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "竹縣2.0接通數",
  },
];
const Miaolicol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "苗栗1.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "苗栗1.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "苗栗1.0接通數",
  },
];
const Miaoli_twocol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "苗栗2.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "苗栗2.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "苗栗2.0接通數",
  },
];
const Chiayicol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "嘉義進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "嘉義掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "嘉義接通數",
  },
];
const Taichungcol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "台中1.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "台中1.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "台中1.0接通數",
  },
];
const Taichung2col = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "台中2.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "台中2.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "台中2.0接通數",
  },
];
const Tainancol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "台南2.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "台南2.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "台南2.0接通數",
  },
];
const Kaohsiungcol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "高雄2.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "高雄2.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "高雄2.0接通數",
  },
  {
    key: "item5",
    align: "center",
    title: "0800進線數",
  },
  {
    key: "item6",
    align: "center",
    title: "0800掛斷數",
  },
  {
    key: "item7",
    align: "center",
    title: "0800接通數",
  },
];
const Pingtungcol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "日期/時段",
  },
  {
    key: "item2",
    align: "center",
    title: "屏東2.0進線數",
  },
  {
    key: "item3",
    align: "center",
    title: "屏東2.0掛斷數",
  },
  {
    key: "item4",
    align: "center",
    title: "屏東2.0接通數",
  },
];

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

const changecity = () => {
  if (city.value === "TP") {
    columns.value = [...TPcol];
  } else if (city.value === "NTP2") {
    columns.value = [...NTP2col];
  } else if (city.value === "NTP") {
    columns.value = [...NTPcol];
  } else if (city.value === "Taoyuan") {
    columns.value = [...Taoyuancol];
  } else if (city.value === "Taoyuan_two") {
    columns.value = [...Taoyuan_twocol];
  } else if (city.value === "Hsinchu2") {
    columns.value = [...Hsinchu2col];
  } else if (city.value === "Hsinchu_Country") {
    columns.value = [...Hsinchu_Countrycol];
  } else if (city.value === "Miaoli") {
    columns.value = [...Miaolicol];
  } else if (city.value === "Chiayi") {
    columns.value = [...Chiayicol];
  } else if (city.value === "Taichung2") {
    columns.value = [...Taichung2col];
  } else if (city.value === "Taichung") {
    columns.value = [...Taichungcol];
  } else if (city.value === "Kaohsiung") {
    columns.value = [...Kaohsiungcol];
  } else if (city.value === "Tainan") {
    columns.value = [...Tainancol];
  } else if (city.value === "Pingtung") {
    columns.value = [...Pingtungcol];
  } else if (city.value === "Miaoli_two") {
    columns.value = [...Miaoli_twocol];
  }
};

const getdata = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    let params = {
      dataset_id: "report",
      table_id: "CTI_inline_detail",
      date: timestamp.value,
      city: city.value,
      sys: category.value,
    };
    isLoading.value = true;
    const res = await axios.get(url, { params });
    const resdata = res.data.data;
    const arr = [];
    resdata.forEach((element) => {
      if (city.value === "TP") {
        arr.push({
          item1: element.time_range,
          item2: element.total_two,
          item3: element.hangup_two,
          item4: element.answer_two,
          item5: element.total_1999,
          item6: element.hangup_1999,
          item7: element.answer_1999,
          item8: element.total_5511,
          item9: element.hangup_5511,
          item10: element.answer_5511,
        });
      } else if (city.value === "Kaohsiung") {
        arr.push({
          item1: element.time_range,
          item2: element.total_two,
          item3: element.hangup_two,
          item4: element.answer_two,
          item5: element.total_0800,
          item6: element.hangup_0800,
          item7: element.answer_0800,
        });
      } else {
        arr.push({
          item1: element.time_range,
          item2: element.total,
          item3: element.hangup,
          item4: element.answer,
        });
      }
    });
    totaldata.value = [...arr];
    makeExecl(totaldata.value, columns.value, "每小時明細表");
    if (dataTable.value) {
      dataTable.value.page(1);
    }
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const search = async () => {
  if (category.value === "請選擇") {
    return NotCityAlert("請選擇系統別");
  } else if (city.value === "請選擇") {
    return NotCityAlert("請選擇城市");
  } else if (!timestamp.value) {
    return NotCityAlert("請選擇日期");
  }
  changecity();

  await getdata();
};
</script>

<style scoped></style>
