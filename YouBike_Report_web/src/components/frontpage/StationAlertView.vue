<template>
  <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
  <div class="row mt-3">
    <div class="col-auto my-1">
      <n-select style="width: 130px" v-model:value="cityvalue" :options="selectoptions" />
    </div>
    <div class="col-auto my-1">
      <n-select class="col-md-3" style="width: 130px" v-model:value="Typevalue" :options="TypeOptions" />
    </div>
    <div class="col-auto">
      <n-date-picker
        v-model:formatted-value="timestamp"
        type="date"
        value-format="yyyy-MM-dd"
        :update-value-on-close="true"
        default-time="2023-06-20"
        :input-readonly="true"
        :actions="null"
      />
    </div>
    <div class="col-auto my-1">
      <n-button type="primary" class="me-1" @click="search">搜尋</n-button>
    </div>
  </div>

  <div class="row mt-3">
    <div class="col-6 mt-3">
      <FourEchartComponent1
        v-if="data1[2].data"
        :data="data1[2].data"
        :title="data1[2].title"
        :secondtitle="timestamp"
        :type="Typevalue"
      />
    </div>
    <div class="col-6 mt-3">
      <FourEchartComponent1
        v-if="data1[0].data"
        :data="data1[0].data"
        :title="data1[0].title"
        :secondtitle="timestamp"
        :type="Typevalue"
      />
    </div>
    <div class="col-6 mt-3" v-for="i in data2" :key="i.title">
      <FourEchartComponent2
        :data="i.data"
        :title="i.title"
        :type="Typevalue"
        :secondtitle="timestamp"
      />
    </div>
    <div class="col-6 mt-3">
      <FourEchartComponent1
        v-if="data1[1].data"
        :data="data1[1].data"
        :title="data1[1].title"
        :secondtitle="timestamp"
        :type="Typevalue"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { NSelect, NButton, NDatePicker } from "naive-ui";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import FourEchartComponent1 from "../FourEchart/FourEchartComponent1.vue";
import FourEchartComponent2 from "../FourEchart/FourEchartComponent2.vue";
// 🚀 1. 改用集中管理的 apiClient
import apiClient from "@/api/index";
import { useUserStore } from "../../stores/userdata";

const swal = inject("$swal");
const store = useUserStore();
const canusecitys = store.citys || [];

const isLoading = ref(false);

const ErrorAlert = async (text) => {
  swal({ icon: "error", title: text, showConfirmButton: false });
};

const Getnowday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const timestamp = ref(Getnowday());

// 🚀 2. 城市配置：精簡城市權限過濾邏輯
const CITY_CONFIG = [
  { label: "台北市", value: "Taipei", id: 2 },
  { label: "新北市", value: "Newtaipei", id: 3 },
  { label: "桃園市", value: "Taoyuan", id: 4 },
  { label: "新竹市", value: "Hsinchu", id: 5 },
  { label: "新竹縣", value: "Hsinchu_country", id: 6 },
  { label: "竹科", value: "Hsinchu_science", id: 20 },
  { label: "苗栗縣", value: "Miaoli", id: 7 },
  { label: "台中市", value: "Taichung", id: 8 },
  { label: "嘉義市", value: "Chiayi", id: 12 },
  { label: "台南市", value: "Tainan", id: 14 },
  { label: "高雄市", value: "Kaohsiung", id: 15 },
  { label: "屏東縣", value: "Pingtung", id: 16 },
];

const selectoptions = ref(
  CITY_CONFIG.filter(c => canusecitys.includes(c.id)).map(c => ({ label: c.label, value: c.value }))
);
const cityvalue = ref(selectoptions.value[0]?.value || "");

const Typevalue = ref(3);
const TypeOptions = ref([
  { label: "無車", value: 3 },
  { label: "無位", value: 5 },
]);

const data1 = ref([
  { data: null, title: "" },
  { data: null, title: "" },
  { data: null, title: "" },
]);
const data2 = ref([]);

// --- 資料處理函式 ---
const editData1 = (rawData) => {
  const typeStr = Typevalue.value === 3 ? "無車" : "無位";
  const titles = [
    `${typeStr}可還-無擋柱綁車`,
    `${typeStr}可還-擋柱綁車`,
    `即時統計${typeStr}站位數`
  ];

  data1.value = titles.map((title, index) => ({
    title,
    data: rawData.data.map(item => ({
      date: item.updated_at.split(" ")[1].substring(0, 5),
      value: item[index]?.station_count || 0
    }))
  }));
};

const editData2 = (rawData) => {
  const filterData2 = rawData.data.filter(
    (item) => item.city === cityvalue.value && item.status === Typevalue.value
  );

  // 🚀 3. 告別 12 個 if-else：使用 indexOf 自動對應陣列位置
  const TIME_RANGES = ["0-15", "30", "45", "60", "75", "90", "150", "210", "270", "330", "390", "+390"];
  const arr = new Array(12).fill(0);

  filterData2.forEach(element => {
    const idx = TIME_RANGES.indexOf(element.time_range);
    if (idx !== -1) arr[idx] = element.station_count;
  });

  data2.value = [{
    data: arr,
    title: `即時${Typevalue.value === 3 ? "無車" : "無位"}站點累計時間`,
  }];
};

// --- API 請求 ---
const getData = async () => {
  if (!cityvalue.value) return;
  isLoading.value = true;
  
  try {
    const [res1, res2] = await Promise.all([
      apiClient.get(`/db/catch_4/${cityvalue.value}/${Typevalue.value}`),
      apiClient.get("/report/gcpfun", {
        params: { dataset_id: "yb2", table_id: "station_empty_city_timerange_info" }
      })
    ]);

    editData1(res1.data);
    editData2(res2.data.data);
  } catch (error) {
    console.error("API 錯誤:", error);
    ErrorAlert("取得資料失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = async () => {
  if (timestamp.value === Getnowday()) {
    await getData();
  } else {
    await ErrorAlert("目前只提供即時資料");
  }
};

onMounted(() => {
  getData();
});
</script>

<style lang="scss" scoped></style>