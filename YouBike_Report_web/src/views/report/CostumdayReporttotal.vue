<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">話務統計表</h1>
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
              <option value="Hsinchu_two" v-if="canusecitys.includes(5)">
                新竹市
              </option>
              <option value="HsinchuCountry" v-if="canusecitys.includes(6)">
                新竹縣
              </option>
              <option value="Miaoli_two" v-if="canusecitys.includes(7)">
                苗栗縣
              </option>
              <option value="Taichung_two" v-if="canusecitys.includes(8)">
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
              <option value="Taichung_one" v-if="canusecitys.includes(8)">
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
const columns = ref([]);
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

let cityarr = [];
const TPcol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "台北2.0進線數",
  },
  {
    key: "item5",
    align: "center",
    title: "5511專線",
  },
  {
    key: "item6",
    align: "center",
    title: "1999專線",
  },
  {
    key: "item7",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item8",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item9",
    align: "center",
    title: "台北2.0進線數",
  },
  {
    key: "item10",
    align: "center",
    title: "5511專線",
  },
  {
    key: "item11",
    align: "center",
    title: "1999專線",
  },
  {
    key: "item12",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item13",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item14",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item15",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item16",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item17",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item18",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item19",
    align: "center",
    title: "平均通話時間",
  },
];
const TP = [
  "time_range",
  "total",
  "total_percentage",
  "TP_two_total",
  "TP_5511_total",
  "TP_1999_total",
  "answer",
  "answer_percentage",
  "TP_two_answer",
  "TP_5511_answer",
  "TP_1999_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const NTP2col = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "新北2.0",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "新北2.0",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];

const NTP2 = [
  "time_range",
  "total",
  "total_percentage",
  "NTP_two_total",
  "answer",
  "answer_percentage",
  "NTP_two_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const NTPcol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "YB新北",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "YB新北",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];

const NTP = [
  "time_range",
  "total",
  "total_percentage",
  "NTP_one_total",
  "answer",
  "answer_percentage",
  "NTP_one_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const Taoyuan = [
  "time_range",
  "total",
  "total_percentage",
  "Taoyuan_one_total",
  "answer",
  "answer_percentage",
  "Taoyuan_one_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const Taoyuan_two = [
  "time_range",
  "total",
  "total_percentage",
  "Taoyuan_two_total",
  "answer",
  "answer_percentage",
  "Taoyuan_two_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];
const Taoyuan_twocol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "桃園2.0",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "桃園2.0",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];
const Taoyuancol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "桃園1.0",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "桃園1.0",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];

const Hsinchu_two = [
  "time_range",
  "total",
  "total_percentage",
  "Hsinchu_two_total",
  "answer",
  "answer_percentage",
  "Hsinchu_two_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const Hsinchu_twocol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "新竹2.0",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "新竹2.0",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];

const HsinchuCountry = [
  "time_range",
  "total",
  "total_percentage",
  "HsinchuCountry_two_total",
  "answer",
  "answer_percentage",
  "HsinchuCountry_two_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const HsinchuCountrycol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "竹縣2.0",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "竹縣2.0",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];

const Miaoli = [
  "time_range",
  "total",
  "total_percentage",
  "Miaoli_one_total",
  "answer",
  "answer_percentage",
  "Miaoli_one_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const Miaolicol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "苗栗1.0",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "苗栗1.0",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];

const Chiayi = [
  "time_range",
  "total",
  "total_percentage",
  "Chiayi_total",
  "answer",
  "answer_percentage",
  "Chiayi_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const Chiayicol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "嘉義2.0",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "嘉義2.0",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];

const Taichung_two = [
  "time_range",
  "total",
  "total_percentage",
  "Taichung_two_total",
  "answer",
  "answer_percentage",
  "Taichung_two_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const Taichung_twocol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "台中2.0",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "台中2.0",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];

const Taichung_one = [
  "time_range",
  "total",
  "total_percentage",
  "Taichung_one_total",
  "answer",
  "answer_percentage",
  "Taichung_one_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];
const Taichung_onecol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "台中1.0",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "台中1.0",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];

const Tainan = [
  "time_range",
  "total",
  "total_percentage",
  "Tainan_total",
  "answer",
  "answer_percentage",
  "Tainan_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const Tainancol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "台南2.0",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "台南2.0",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];

const Kaohsiung = [
  "time_range",
  "total",
  "total_percentage",
  "Kaohsiung_two_total",
  "Kaohsiung_0800_total",
  "answer",
  "answer_percentage",
  "Kaohsiung_two_answer",
  "Kaohsiung_0800_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const Kaohsiungcol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "高雄2.0進電數",
  },
  {
    key: "item5",
    align: "center",
    title: "0800專線",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item7",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item8",
    align: "center",
    title: "高雄2.0進線數",
  },
  {
    key: "item9",
    align: "center",
    title: "0800專線",
  },
  {
    key: "item10",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item11",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item13",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item14",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item15",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item16",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item17",
    align: "center",
    title: "平均通話時間",
  },
];

const Pingtung = [
  "time_range",
  "total",
  "total_percentage",
  "Pingtung_total",
  "answer",
  "answer_percentage",
  "Pingtung_answer",
  "avg_person_counts",
  "hangup",
  "hangup_gt_six",
  "hangup_le_six",
  "hangup_gt_six_percentage",
  "ride_times",
  "before_avg_duration",
  "avg_duration",
];

const Pingtungcol = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "時刻",
  },
  {
    key: "item2",
    align: "center",
    title: "進電數",
  },
  {
    key: "item3",
    align: "center",
    title: "進電比例",
  },
  {
    key: "item4",
    align: "center",
    title: "屏東2.0",
  },
  {
    key: "item5",
    align: "center",
    title: "接聽數",
  },
  {
    key: "item6",
    align: "center",
    title: "接聽比例",
  },
  {
    key: "item7",
    align: "center",
    title: "屏東2.0",
  },
  {
    key: "item8",
    align: "center",
    title: "平均每人接聽通數",
  },
  {
    key: "item9",
    align: "center",
    title: "掛斷數",
  },
  {
    key: "item10",
    align: "center",
    title: ">6掛斷數",
  },
  {
    key: "item11",
    align: "center",
    title: "<=6掛斷數",
  },
  {
    key: "item12",
    align: "center",
    title: ">6掛斷率",
  },
  {
    key: "item13",
    align: "center",
    title: "使用次數",
  },
  {
    key: "item14",
    align: "center",
    title: "接聽前平均等待時間",
  },
  {
    key: "item15",
    align: "center",
    title: "平均通話時間",
  },
];

const changecity = () => {
  if (city.value === "TP") {
    cityarr = [...TP];
    columns.value = [...TPcol];
  } else if (city.value === "NTP2") {
    cityarr = [...NTP2];
    columns.value = [...NTP2col];
  } else if (city.value === "NTP") {
    cityarr = [...NTP];
    columns.value = [...NTPcol];
  } else if (city.value === "Taoyuan") {
    cityarr = [...Taoyuan];
    columns.value = [...Taoyuancol];
  } else if (city.value === "Taoyuan_two") {
    cityarr = [...Taoyuan_two];
    columns.value = [...Taoyuan_twocol];
  } else if (city.value === "Hsinchu_two") {
    cityarr = [...Hsinchu_two];
    columns.value = [...Hsinchu_twocol];
  } else if (city.value === "HsinchuCountry") {
    cityarr = [...HsinchuCountry];
    columns.value = [...HsinchuCountrycol];
  } else if (city.value === "Miaoli" || city.value === "Miaoli_two") {
    cityarr = [...Miaoli];
    columns.value = [...Miaolicol];
  } else if (city.value === "Chiayi") {
    cityarr = [...Chiayi];
    columns.value = [...Chiayicol];
  } else if (city.value === "Taichung_two") {
    cityarr = [...Taichung_two];
    columns.value = [...Taichung_twocol];
  } else if (city.value === "Taichung_one") {
    cityarr = [...Taichung_one];
    columns.value = [...Taichung_onecol];
  } else if (city.value === "Kaohsiung") {
    cityarr = [...Kaohsiung];
    columns.value = [...Kaohsiungcol];
  } else if (city.value === "Tainan") {
    cityarr = [...Tainan];
    columns.value = [...Tainancol];
  } else if (city.value === "Pingtung") {
    cityarr = [...Pingtung];
    columns.value = [...Pingtungcol];
  }
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

const getdata = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    let params = {
      dataset_id: "report",
      table_id: "CTI_final_table",
      date: timestamp.value,
      city: city.value,
      sys: category.value,
    };
    isLoading.value = true;
    console.log(params);
    const res = await axios.get(url, { params });
    console.log(res);
    isLoading.value = false;
    let arr = [];
    const resdata = res.data.data;
    resdata.forEach((element) => {
      let obj = {};
      cityarr.forEach((item, index) => {
        if (
          item === "total_percentage" ||
          item === "answer_percentage" ||
          item === "hangup_gt_six_percentage"
        ) {
          obj[`item${index + 1}`] =
            element[item] === 0 || element[item] === null
              ? 0
              : (element[item] * 100).toFixed(2) + "%";
        } else if (item === "avg_person_counts") {
          obj[`item${index + 1}`] = element[item] === null ? 0 : element[item];
        } else {
          obj[`item${index + 1}`] = element[item];
        }
      });
      arr.push(obj);
    });
    totaldata.value = [...arr];
    makeExecl(totaldata.value, columns.value, "話務統計表");
    if (dataTable.value.page) {
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
