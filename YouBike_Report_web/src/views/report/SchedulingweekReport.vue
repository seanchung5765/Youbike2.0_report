<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">調度週報</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >表別:</label
        >
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="type"
          >
            <option selected disabled>請選擇</option>
            <option value="調度週報">調度週報</option>
            <option value="調度排名週報">調度排名週報</option>
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
            @change="city = '請選擇'"
          >
            <option selected disabled>請選擇</option>
            <option value="1">1.0</option>
            <option value="2">2.0+2.0E</option>
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
            <template v-if="category == 1">
              <option value="Newtaipei" v-if="canusecitys.includes(3)">
                新北市
              </option>
              <option value="Taoyuan" v-if="canusecitys.includes(4)">
                桃園市
              </option>
              <option value="Miaoli" v-if="canusecitys.includes(7)">
                苗栗縣
              </option>
            </template>
            <template v-else-if="category == '2'">
              <option value="TaipeiNewtaipei2" v-if="canusecitys.includes(2) && canusecitys.includes(3)">雙北</option>
              <option value="Taipei2" v-if="canusecitys.includes(2)">台北市</option>
              <option value="Newtaipei2" v-if="canusecitys.includes(3)">新北市</option>
              <option value="Taoyuan2" v-if="canusecitys.includes(4)">桃園市</option>
              <option value="Hsinchu2" v-if="canusecitys.includes(5)">新竹市</option>
              <option value="Hsinchu_Country2" v-if="canusecitys.includes(6)">新竹縣</option>
              <option value="HsinchuScience2" v-if="canusecitys.includes(20)">竹科</option>
              <option value="Miaoli2" v-if="canusecitys.includes(7)">苗栗縣</option>
              <option value="Taichung2" v-if="canusecitys.includes(8)">台中市</option>
              <option value="Chiayi2" v-if="canusecitys.includes(12)">嘉義市</option>
              <option value="Chiayi_Country2" v-if="canusecitys.includes(13)">嘉義縣</option>
              <option value="Tainan2" v-if="canusecitys.includes(14)">台南市</option>
              <option value="Kaohsiung2" v-if="canusecitys.includes(15)">高雄市</option>
              <option value="Pingtung2" v-if="canusecitys.includes(16)">屏東縣</option>
              <option value="Taitung2" v-if="canusecitys.includes(19)">台東縣</option>
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
            :is-date-disabled="
              type === '調度週報' ? disablestartDate : disablestartDate2
            "
            :update-value-on-close="true"
            placeholder="請選擇日期"
            value-format="yyyy-MM-dd"
          />
        </div>
      </div>
      <div
        class="row mx-0 mx-md-2 align-items-center col-md-auto col-12"
        v-show="type === '調度排名週報'"
      >
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
            <option value="無位可還5分鐘以上次數">無位可還5分鐘以上次數</option>
            <option value="無位可還10分鐘以上次數">
              無位可還10分鐘以上次數
            </option>
            <option value="無車可借10分鐘以上次數">
              無車可借10分鐘以上次數
            </option>
            <option value="無車綁車10分鐘以上次數">
              無車綁車10分鐘以上次數
            </option>
          </select>
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
      v-show="datatable.length > 1"
      size="small"
      :data="datatable"
      :row-class-name="rowClassName"
      :pagination="pageSize"
      :columns="columns"
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
import { ref, inject, watch } from "vue";
import Loading from "vue-loading-overlay";
import { useUserStore } from "../../stores/userdata";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
const ischange = inject("ischange");
const swal = inject("$swal");
const store = useUserStore();
const canusecitys = store.citys;
async function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const timestamp = ref();
const isLoading = ref(false);
const datatable = ref([]);
const category = ref("請選擇");
const columns = ref([]);
const city = ref("請選擇");
const type = ref("請選擇");
const item = ref("請選擇");
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

