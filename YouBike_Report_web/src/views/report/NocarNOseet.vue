<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">無車無位統計</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <!-- 類別 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">類別:</label>
        <div style="width: 100px;">
          <n-select v-model:value="itemcategory" :options="categoryOptions" @update:value="cleardateall" placeholder="請選擇" />
        </div>
      </div>

      <!-- 系統別 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">系統別:</label>
        <div style="width: 120px;">
          <n-select v-model:value="sysCategory" :options="sysOptions" @update:value="city = []" placeholder="請選擇" />
        </div>
      </div>

      <!-- 城市與全選 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 160px;">
          <n-select v-model:value="city" multiple :options="cityOptions" :max-tag-count="1" placeholder="請選擇" />
        </div>
        <button type="button" class="btn btn-sm btn-success text-light" style="white-space: nowrap;" @click="searchcityall">
          全選
        </button>
      </div>

      <!-- 項目 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">項目:</label>
        <div style="width: 140px;">
          <n-select v-model:value="item" :options="itemOptions" placeholder="請選擇" />
        </div>
      </div>

      <!-- 狀態 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">狀態:</label>
        <div style="width: 100px;">
          <n-select v-model:value="status" multiple :options="statusOptions" :max-tag-count="1" placeholder="請選擇" />
        </div>
      </div>

      <!-- 🚀 日期區間 (依類別動態切換) -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <!-- 日報 -->
        <template v-if="itemcategory === 'day_empty_full'">
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.start1" type="date" value-format="yyyy-MM-dd" placeholder="開始日期" :is-date-disabled="disableDailyStart" clearable />
          </div>
          <span class="fw-bold">至</span>
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.end1" type="date" value-format="yyyy-MM-dd" placeholder="結束日期" :is-date-disabled="disableDailyEnd" clearable />
          </div>
        </template>

        <!-- 週報 -->
        <template v-else-if="itemcategory === 'weekly_empty_full'">
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.start2" type="date" value-format="yyyy-MM-dd" placeholder="週一開始" :is-date-disabled="disableWeeklyStart" clearable />
          </div>
          <span class="fw-bold">至</span>
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.end2" type="date" value-format="yyyy-MM-dd" placeholder="週一結束" :is-date-disabled="disableWeeklyEnd" clearable />
          </div>
        </template>

        <!-- 月報 -->
        <template v-else-if="itemcategory === 'monthly_empty_full'">
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.start3" type="month" value-format="yyyy-MM" placeholder="開始月份" :is-date-disabled="disableMonthlyStart" clearable />
          </div>
          <span class="fw-bold">至</span>
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.end3" type="month" value-format="yyyy-MM" placeholder="結束月份" :is-date-disabled="disableMonthlyEnd" clearable />
          </div>
        </template>
        
        <button v-if="itemcategory" type="button" class="btn btn-sm btn-info text-light" style="white-space: nowrap;" @click="cleardateall">清空</button>
      </div>

      <!-- 搜尋匯出 -->
      <div style="display: flex; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-primary text-light" style="white-space: nowrap;" @click="search">
          搜尋匯出
        </button>
      </div>
    </form>

    <n-result class="mt-5" status="info" title="此頁面只供下載 EXCEL，無網頁資料表預覽"></n-result>
  </div>
</template>

<script setup>
import { ref, inject, computed, reactive } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDatePicker, NSelect, NResult } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
import * as XLSX from "xlsx";
// 🚀 引入共用 API
import { getGcpReport } from "@/api/report";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function errorAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const isLoading = ref(false);

// --- 🚀 選單選項 (資料驅動) ---
const categoryOptions = [
  { label: "日報", value: "day_empty_full" },
  { label: "週報", value: "weekly_empty_full" },
  { label: "月報", value: "monthly_empty_full" }
];
const sysOptions = [
  { label: "1.0", value: "1.0" },
  { label: "2.0+2.0E", value: "2.0" }
];
const itemOptions = ["無車5分鐘", "無車10分鐘", "無車20分鐘", "無車30分鐘", "無位5分鐘", "無位10分鐘", "無位20分鐘", "無位30分鐘"].map(v => ({ label: v, value: v }));
const statusOptions = [{ label: "分鐘", value: "分鐘" }, { label: "次數", value: "次數" }];

