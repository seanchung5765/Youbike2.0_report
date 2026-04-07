<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">營運管理月報</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder">系統別:</label>
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="category"
            @change="city = '請選擇'"
          >
            <option selected disabled>請選擇</option>
            <option value="1">1.0</option>
            <option value="2">2.0</option>
            <option value="2E">2.0E</option>
          </select>
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder">城市:</label>
        <div class="col-md-auto px-0">
          <select class="form-select form-select-sm" aria-label="car" v-model="city">
            <option selected disabled>請選擇</option>
            <template v-if="category == 2">
              <option value="Taipei2" v-if="canusecitys.includes(2)">台北市</option>
              <option value="Newtaipei2" v-if="canusecitys.includes(3)">新北市</option>
              <option value="Taoyuan2" v-if="canusecitys.includes(4)">桃園市</option>
              <option value="Hsinchu2" v-if="canusecitys.includes(5)">新竹市</option>
              <option value="Hsinchu_Country2" v-if="canusecitys.includes(6)">
                新竹縣
              </option>
              <option value="HsinchuScience2" v-if="canusecitys.includes(20)">
                竹科
              </option>
              <option value="Miaoli2" v-if="canusecitys.includes(7)">苗栗縣</option>
              <option value="Taichung2" v-if="canusecitys.includes(8)">台中市</option>
              <option value="Chiayi2" v-if="canusecitys.includes(12)">嘉義市</option>
              <option value="Chiayi_Country2" v-if="canusecitys.includes(13)">
                嘉義縣
              </option>
              <option value="Tainan2" v-if="canusecitys.includes(14)">台南市</option>
              <option value="Kaohsiung2" v-if="canusecitys.includes(15)">高雄市</option>
              <option value="Pingtung2" v-if="canusecitys.includes(16)">屏東縣</option>
              <option value="Taitung2" v-if="canusecitys.includes(19)">台東縣</option>
            </template>
            <template v-else-if="category == 1">
              <option value="Newtaipei" v-if="canusecitys.includes(3)">新北市</option>
              <option value="Taoyuan" v-if="canusecitys.includes(4)">桃園市</option>
              <option value="Miaoli" v-if="canusecitys.includes(7)">苗栗縣</option>
            </template>
            <template v-else-if="category == '2E'">
              <option value="Taipei2E" v-if="canusecitys.includes(2)">台北市</option>
              <option value="Newtaipei2E" v-if="canusecitys.includes(3)">新北市</option>
              <option value="Taoyuan2E" v-if="canusecitys.includes(4)">桃園市</option>
              <option value="Hsinchu_Country2E" v-if="canusecitys.includes(6)">
                新竹縣
              </option>
              <option value="HsinchuScience2E" v-if="canusecitys.includes(20)">
                竹科
              </option>
              <option value="Miaoli2E" v-if="canusecitys.includes(7)">苗栗縣</option>
              <option value="Taichung2E" v-if="canusecitys.includes(8)">台中市</option>
              <option value="Chiayi2E" v-if="canusecitys.includes(12)">嘉義市</option>
              <option value="Chiayi_Country2E" v-if="canusecitys.includes(13)">
                嘉義縣
              </option>
              <option value="Tainan2E" v-if="canusecitys.includes(14)">台南市</option>
              <option value="Kaohsiung2E" v-if="canusecitys.includes(15)">高雄市</option>
              <option value="Pingtung2E" v-if="canusecitys.includes(16)">屏東縣</option>
              <option value="Taitung2E" v-if="canusecitys.includes(19)">台東縣</option>
            </template>
          </select>
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-2 col-12 mt-3 mt-md-0">
        <n-date-picker
          class="px-0"
          v-model:formatted-value="timestamp"
          type="year"
          :actions="null"
          :input-readonly="true"
          :is-date-disabled="disableDate"
          placeholder="請選擇日期"
          value-format="yyyy"
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
      size="small"
      v-if="dataTable.length"
      ref="table"
      :row-class-name="rowClassName"
      :columns="columns"
      :data="dataTable"
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
import { useUserStore } from "../../stores/userdata";
import { NDataTable, NDatePicker } from "naive-ui";
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

const disableDate = (ts) => {
  const date = new Date(ts);
  const year = date.getFullYear();

  const now = new Date(); // 取得當前時間
  const nowYear = now.getFullYear();

  // 禁用 2020 年之前的日期
  if (year < 2020) {
    return true;
  }

  // 禁用未来日期
  if (year > nowYear) {
    return true;
  }
  return false;
};

const table = ref(null);
const city = ref("請選擇");
const isLoading = ref(false);
const category = ref("請選擇");
const dataTable = ref([]);
const columns = ref([]);
const timestamp = ref();
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

const getDate = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    const params = {
      dataset_id: "report",
      table_id: `monthly_report_query${category.value}`,
      city: city.value,
      date: timestamp.value,
    };
    isLoading.value = true;
    const res = await axios.get(url, { params });
    isLoading.value = false;
    let data = [];
    data = res.data.data;
    if (data.length === 0) {
      columns.value = [];
      dataTable.value = [];
      exceldata = [];
      return;
    }
    //做column start
    let column = [
      {
        key: "item1",
        align: "center",
        fixed: "left",
        width: "200",
        title: data[0].item,
      },
      {
        key: "item2",
        align: "center",
        title: data[0].year1,
      },
    ];
    for (let i = 1; i <= 12; i++) {
      column.push({
        key: `item${i + 2}`,
        align: "center",
        title: data[0][`month${i}`],
      });
    }
    column.push({
      key: "item15",
      align: "center",
      title: data[0]["year2"],
    });
    //做cloumn end

    //做data start
    let arr = [];
    data.forEach((element, index) => {
      if (index === 0) {
        return;
      }
      arr.push({
        item1: element.item,
        item2: element.year1,
        item3: element.month1,
        item4: element.month2,
        item5: element.month3,
        item6: element.month4,
        item7: element.month5,
        item8: element.month6,
        item9: element.month7,
        item10: element.month8,
        item11: element.month9,
        item12: element.month10,
        item13: element.month11,
        item14: element.month12,
        item15: element.year2,
      });
    });
    //做data end
    columns.value = [...column];
    dataTable.value = [...arr];
    makeExecl(dataTable.value, columns.value, "經營管理月報");
  } catch (error) {
    console.log(error);
  }
};

const search = async () => {
  if (category.value == "請選擇") {
    return NotCityAlert("請選擇系統別");
  } else if (city.value === "請選擇") {
    return NotCityAlert("請選擇城市");
  } else if (!timestamp.value) {
    return NotCityAlert("請選擇日期");
  }

  getDate();
};

const rowClassName = (row) => {
  if (
    row.item1 === "場站資訊" ||
    row.item1 === "租借資訊" ||
    row.item1 === "收入資訊" ||
    row.item1 === "妥善率資訊" ||
    row.item1 === "票卡資訊" ||
    (row.item1 === "當月租借車次" &&
      !row.item2 &&
      !row.item3 &&
      !row.item4 &&
      !row.item5 &&
      !row.item6) ||
    row.item1 === "註冊票卡淨增加數" ||
    row.item1 === "租賃收入明細" ||
    row.item1 === "各時段使用資訊" ||
    row.item1 === "營運資訊" ||
    row.item1 === "租賃時間使用資訊" ||
    row.item1 === "維護管理" ||
    row.item1 === "騎乘距離分析" ||
    row.item1 == "保險投保數量"
  ) {
    return "too-old";
  }
};
</script>
<style scoped>
:deep(.too-old td) {
  background-color: rgba(225, 232, 23, 0.75) !important;
}
</style>
