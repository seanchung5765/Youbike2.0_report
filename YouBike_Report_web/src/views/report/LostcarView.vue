<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">遺失車報表</h1>
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
            <option
              value="Taipei+NewTaipei"
              v-if="canusecitys.includes(2) && canusecitys.includes(3)"
            >
              雙北
            </option>
            <option value="Taipei" v-if="canusecitys.includes(2)">
              台北市
            </option>
            <option value="NewTaipei" v-if="canusecitys.includes(3)">
              新北市
            </option>

            <option value="Taoyuan" v-if="canusecitys.includes(4)">
              桃園市
            </option>
            <option value="Hsinchu" v-if="canusecitys.includes(5)">
              新竹市
            </option>
            <option value="Hsinchu_country" v-if="canusecitys.includes(6)">
              新竹縣
            </option>
            <option value="Hsinchu_science" v-if="canusecitys.includes(20)">
              竹科
            </option>
            <option value="Mialoi" v-if="canusecitys.includes(7)">
              苗栗縣
            </option>
            <option value="Taichung" v-if="canusecitys.includes(8)">
              台中市
            </option>
            <option value="Chiayi" v-if="canusecitys.includes(12)">
              嘉義市
            </option>
            <option value="Chiayi_country" v-if="canusecitys.includes(13)">
              嘉義縣
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
const isLoading = ref(false);
const columns = ref([]);
const totaldata = ref([]);
const timestamp = ref();

const disableStartDate = (ts) => {
  const date = new Date(ts);
  const now = new Date(); // 获取当前时间
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  ); // 昨天的日期

  if (date < new Date(2023, 7, 30) || date > yesterday) {
    return true;
  }

  return false;
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

const chineseCity = (city) => {
  switch (city) {
    case "Taipei":
      return "台北市";
    case "NewTaipei":
      return "新北市";
    case "Taoyuan":
      return "桃園市";
    case "Hsinchu":
      return "新竹市";
    case "Hsinchu_country":
      return "新竹縣";
    case "Hsinchu_science":
      return "竹科";
    case "Mialoi":
      return "苗栗縣";
    case "Taichung":
      return "台中市";
    case "Chiayi":
      return "嘉義市";
    case "Tainan":
      return "台南市";
    case "Kaohsiung":
      return "高雄市";
    case "Pingtung":
      return "屏東縣";
    default:
      return "未知城市";
  }
};

const getdata = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    let params = {
      dataset_id: "report",
      table_id: "daily_lost",
      date: timestamp.value,
      city:
        city.value === "Taipei+NewTaipei"
          ? ["Taipei", "NewTaipei"]
          : [city.value],
    };
    isLoading.value = true;
    const res = await axios.get(url, { params });
    const resdata = res.data.data;
    isLoading.value = false;
    const obj1 = {
      one: null,
      two: null,
      twoe: null,
    };
    resdata.forEach((item, index) => {
      if (index !== 0) {
        if (resdata[index]["sys"] !== resdata[index - 1]["sys"]) {
          if (!obj1.one) {
            obj1.one = index + 1;
          } else if (!obj1.two) {
            obj1.two = index + 1;
          } else if (!obj1.twoe) {
            obj1.twoe = index;
          }
        }
      }
    });

    columns.value = [
      {
        key: "item1",
        align: "center",
        title: "城市",
      },
      {
        key: "item2",
        align: "center",
        title: "系統",
      },
      {
        key: "item3",
        align: "center",
        title: "待協尋車輛數",
      },
      {
        key: "item4",
        align: "center",
        title: "狀態",
      },

      {
        key: "item5",
        align: "center",
        title: "車號",
      },
    ];
    let arr = [];
    resdata.forEach((item, index) => {
      if (index === 0) {
        arr.push({
          item1: chineseCity(item.city),
          item2: item.sys,
          item3: item.total,
          item4: !item.status
            ? null
            : item.status === "new_lost"
            ? "新增報案車輛"
            : "今日尋回車輛",
          item5: item.asset_no,
        });
      } else {
        arr.push({
          item1:
            resdata[index]["city"] === resdata[index - 1]["city"]
              ? ""
              : chineseCity(item.city),
          item2:
            resdata[index]["sys"] === resdata[index - 1]["sys"] &&
            resdata[index]["city"] === resdata[index - 1]["city"]
              ? ""
              : item.sys,
          item3:
            resdata[index]["total"] === resdata[index - 1]["total"]
              ? ""
              : item.total,
          item4: !item.status
            ? null
            : item.status === "new_lost"
            ? "新增報案車輛"
            : "今日尋回車輛",
          item5: item.asset_no,
        });
      }
    });
    totaldata.value = [...arr];
    makeExecl(totaldata.value, columns.value, "遺失車報表");
  } catch (error) {
    console.log(error);
  }
};

const search = async () => {
  if (city.value === "請選擇") {
    return NotCityAlert("請選擇城市");
  } else if (!timestamp.value) {
    return NotCityAlert("請選擇日期");
  }
  await getdata();
};
</script>

<style scoped></style>