const itemcategory = ref(null);
const sysCategory = ref(null);
const city = ref([]);
const item = ref(null);
const status = ref([]);

// 🚀 城市選單 (依據系統別連動 Computed)
const cityOptions = computed(() => {
  if (!sysCategory.value) return [];
  const map = sysCategory.value === "1.0" 
    ? [ { label: "新北市", value: "新北市", auth: 3 }, { label: "桃園市", value: "桃園市", auth: 4 }, { label: "苗栗縣", value: "苗栗縣", auth: 7 } ]
    : [
        { label: "台北市", value: "台北市", auth: 2 }, { label: "新北市", value: "新北市", auth: 3 },
        { label: "桃園市", value: "桃園市", auth: 4 }, { label: "新竹市", value: "新竹市", auth: 5 },
        { label: "新竹縣", value: "新竹縣", auth: 6 }, { label: "竹科", value: "竹科", auth: 20 },
        { label: "苗栗縣", value: "苗栗縣", auth: 7 }, { label: "台中市", value: "台中市", auth: 8 },
        { label: "嘉義市", value: "嘉義市", auth: 12 }, { label: "嘉義縣", value: "嘉義縣", auth: 13 },
        { label: "台南市", value: "台南市", auth: 14 }, { label: "高雄市", value: "高雄市", auth: 15 },
        { label: "屏東縣", value: "屏東縣", auth: 16 }, { label: "台東縣", value: "台東縣", auth: 19 }
      ];
  return map.filter(c => canusecitys.includes(c.auth));
});

const searchcityall = () => { city.value = cityOptions.value.map(c => c.value); };

// --- 🚀 日期狀態集中管理 ---
const dateState = reactive({
  start1: null, end1: null, // 日報
  start2: null, end2: null, // 週報
  start3: null, end3: null  // 月報
});

const cleardateall = () => {
  Object.keys(dateState).forEach(k => dateState[k] = null);
};

// --- 🚀 時間防呆邏輯極簡化 (縮短了 150 行) ---
const MIN_DATE = new Date(2023, 0, 1).getTime(); // 2023-01-01
const getTodayStart = () => new Date().setHours(0, 0, 0, 0);

// 1. 日報 (限制 30 天，不可選未來)
const disableDailyStart = (ts) => ts < MIN_DATE || ts >= getTodayStart() || (dateState.end1 && (ts > new Date(dateState.end1).getTime() || ts < new Date(dateState.end1).getTime() - 30 * 86400000));
const disableDailyEnd = (ts) => ts < MIN_DATE || ts >= getTodayStart() || (dateState.start1 && (ts < new Date(dateState.start1).getTime() || ts > new Date(dateState.start1).getTime() + 30 * 86400000));

// 2. 週報 (限制只能選禮拜一，限制 4 週 / 27 天差)
const disableWeeklyStart = (ts) => {
  const d = new Date(ts);
  if (d.getDay() !== 1 || ts < MIN_DATE || ts >= getTodayStart()) return true;
  return dateState.end2 && (ts > new Date(dateState.end2).getTime() || ts < new Date(dateState.end2).getTime() - 27 * 86400000);
};
const disableWeeklyEnd = (ts) => {
  const d = new Date(ts);
  if (d.getDay() !== 1 || ts < MIN_DATE || ts >= getTodayStart()) return true;
  return dateState.start2 && (ts < new Date(dateState.start2).getTime() || ts > new Date(dateState.start2).getTime() + 27 * 86400000);
};

