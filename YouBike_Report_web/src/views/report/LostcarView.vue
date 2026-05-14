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

    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-2 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <!-- 城市選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 140px;">
          <!-- 🚀 升級為 n-select -->
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇"
          />
        </div>
      </div>

      <!-- 日期選擇 -->
      <div style="width: 150px; flex-shrink: 0;">
        <n-date-picker
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

      <!-- 按鈕群組 -->
      <div style="display: flex; gap: 8px; flex-shrink: 0;">
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
      ref="dataTable"
      size="small"
      v-show="totaldata.length > 0"
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

const dataTable = ref(null);
const city = ref(null);
const timestamp = ref(null);
const isLoading = ref(false);
const totaldata = ref([]);

let exceldata = [];
let excelename = "";
let excelecolumn = [];

// --- 🚀 城市選單 (資料驅動 + 雙北特殊權限處理) ---
const cityOptions = computed(() => {
  const map = [
    { label: "雙北", value: "Taipei+NewTaipei", auth: [2, 3] }, // 需同時具備 2 和 3
    { label: "台北市", value: "Taipei", auth: 2 },
    { label: "新北市", value: "NewTaipei", auth: 3 },
    { label: "桃園市", value: "Taoyuan", auth: 4 },
    { label: "新竹市", value: "Hsinchu", auth: 5 },
    { label: "新竹縣", value: "Hsinchu_country", auth: 6 },
    { label: "竹科", value: "Hsinchu_science", auth: 20 },
    { label: "苗栗縣", value: "Mialoi", auth: 7 }, // 維持原 API 拼字
    { label: "台中市", value: "Taichung", auth: 8 },
    { label: "嘉義市", value: "Chiayi", auth: 12 },
    { label: "嘉義縣", value: "Chiayi_country", auth: 13 },
    { label: "台南市", value: "Tainan", auth: 14 },
    { label: "高雄市", value: "Kaohsiung", auth: 15 },
    { label: "屏東縣", value: "Pingtung", auth: 16 }
  ];

  return map.filter(c => {
    // 若權限需求是陣列 (如雙北)，則需 every 皆符合
    if (Array.isArray(c.auth)) {
      return c.auth.every(a => canusecitys.includes(a));
    }
    return canusecitys.includes(c.auth);
  });
});

// --- 🚀 城市中英對照字典 (取代冗長 switch) ---
const cityDict = {
  Taipei: "台北市", NewTaipei: "新北市", Taoyuan: "桃園市",
  Hsinchu: "新竹市", Hsinchu_country: "新竹縣", Hsinchu_science: "竹科",
  Mialoi: "苗栗縣", Taichung: "台中市", Chiayi: "嘉義市",
  Chiayi_country: "嘉義縣", Tainan: "台南市", Kaohsiung: "高雄市", Pingtung: "屏東縣"
};

const chineseCity = (cityKey) => cityDict[cityKey] || "未知城市";

// --- 日期防呆優化 ---
const disableStartDate = (ts) => {
  const date = new Date(ts);
  const minDate = new Date(2023, 7, 30); // 2023-08-30
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 只能選 2023-08-30 以後，且「今天以前」(也就是最多選到昨天)
  return date < minDate || date >= today;
};

// --- 表頭定義 ---
const columns = [
  { key: "item1", align: "center", title: "城市" },
  { key: "item2", align: "center", title: "系統" },
  { key: "item3", align: "center", title: "待協尋車輛數" },
  { key: "item4", align: "center", title: "狀態" },
  { key: "item5", align: "center", title: "車號" },
];

const makeExecl = (nowdata, name) => {
  exceldata = [...nowdata];
  excelename = name;
  excelecolumn = columns.map(col => col.title);
};

// --- API 請求與資料處理 ---
const getdata = async () => {
  try {
    isLoading.value = true;
    const params = {
      dataset_id: "report",
      table_id: "daily_lost",
      date: timestamp.value,
      city: city.value === "Taipei+NewTaipei" ? ["Taipei", "NewTaipei"] : [city.value],
    };

    // 🚀 使用共用 API 發送
    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

    // 💡 整理資料，並保留原有的「視覺合併 (清空重複字串)」邏輯
    let arr = [];
    resdata.forEach((item, index) => {
      const currentCityStr = chineseCity(item.city);
      const statusStr = item.status === "new_lost" ? "新增報案車輛" : (item.status ? "今日尋回車輛" : "");

      if (index === 0) {
        arr.push({
          item1: currentCityStr,
          item2: item.sys ?? "",
          item3: item.total ?? "",
          item4: statusStr,
          item5: item.asset_no ?? "",
        });
      } else {
        const prev = resdata[index - 1];
        const isSameCity = item.city === prev.city;
        const isSameSys = isSameCity && item.sys === prev.sys;
        const isSameTotal = item.total === prev.total;

        arr.push({
          item1: isSameCity ? "" : currentCityStr, // 若與上一筆城市相同則留白
          item2: isSameSys ? "" : (item.sys ?? ""),
          item3: isSameTotal ? "" : (item.total ?? ""),
          item4: statusStr,
          item5: item.asset_no ?? "",
        });
      }
    });

    totaldata.value = arr;
    makeExecl(totaldata.value, "遺失車報表");

    // 搜尋成功後回到第一頁
    if (dataTable.value?.page) dataTable.value.page(1);

  } catch (error) {
    console.error("API Error:", error);
    NotCityAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = async () => {
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!timestamp.value) return NotCityAlert("請選擇日期");
  await getdata();
};
</script>

<style scoped></style>