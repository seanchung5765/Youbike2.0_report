<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">TOP50 排名週報</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <!-- 城市選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 180px;">
          <n-select
            v-model:value="cityvalue"
            placeholder="請選擇"
            multiple
            clearable
            :options="cityOptions"
            :max-tag-count="1"
          />
        </div>
        <button type="button" class="btn btn-sm btn-success text-light" style="white-space: nowrap;" @click="setAllCity">全選</button>
      </div>

      <!-- 借/還選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">借/還:</label>
        <div style="width: 130px;">
          <n-select
            v-model:value="sendvalue"
            placeholder="請選擇"
            multiple
            :options="sendOptions"
            :max-tag-count="1"
          />
        </div>
      </div>

      <!-- 日期選擇 -->
      <div style="width: 160px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="timestamp"
          type="date"
          placeholder="請選週一"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disableMondayDate"
          update-value-on-close
        />
      </div>

      <!-- 按鈕群組 -->
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
      ref="dataTableRef"
      :columns="columns"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="1000"
      :bordered="false"
      :single-line="false"
      striped
    />
  </div>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NSelect, NDatePicker } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";
// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

const isLoading = ref(false);
const dataTableRef = ref(null);
const timestamp = ref(null);
const data = ref([]);
const cityvalue = ref([]);
const sendvalue = ref([]);

// 🚀 響應式 Excel 變數
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

async function errorAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

// --- 🚀 城市選單動態生成 (取代 100 行手寫代碼) ---
const cityOptions = computed(() => {
  const baseCities = [
    { label: "台北市", value: "Taipei", auth: 2 }, { label: "新北市", value: "Newtaipei", auth: 3 },
    { label: "桃園市", value: "Taoyuan", auth: 4 }, { label: "新竹市", value: "Hsinchu", auth: 5 },
    { label: "新竹縣", value: "Hsinchu_Country", auth: 6 }, { label: "竹科", value: "HsinchuScience", auth: 20 },
    { label: "苗栗縣", value: "Miaoli", auth: 7 }, { label: "台中市", value: "Taichung", auth: 8 },
    { label: "嘉義市", value: "Chiayi", auth: 12 }, { label: "嘉義縣", value: "Chiayi_Country", auth: 13 },
    { label: "台南市", value: "Tainan", auth: 14 }, { label: "高雄市", value: "Kaohsiung", auth: 15 },
    { label: "屏東縣", value: "Pingtung", auth: 16 }, { label: "台東縣", value: "Taitung", auth: 19 }
  ];

  const options = [];
  baseCities.forEach(c => {
    if (canusecitys.includes(c.auth)) {
      options.push({ label: `${c.label} 2.0`, value: `${c.value}2` });
      options.push({ label: `${c.label} 2.0E`, value: `${c.value}2E` });
    }
  });
  return options;
});

const sendOptions = [
  { label: "借", value: "rent" },
  { label: "還", value: "return" }
];

const columns = [
  { key: "item1", align: "center", title: "借/還", width: 80 },
  { key: "item2", align: "center", title: "城市", width: 100 },
  { key: "item3", align: "center", title: "場站名稱", width: 250 },
  { key: "item4", align: "center", title: "開站時間", width: 120 },
  { key: "item5", align: "center", title: "本週次數" },
  { key: "item6", align: "center", title: "本週排名" },
  { key: "item7", align: "center", title: "上週次數" },
  { key: "item8", align: "center", title: "上週排名" },
  { key: "item9", align: "center", title: "成長率" },
];

// --- 🚀 日期防呆 (僅限週一且不能超過本週) ---
const disableMondayDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 計算本週一
  const currentWeekMonday = new Date(todayStart);
  currentWeekMonday.setDate(todayStart.getDate() - (todayStart.getDay() || 7) + 1);

  if (d >= currentWeekMonday) return true; // 只能選過去的週
  if (d.getDay() !== 1) return true; // 只能選週一
  if (d.getFullYear() < 2023) return true; // 2023以前禁用

  return false;
};

const setAllCity = () => {
  cityvalue.value = cityOptions.value.map(o => o.value);
};

// --- API 請求 ---
const getRankingData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "weekly_rank",
      item: sendvalue.value,
      city: cityvalue.value,
      date: timestamp.value,
    };

    const res = await getGcpReport(params);
    const resList = res.data?.data || [];

    // 🚀 資料 Mapping & 防護
    data.value = resList.map(item => ({
      item1: item.item_ch ?? "",
      item2: item.city_ch ?? "",
      item3: item.station_name ?? "",
      item4: item.start_time ?? "",
      item5: item.times_this_week ?? 0,
      item6: item.rank_this_week ?? "",
      item7: item.times_last_week ?? 0,
      item8: item.rank_last_week ?? "",
      item9: item.growth_rate ?? "0%",
    }));

    // 更新 Excel
    exceldata.value = [...data.value];
    excelename.value = "Top50 排名週報";
    excelecolumn.value = columns.map(c => c.title);

    if (dataTableRef.value?.page) dataTableRef.value.page(1);

  } catch (error) {
    console.error("API Error:", error);
    errorAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!sendvalue.value.length) return errorAlert("請選擇借/還");
  if (!cityvalue.value.length) return errorAlert("請選擇城市");
  if (!timestamp.value) return errorAlert("請選擇日期");
  getRankingData();
};
</script>