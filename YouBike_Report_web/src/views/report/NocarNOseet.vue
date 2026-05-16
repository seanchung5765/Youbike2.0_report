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

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">類別:</label>
        <div style="width: 100px;">
          <n-select v-model:value="itemcategory" :options="categoryOptions" @update:value="cleardateall" placeholder="請選擇" />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 160px;">
          <n-select v-model:value="city" multiple :options="cityOptions" :max-tag-count="1" placeholder="請選擇" />
        </div>
        <button type="button" class="btn btn-sm btn-success text-light" style="white-space: nowrap;" @click="searchcityall">
          全選
        </button>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">項目:</label>
        <div style="width: 140px;">
          <n-select v-model:value="item" :options="itemOptions" placeholder="請選擇" />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">狀態:</label>
        <div style="width: 100px;">
          <n-select v-model:value="status" multiple :options="statusOptions" :max-tag-count="1" placeholder="請選擇" />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <template v-if="itemcategory === 'day_empty_full'">
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.start1" type="date" value-format="yyyy-MM-dd" placeholder="開始日期" :is-date-disabled="disableDailyStart" clearable />
          </div>
          <span class="fw-bold">至</span>
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.end1" type="date" value-format="yyyy-MM-dd" placeholder="結束日期" :is-date-disabled="disableDailyEnd" clearable />
          </div>
        </template>

        <template v-else-if="itemcategory === 'weekly_empty_full'">
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.start2" type="date" value-format="yyyy-MM-dd" placeholder="週一開始" :is-date-disabled="disableWeeklyStart" clearable />
          </div>
          <span class="fw-bold">至</span>
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.end2" type="date" value-format="yyyy-MM-dd" placeholder="週一結束" :is-date-disabled="disableWeeklyEnd" clearable />
          </div>
        </template>

        <template v-else-if="itemcategory === 'monthly_empty_full'">
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.start3" type="month" value-format="yyyy-MM" placeholder="開始月份" :is-date-disabled="disableMonthlyStart" clearable />
          </div>
          <span class="fw-bold">至</span>
          <div style="width: 140px;">
            <n-date-picker v-model:formatted-value="dateState.end3" type="month" value-format="yyyy-MM" placeholder="結束月份" :is-date-disabled="disableMonthlyEnd" clearable />
          </div>
        </template>
        
        <button type="button" class="btn btn-sm btn-info text-light" style="white-space: nowrap;" @click="cleardateall">清空</button>
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-primary text-light" style="white-space: nowrap;" @click="search">
          搜尋匯出
        </button>
      </div>
    </form>

    <n-result class="mt-5" status="info" title="此頁面只供下載 EXCEL，無網頁資料表預覽"></n-result>
  </div>
</template>

<script setup>
import { ref, inject, reactive, onMounted } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
// 🚀 引入 NResult 提示框與 XLSX 下載工具
import { NDatePicker, NSelect, NResult } from "naive-ui";
import * as XLSX from "xlsx";
import { useUserStore } from "../../stores/userdata";
import { getGcpReport } from "@/api/report";
import { getAllCities } from "@/api/admin";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function errorAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const isLoading = ref(false);

const categoryOptions = [
  { label: "日報", value: "day_empty_full" },
  { label: "週報", value: "weekly_empty_full" },
  { label: "月報", value: "monthly_empty_full" }
];

const itemOptions = ["無車5分鐘", "無車10分鐘", "無車20分鐘", "無車30分鐘", "無位5分鐘", "無位10分鐘", "無位20分鐘", "無位30分鐘"].map(v => ({ label: v, value: v }));
const statusOptions = [{ label: "分鐘", value: "分鐘" }, { label: "次數", value: "次數" }];

const itemcategory = ref("day_empty_full");
const city = ref([]);
const item = ref(null);
const status = ref([]);

// 城市選單 (資料庫取得)
const cityOptions = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const dbCities = res.data.data || [];

    cityOptions.value = dbCities
      .filter(c => c.status === 'active')
      .map(c => ({
        label: c.city_name,
        value: c.city_name, 
        disabled: !canusecitys.includes(c.city_id)
      }));
  } catch (error) {
    console.error("載入縣市失敗:", error);
  }
};

const searchcityall = () => { 
  city.value = cityOptions.value.filter(c => !c.disabled).map(c => c.value); 
};

// --- 日期狀態集中管理 ---
const dateState = reactive({
  start1: null, end1: null, 
  start2: null, end2: null, 
  start3: null, end3: null  
});

const cleardateall = () => {
  Object.keys(dateState).forEach(k => dateState[k] = null);
};

// --- 時間防呆邏輯 ---
const MIN_DATE = new Date(2023, 0, 1).getTime(); 
const getTodayStart = () => new Date().setHours(0, 0, 0, 0);

const disableDailyStart = (ts) => ts < MIN_DATE || ts >= getTodayStart() || (dateState.end1 && (ts > new Date(dateState.end1).getTime() || ts < new Date(dateState.end1).getTime() - 30 * 86400000));
const disableDailyEnd = (ts) => ts < MIN_DATE || ts >= getTodayStart() || (dateState.start1 && (ts < new Date(dateState.start1).getTime() || ts > new Date(dateState.start1).getTime() + 30 * 86400000));

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

// --- 🚀 Excel 匯出邏輯 (一鍵自動下載) ---
const dynamicColumns = [
  "date", "責任區", "場站代號", "站名", "狀態", "項目",
  ...Array.from({ length: 24 }, (_, i) => `${i}`), 
  "總計"
];

const makeExecl = (nowdata, dynamicColumns, name) => {
  if (!nowdata || nowdata.length === 0) return errorAlert("查詢結果為空，無法匯出");
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(nowdata, { skipHeader: true }); // 跳過屬性名稱(item1, item2...)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  // 插入中文表頭
  XLSX.utils.sheet_add_aoa(worksheet, [dynamicColumns], { origin: "A1" });
  
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
      sys: "2.0", 
    };

    const res = await getGcpReport(params);
    const resdata = res.data?.data || [];

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
        item1: formattedDate, 
        item2: element.responsible_area ?? "",
        item3: element.s_no ?? "",
        item4: element.s_name ?? "",
        item5: element.status ?? "",
        item6: element.item ?? "",
      };
      
      for (let i = 0; i < 24; i++) {
        row[`item${i + 7}`] = element[`r${i}`] ?? 0;
      }
      row.item31 = element.total ?? 0;
      return row;
    });

    // 🚀 查完立刻自動觸發 Excel 下載
    makeExecl(formattedData, dynamicColumns, "無車無位統計");

  } catch (error) {
    console.error("API Error:", error);
    errorAlert("查詢或匯出失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!itemcategory.value) return errorAlert("請選擇類別");
  if (!city.value.length) return errorAlert("請選擇城市");
  if (!item.value) return errorAlert("請選擇項目");
  if (!status.value.length) return errorAlert("請選擇狀態");

  if (itemcategory.value === "day_empty_full" && (!dateState.start1 || !dateState.end1)) return errorAlert("請選擇完整日期");
  if (itemcategory.value === "weekly_empty_full" && (!dateState.start2 || !dateState.end2)) return errorAlert("請選擇完整日期");
  if (itemcategory.value === "monthly_empty_full" && (!dateState.start3 || !dateState.end3)) return errorAlert("請選擇完整月份");

  getData();
};

onMounted(() => {
  loadCities();
});
</script>

<style scoped>
/* 由於無資料表預覽，斑馬紋的 CSS 已移除，確保組件乾淨 */
</style>