// 3. 月報 (限制 12 個月)
const disableMonthlyStart = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  if (d < MIN_DATE || d >= new Date(now.getFullYear(), now.getMonth(), 1)) return true;
  if (!dateState.end3) return false;
  const endD = new Date(dateState.end3);
  const monthDiff = (endD.getFullYear() - d.getFullYear()) * 12 + (endD.getMonth() - d.getMonth());
  return d > endD || monthDiff >= 12;
};
const disableMonthlyEnd = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  if (d < MIN_DATE || d >= new Date(now.getFullYear(), now.getMonth(), 1)) return true;
  if (!dateState.start3) return false;
  const startD = new Date(dateState.start3);
  const monthDiff = (d.getFullYear() - startD.getFullYear()) * 12 + (d.getMonth() - startD.getMonth());
  return d < startD || monthDiff >= 12;
};

// --- 表頭動態生成 ---
const columns = [
  "date", "責任區", "場站代號", "站名", "狀態", "項目",
  ...Array.from({ length: 24 }, (_, i) => `${i}`), // 0 ~ 23
  "總計"
];

const makeExecl = (nowdata, name) => {
  if (!nowdata || !nowdata.length) return errorAlert("空資料不能匯出");
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(nowdata, { skipHeader: true }); // 防止印出 item 屬性
  XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
  XLSX.utils.sheet_add_aoa(worksheet, [columns], { origin: "A1" });
  XLSX.writeFile(workbook, `${name}.xlsx`);
};

// --- API 請求與資料處理 ---
const getData = async () => {
  try {
    let catestart = null, cateend = null;
    if (itemcategory.value === "day_empty_full") {
      catestart = dateState.start1; cateend = dateState.end1;
    } else if (itemcategory.value === "weekly_empty_full") {
      catestart = dateState.start2; cateend = dateState.end2;
    } else if (itemcategory.value === "monthly_empty_full") {
      catestart = `${dateState.start3}-01`; cateend = `${dateState.end3}-01`;
    }

    isLoading.value = true;
    const params = {
      dataset_id: "data_analysis",
      table_id: itemcategory.value,
      begin_date: catestart,
      end_date: cateend,
      city: city.value,
      item: item.value,
      status: status.value,
      sys: sysCategory.value,
    };

    // 🚀 使用共用 API
    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

// 💡 🚀 透過迴圈動態產出 0~23 小時的資料，並加入穩定的日期轉換
    const formattedData = resdata.map(element => {
      let formattedDate = "";
      if (element.date) {
        const d = new Date(element.date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        formattedDate = `${year}-${month}-${day}`;
      }

      const row = {
        item1: formattedDate, // 🚀 改用格式化後的日期
        item2: element.responsible_area ?? "",
        item3: element.s_no ?? "",
        item4: element.s_name ?? "",
        item5: element.status ?? "",
        item6: element.item ?? "",
      };
      
      // 動態填寫 r0 到 r23
      for (let i = 0; i < 24; i++) {
        row[`item${i + 7}`] = element[`r${i}`] ?? 0;
      }
      row.item31 = element.total ?? 0;
      return row;
    });

    makeExecl(formattedData, "無車無位統計");

  } catch (error) {
    console.error("API Error:", error);
    errorAlert("查詢失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!itemcategory.value) return errorAlert("請選擇類別");
  if (!sysCategory.value) return errorAlert("請選擇系統別");
  if (!city.value.length) return errorAlert("請選擇城市");
  if (!item.value) return errorAlert("請選擇項目");
  if (!status.value.length) return errorAlert("請選擇狀態");

  if (itemcategory.value === "day_empty_full" && (!dateState.start1 || !dateState.end1)) return errorAlert("請選擇完整日期");
  if (itemcategory.value === "weekly_empty_full" && (!dateState.start2 || !dateState.end2)) return errorAlert("請選擇完整日期");
  if (itemcategory.value === "monthly_empty_full" && (!dateState.start3 || !dateState.end3)) return errorAlert("請選擇完整月份");

  getData();
};
</script>

<style scoped></style>