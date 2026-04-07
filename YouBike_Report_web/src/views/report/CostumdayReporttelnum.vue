<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">接聽通數統計</h1>
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
              <option value="Taipei_two" v-if="canusecitys.includes(2)">
                台北市
              </option>
              <option value="NewTaipei_two" v-if="canusecitys.includes(3)">
                新北市
              </option>
              <option value="Taoyuan_two" v-if="canusecitys.includes(4)">
                桃園市
              </option>
              <option value="Miaoli_two" v-if="canusecitys.includes(7)">
                苗栗縣
              </option>
              <option value="Hsinchu_two" v-if="canusecitys.includes(5)">
                新竹市
              </option>
              <option value="HsinchuCountry_two" v-if="canusecitys.includes(6)">
                新竹縣
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
              <option value="NewTaipei_one" v-if="canusecitys.includes(3)">
                新北市
              </option>
              <option value="Taoyuan" v-if="canusecitys.includes(4)">
                桃園縣
              </option>
              <option value="Miaoli_one" v-if="canusecitys.includes(7)">
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
      :scroll-x="1200"
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

const columns = [
  {
    key: "item1",
    align: "center",
    fixed: "left",
    title: "員工編號",
    width: 100,
  },
  {
    key: "item2",
    align: "center",
    title: "姓名",
    width: 100,
  },
  {
    key: "item3",
    align: "center",
    title: "0-1",
  },
  {
    key: "item4",
    align: "center",
    title: "1-2",
  },
  {
    key: "item5",
    align: "center",
    title: "2-3",
  },
  {
    key: "item6",
    align: "center",
    title: "3-4",
  },
  {
    key: "item7",
    align: "center",
    title: "4-5",
  },
  {
    key: "item8",
    align: "center",
    title: "5-6",
  },
  {
    key: "item9",
    align: "center",
    title: "6-7",
  },
  {
    key: "item10",
    align: "center",
    title: "7-8",
  },
  {
    key: "item11",
    align: "center",
    title: "8-9",
  },
  {
    key: "item12",
    align: "center",
    title: "9-10",
  },
  {
    key: "item13",
    align: "center",
    title: "10-11",
  },
  {
    key: "item14",
    align: "center",
    title: "11-12",
  },
  {
    key: "item15",
    align: "center",
    title: "12-13",
  },
  {
    key: "item16",
    align: "center",
    title: "13-14",
  },
  {
    key: "item17",
    align: "center",
    title: "14-15",
  },
  {
    key: "item18",
    align: "center",
    title: "15-16",
  },
  {
    key: "item19",
    align: "center",
    title: "16-17",
  },
  {
    key: "item20",
    align: "center",
    title: "17-18",
  },
  {
    key: "item21",
    align: "center",
    title: "18-19",
  },
  {
    key: "item22",
    align: "center",
    title: "19-20",
  },
  {
    key: "item23",
    align: "center",
    title: "20-21",
  },
  {
    key: "item24",
    align: "center",
    title: "21-22",
  },
  {
    key: "item25",
    align: "center",
    title: "22-23",
  },
  {
    key: "item26",
    align: "center",
    title: "23-24",
  },
  {
    key: "item27",
    align: "center",
    title: "合計",
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

const getdata = async () => {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/gcpfun`;
    let params = {
      dataset_id: "yb2",
      table_id: "CTI_person_work",
      date: timestamp.value,
      city: city.value,
      sys: category.value,
    };
    isLoading.value = true;
    const res = await axios.get(url, { params });
    const resdata = res.data.data;
    let arr = [];

    resdata.forEach((element) => {
      arr.push({
        item1: element["AID"],
        item2: element["name"],
        item3: element["zero"],
        item4: element["one"],
        item5: element["two"],
        item6: element["three"],
        item7: element["four"],
        item8: element["five"],
        item9: element["six"],
        item10: element["seven"],
        item11: element["eight"],
        item12: element["nine"],
        item13: element["ten"],
        item14: element["eleven"],
        item15: element["twelve"],
        item16: element["thirteen"],
        item17: element["fourteen"],
        item18: element["fifthteen"],
        item19: element["sixteen"],
        item20: element["seventeen"],
        item21: element["eighteen"],
        item22: element["nineteen"],
        item23: element["twenty"],
        item24: element["twenty_one"],
        item25: element["twenty_two"],
        item26: element["twenty_three"],
        item27: element["total"],
      });
    });
    totaldata.value = [...arr];
    makeExecl(totaldata.value, columns, "接聽通數統計");

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
  await getdata();
};
</script>

<style scoped></style>
