<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">每小時車輛狀態</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <!-- 城市選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 150px;">
          <n-select
            v-model:value="cityvalue"
            placeholder="請選擇"
            multiple
            :options="cityOptions"
            :max-tag-count="1"
            size="medium"
          />
        </div>
      </div>

      <!-- 時段選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">時段:</label>
        <div style="width: 120px;">
          <n-select
            v-model:value="hoursValue"
            placeholder="請選擇"
            multiple
            :options="hourOptions"
            :max-tag-count="1"
            size="medium"
          />
        </div>
      </div>

      <!-- 開始日期 -->
      <div style="width: 140px; flex-shrink: 0; margin-left: 8px;">
        <n-date-picker
          v-model:formatted-value="starttimestamp"
          type="date"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="開始日期"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disablestartDate"
        />
      </div>

      <span class="fw-bold" style="flex-shrink: 0;">至</span>

      <!-- 結束日期 -->
      <div style="width: 140px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="endtimestamp"
          type="date"
          :actions="null"
          :input-readonly="true"
          :update-value-on-close="true"
          placeholder="結束日期"
          value-format="yyyy-MM-dd"
          :is-date-disabled="disableEndDate"
        />
      </div>

      <!-- 按鈕群組 -->
      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: 8px;">
        <button
          type="button"
          class="btn btn-info text-light"
          style="white-space: nowrap;"
          @click="cleardate"
        >
          清空日期
        </button>
        <button
          type="button"
          class="btn btn-success text-light"
          style="white-space: nowrap;"
          @click="search"
        >
          搜尋
        </button>
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
      v-show="totaldata.length > 0"
      ref="dataTable"
      size="small"
      :columns="columns"
      :data="totaldata"
      :pagination="{ pageSize: 15 }"
      :max-height="600"
      :scroll-x="1200"
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
import { NDataTable, NDatePicker, NSelect } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import OutputExcel from "../../components/OutputExcel.vue";
// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const isLoading = ref(false);
const dataTable = ref(null);
const totaldata = ref([]);

const cityvalue = ref([]);
const hoursValue = ref([]);
const starttimestamp = ref(null);
const endtimestamp = ref(null);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🚀 動態生成城市選項 ---
const cityOptions = computed(() => {
  const map = [
    { label: "台北市", value: "Taipei", auth: 2 },
    { label: "新北市", value: "Newtaipei", auth: 3 },
    { label: "桃園市", value: "Taoyuan", auth: 4 },
    { label: "新竹市", value: "Hsinchu", auth: 5 },
    { label: "新竹縣", value: "Hsinchu_Country", auth: 6 },
    { label: "竹科", value: "HsinchuScience", auth: 20 },
    { label: "苗栗縣", value: "Miaoli", auth: 7 },
    { label: "台中市", value: "Taichung", auth: 8 },
    { label: "嘉義市", value: "Chiayi", auth: 12 },
    { label: "嘉義縣", value: "Chiayi_Country", auth: 13 },
    { label: "台南市", value: "Tainan", auth: 14 },
    { label: "高雄市", value: "Kaohsiung", auth: 15 },
    { label: "屏東縣", value: "Pingtung", auth: 16 },
    { label: "台東縣", value: "Taitung", auth: 19 },
  ];
  return map.map(c => ({
    label: c.label,
    value: c.value,
    disabled: !canusecitys.includes(c.auth)
  }));
});

// --- 🚀 動態生成 0~23 時段選項 (一行搞定) ---
const hourOptions = Array.from({ length: 24 }, (_, i) => ({ label: `${i}時`, value: i }));

// --- 🚀 日期防呆邏輯極簡化 (縮減 70% 代碼) ---
const MIN_DATE = new Date(2024, 0, 1).getTime(); // 2024-01-01
const getTodayEnd = () => new Date().setHours(23, 59, 59, 999);

const disablestartDate = (ts) => {
  if (ts < MIN_DATE || ts > getTodayEnd()) return true;
  if (endtimestamp.value) {
    const end = new Date(endtimestamp.value).getTime();
    const thirtyDaysAgo = end - 30 * 24 * 60 * 60 * 1000;
    return ts < thirtyDaysAgo || ts > end;
  }
  return false;
};

const disableEndDate = (ts) => {
  if (ts < MIN_DATE || ts > getTodayEnd()) return true;
  if (starttimestamp.value) {
    const start = new Date(starttimestamp.value).getTime();
    const thirtyDaysAfter = start + 30 * 24 * 60 * 60 * 1000;
    return ts < start || ts > thirtyDaysAfter;
  }
  return false;
};

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

// --- 表頭設定 ---
const columns = [
  { key: "item1", align: "center", title: "日期" },
  { key: "item2", align: "center", title: "時段" },
  { key: "item3", align: "center", title: "縣市" },
  { key: "item4", align: "center", title: "系統" },
  { key: "item5", align: "center", title: "在站" },
  { key: "item6", align: "center", title: "使用" },
  { key: "item7", align: "center", title: "維修" },
  { key: "item8", align: "center", title: "調度" },
  { key: "item9", align: "center", title: "合計" },
  { key: "item10", align: "center", title: "合約車輛數" },
  { key: "item11", align: "center", title: "境內車輛數占比" },
  { key: "item12", align: "center", title: "差異數" },
];

const makeExecl = (nowdata, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = columns.map(col => col.title);
};

// --- API 請求與資料處理 ---
const getData = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "bike_checklist_hour_report",
      begin_date: starttimestamp.value,
      end_date: endtimestamp.value,
      city: cityvalue.value, // Vue 3 的 ref array 直接丟進去即可
      hour: hoursValue.value,
    };

    // 🚀 使用共用 API 發送
    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 💡 整理資料，加入 ?? 保底避免空白，並穩固日期格式
    totaldata.value = resdata.map((item) => {
      let formattedDate = "";
      if (item.date) {
        // 使用 new Date() 讓瀏覽器自動解析各種複雜的時間字串
        const d = new Date(item.date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const day = d.getDate().toString().padStart(2, "0");
        // 組合成漂亮的 YYYY-MM-DD
        formattedDate = `${year}-${month}-${day}`; 
      }

      return {
        item1: formattedDate,
        item2: item.hour ?? "-",
        item3: item.city ?? "-",
        item4: item.sys ?? "-",
        item5: item.in_station ?? 0,
        item6: item.use ?? 0,
        item7: item.repair ?? 0,
        item8: item.dispatch ?? 0,
        item9: item.total ?? 0,
        item10: item.bike_number ?? 0,
        item11: item.percentage ?? "0%",
        item12: item.different ?? 0,
      };
    });

    makeExecl(totaldata.value, "每小時車輛狀態");
    
    // 搜尋成功後回到第一頁
    if (dataTable.value?.page) dataTable.value.page(1);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (cityvalue.value.length === 0) return NotCityAlert("請選擇城市");
  if (hoursValue.value.length === 0) return NotCityAlert("請選擇小時");
  if (!starttimestamp.value) return NotCityAlert("請選擇開始日期");
  if (!endtimestamp.value) return NotCityAlert("請選擇結束日期");
  getData();
};
</script>

<style scoped></style>