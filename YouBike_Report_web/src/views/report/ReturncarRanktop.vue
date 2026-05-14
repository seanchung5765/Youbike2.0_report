<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">借/還車場站排名 (前幾名)(每月10號更新資料)</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <!-- 借/還選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">借/還:</label>
        <div style="width: 130px;">
          <n-select v-model:value="Borrow" placeholder="請選擇" multiple :options="Borrowoptions" :max-tag-count="1" />
        </div>
      </div>

      <!-- 城市選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 200px;">
          <n-select v-model:value="city" placeholder="請選擇" multiple :options="cityOptions" :max-tag-count="1" />
        </div>
        <button type="button" class="btn btn-sm btn-success text-light" style="white-space: nowrap;" @click="setAllCity">全選</button>
      </div>

      <!-- 日期選擇 -->
      <div style="width: 140px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="month"
          placeholder="選擇月份"
          value-format="yyyy-MM"
          :is-date-disabled="disablePreviousDate"
          update-value-on-close
        />
      </div>

      <!-- 按鈕組 -->
      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-success text-light" style="white-space: nowrap;" @click="search">搜尋</button>
        <output-excel
          class="btn btn-primary text-light"
          style="white-space: nowrap;"
          :data="exceldata"
          :name="excelename"
          :header="excelecolumn"
        />
      </div>
    </form>

    <n-data-table
      v-show="data.length > 0"
      size="small"
      :data="data"
      ref="dataTable"
      :columns="columns"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="800"
      :bordered="false"
      :single-line="false"
      striped
    />
  </div>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NSelect, NDatePicker } from "naive-ui";
import OutputExcel from "../../components/OutputExcel.vue";
// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

const isLoading = ref(false);
const timestamp = ref(null);
const Borrow = ref([]);
const data = ref([]);
const city = ref([]);
const dataTable = ref(null);

// 🚀 響應式 Excel 變數，供 OutputExcel 元件使用
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const Borrowoptions = [
  { label: "借", value: "借" },
  { label: "還", value: "還" }
];

// --- 🚀 城市選單動態生成邏輯 (消滅 100 行手寫代碼) ---
const cityOptions = computed(() => {
  const baseCities = [
    { label: "台北市", auth: 2 }, { label: "新北市", auth: 3 },
    { label: "桃園市", auth: 4 }, { label: "新竹市", auth: 5 },
    { label: "新竹縣", auth: 6 }, { label: "竹科", auth: 20 },
    { label: "苗栗縣", auth: 7 }, { label: "台中市", auth: 8 },
    { label: "嘉義市", auth: 12 }, { label: "嘉義縣", auth: 13 },
    { label: "台南市", auth: 14 }, { label: "高雄市", auth: 15 },
    { label: "屏東縣", auth: 16 }, { label: "台東縣", auth: 19 }
  ];

  const options = [];
  baseCities.forEach(c => {
    if (canusecitys.includes(c.auth)) {
      options.push({ label: `${c.label}2.0`, value: `${c.label}2.0` });
      options.push({ label: `${c.label}2.0E`, value: `${c.label}2.0E` });
    }
  });
  return options;
});

const setAllCity = () => {
  city.value = cityOptions.value.map(o => o.value);
};

// --- 表頭定義 ---
const columns = [
  { key: "num1", align: "center", fixed: "left", title: "名次", width: 70 },
  { key: "num2", align: "center", title: "借/還", width: 80 },
  { key: "num3", align: "center", title: "城市", width: 120 },
  { key: "num4", align: "center", title: "場站代碼", width: 100 },
  { key: "num5", align: "center", title: "場站名稱", width: 250 },
  { key: "num6", align: "center", title: "借車/還車次數", width: 120 },
];

const disablePreviousDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const minDate = new Date(2023, 5, 1); // 2023-06
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return d < minDate || d >= currentMonthStart;
};

// --- API 請求 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "marketing_report",
      table_id: "rent_return_rank_top",
      item: Borrow.value,
      city: city.value,
      date: `${timestamp.value}-01`,
    };

    // 🚀 使用統一抽離的 API
    const res = await getGcpReport(params);
    const resData = res.data?.data || [];

    // 格式化資料
    data.value = resData.map(element => ({
      num1: element.rank ?? "",
      num2: element.rent_return ?? "",
      num3: element.city ?? "",
      num4: element.station_no ?? "",
      num5: element.station_name ?? "",
      num6: element.times ?? 0,
    }));

    // 🚀 更新提供給匯出元件的資料
    exceldata.value = [...data.value];
    excelename.value = "借還車場站排名(前幾名)";
    excelecolumn.value = columns.map(c => c.title);
    
    if (dataTable.value?.page) dataTable.value.page(1);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (Borrow.value.length === 0) return NotCityAlert("請選擇借/還");
  if (city.value.length === 0) return NotCityAlert("請選擇城市");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  getData();
};
</script>