const disablestartDate = (ts) => {
  const date = new Date(ts);
  const now = new Date(); // 取得当前时间
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 将时间重设为今天的凌晨，以去掉时、分、秒和毫秒
  const startOfWeek = new Date(today); // 复制今天的日期
  startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1); // 设置礼拜一的日期
  const dayOfWeek = date.getDay(); // 取得星期几，星期日为0，星期一为1，以此类推
  // 禁用礼拜一之后的日期
  if (date >= startOfWeek) {
    return true;
  }
  // 禁用非礼拜一的日期
  if (dayOfWeek !== 1) {
    return true;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月份从0开始，所以要加1
  const day = date.getDate();

  // 禁用2023年9月4日之前的日期
  if (
    year < 2023 ||
    (year === 2023 && (month < 9 || (month === 9 && day < 4)))
  ) {
    return true;
  }

  return false;
};
const disablestartDate2 = (ts) => {
  const date = new Date(ts);
  const now = new Date(); // 取得当前时间
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 将时间重设为今天的凌晨，以去掉时、分、秒和毫秒
  const startOfWeek = new Date(today); // 复制今天的日期
  startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1); // 设置礼拜一的日期
  const dayOfWeek = date.getDay(); // 取得星期几，星期日为0，星期一为1，以此类推
  // 禁用礼拜一之后的日期
  if (date >= startOfWeek) {
    return true;
  }
  // 禁用非礼拜一的日期
  if (dayOfWeek !== 1) {
    return true;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月份从0开始，所以要加1
  const day = date.getDate();

  // 禁用2023年9月11日之前的日期
  if (
    year < 2023 ||
    (year === 2023 && (month < 9 || (month === 9 && day < 11)))
  ) {
    return true;
  }

  return false;
};

const makecol1 = (data) => {
  let arr = [];
  arr = data.map((item, index) => ({
    key: `item${index + 1}`,
    align: "center",
    title: item[2],
  }));
  arr[0]["fixed"] = "left";
  columns.value = [...arr];
};
const makedata1 = (data) => {
  let arr = [];
  for (let i = 0; i < data[0].length; i++) {
    if (i === 0 || i === 1 || i === 2) {
      continue;
    }
    const obj = {};
    for (let j = 1; j <= data.length; j++) {
      obj[`item${j}`] = data[j - 1][i];
    }
    arr.push(obj);
    if (obj["item1"] === "溫度") {
      arr.push({
        item1: "基本資訊",
      });
    } else if (obj["item1"] === "週/日達成率") {
      arr.push({
        item1: "無位可還",
      });
    } else if (obj["item1"] === "10分鐘無位可還每萬次發生率") {
      arr.push({
        item1: "無車可借",
      });
    }
  }
  datatable.value = [...arr];
};

const makecol2 = () => {
  let arr = [
    {
      key: `item1`,
      align: "center",
      title: "排名",
    },
    {
      key: `item2`,
      align: "center",
      title: "場站名稱",
    },
    {
      key: `item3`,
      align: "center",
      title: "分區",
    },
    {
      key: `item4`,
      align: "center",
      title: "次數",
    },
    {
      key: `item5`,
      align: "center",
      title: "上週次數",
    },
  ];
  columns.value = [...arr];
};

const makedata2 = (data) => {
  let arr = [];
  data.forEach((item) => {
    arr.push({
      item1: item["rank"],
      item2: item["station_name"],
      item3: item["responsible_area"],
      item4: item["times"],
      item5: item["times_last_week"],
    });
  });
  datatable.value = [...arr];
};

//每頁幾筆
const pageSize = ref({
  pageSize: 0,
});
const getData = async () => {
  try {
    isLoading.value = true;
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    if (type.value === "調度週報") {
      const params = {
        dataset_id: "report",
        table_id: `weekly_report_maintain_query${category.value}`,
        date: timestamp.value,
        city: city.value,
      };
      const res = await axios.get(url, { params });
      const resdata = res.data.data;
      makecol1(resdata);
      makedata1(resdata);
      pageSize.value = { pageSize: 100 };
      makeExecl(datatable.value, columns.value, "調度週報");
    } else {
      const params = {
        dataset_id: "report",
        table_id: `weekly_report_maintain_rank${category.value}`,
        date: timestamp.value,
        city: city.value,
        item: [item.value],
      };
      const res = await axios.get(url, { params });
      const resdata = res.data.data;
      makecol2();
      makedata2(resdata);
      pageSize.value = { pageSize: 10 };
      makeExecl(datatable.value, columns.value, "調度排名週報");
    }

    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

//如果有更新type,則清空日期
watch(type, () => (timestamp.value = null));
const rowClassName = (row) => {
  if (
    row.item1 === "基本資訊" ||
    row.item1 === "無位可還" ||
    row.item1 === "無車可借"
  ) {
    return "too-old";
  }
};
const search = () => {
  if (type.value === "請選擇") return NotCityAlert("請選擇表別");
  if (category.value === "請選擇") return NotCityAlert("請選擇系統別");
  if (city.value === "請選擇") return NotCityAlert("請選擇城市");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  if (type.value === "調度排名週報")
    if (item.value === "請選擇") return NotCityAlert("請選擇項目");
  getData();
};
</script>

<style scoped>
:deep(.too-old td) {
  background-color: rgba(225, 232, 23, 0.75) !important;
}
</style>
