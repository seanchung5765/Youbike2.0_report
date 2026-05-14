<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">營運管理日報</h1>
    </div>

    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">系統別:</label>
        <div style="width: 120px;">
          <n-select
            v-model:value="category"
            :options="sysOptions"
            @update:value="city = null"
            placeholder="請選擇"
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 140px;">
          <n-select
            v-model:value="city"
            :options="availableCityOptions"
            placeholder="請選擇"
          />
        </div>
      </div>

      <div style="width: 160px; flex-shrink: 0;">
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

      <div style="width: 160px; flex-shrink: 0;">
        <n-date-picker
          v-model:formatted-value="endtimestamp"
          type="date"
          :actions="null"
          :input-readonly="true"
          :is-date-disabled="disableEndDate"
          :update-value-on-close="true"
          placeholder="結束日期"
          value-format="yyyy-MM-dd"
        />
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0;">
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
      v-show="'item2' in totaldata[0]"
      ref="dataTable"
      size="small"
      :columns="columns"
      :data="totaldata"
      :row-class-name="rowClassName"
      :pagination="{ pageSize: 100 }"
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
import { useUserStore } from "../../stores/userdata";
import { getGcpReport } from "@/api/report"; 
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import OutputExcel from "../../components/OutputExcel.vue";
// 🚀 修正 1：補上 NSelect
import { NDataTable, NDatePicker, NSelect } from "naive-ui"; 

const store = useUserStore();
const canusecitys = store.citys;
const ischange = inject("ischange");
const swal = inject("$swal");

// --- 狀態管理 ---
const starttimestamp = ref(null);
const endtimestamp = ref(null);
// 🚀 修正 2：n-select 的預設值必須是 null 才能顯示 placeholder
const category = ref(null); 
const city = ref(null); 
const isLoading = ref(false);
const dataTable = ref(null);
const totaldata = ref([{}]);
const columns = ref([]);

// 🚀 修正 3：必須使用 ref，否則傳遞給 OutputExcel 的資料不會更新
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// 🚀 修正 4：補上消失的系統別選項
const sysOptions = ref([
  { label: '1.0', value: 'daily_report_query1' },
  { label: '2.0', value: 'daily_report_query2' },
  { label: '2.0E', value: 'daily_report_query2E' }
]);

const cityMappingConfig = {
  daily_report_query1: [
    { value: "Taipei", auth: 2, label: "台北市" },
    { value: "Newtaipei", auth: 3, label: "新北市" },
    { value: "Taoyuan", auth: 4, label: "桃園市" },
    { value: "Hsinchu", auth: 5, label: "新竹市" },
    { value: "Miaoli", auth: 7, label: "苗栗縣" },
    { value: "Taichung", auth: 8, label: "台中市" },
  ],
  daily_report_query2: [
    { value: "Taipei2", auth: 2, label: "台北市" },
    { value: "Newtaipei2", auth: 3, label: "新北市" },
    { value: "Taoyuan2", auth: 4, label: "桃園市" },
    { value: "Hsinchu2", auth: 5, label: "新竹市" },
    { value: "Hsinchu_Country2", auth: 6, label: "新竹縣" },
    { value: "HsinchuScience2", auth: 20, label: "竹科" },
    { value: "Miaoli2", auth: 7, label: "苗栗縣" },
    { value: "Taichung2", auth: 8, label: "台中市" },
    { value: "Chiayi2", auth: 12, label: "嘉義市" },
    { value: "Chiayi_Country2", auth: 13, label: "嘉義縣" },
    { value: "Tainan2", auth: 14, label: "台南市" },
    { value: "Kaohsiung2", auth: 15, label: "高雄市" },
    { value: "Pingtung2", auth: 16, label: "屏東縣" },
    { value: "Taitung2", auth: 19, label: "台東縣" },
  ],
  daily_report_query2E: [
    { value: "Taipei2E", auth: 2, label: "台北市" },
    { value: "Newtaipei2E", auth: 3, label: "新北市" },
    { value: "Taoyuan2E", auth: 4, label: "桃園市" },
    { value: "Hsinchu_Country2E", auth: 6, label: "新竹縣" },
    { value: "HsinchuScience2E", auth: 20, label: "竹科" },
    { value: "Miaoli2E", auth: 7, label: "苗栗縣" },
    { value: "Taichung2E", auth: 8, label: "台中市" },
    { value: "Chiayi2E", auth: 12, label: "嘉義市" },
    { value: "Chiayi_Country2E", auth: 13, label: "嘉義縣" },
    { value: "Tainan2E", auth: 14, label: "台南市" },
    { value: "Kaohsiung2E", auth: 15, label: "高雄市" },
    { value: "Pingtung2E", auth: 16, label: "屏東縣" },
    { value: "Taitung2E", auth: 19, label: "台東縣" },
  ],
};

// 動態過濾城市選項 (因應 category 預設值改為 null，判斷式同步更新)
const availableCityOptions = computed(() => {
  if (!category.value || !cityMappingConfig[category.value]) return [];
  return cityMappingConfig[category.value].filter(option => canusecitys.includes(option.auth));
});

// --- UI 輔助方法 ---
const NotCityAlert = (text) => {
  swal({ icon: "error", title: text, showConfirmButton: false, timer: 1500 });
};

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

// --- 日期選擇器限制 ---
const getMidnightDate = (dateString) => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
};

const disablestartDate = (ts) => {
  const currentDate = getMidnightDate(new Date());
  const selectedDate = getMidnightDate(ts);

  if (endtimestamp.value) {
    const endDate = getMidnightDate(endtimestamp.value);
    const startDateLimit = new Date(endDate);
    startDateLimit.setDate(startDateLimit.getDate() - 30);
    return selectedDate < startDateLimit || selectedDate > endDate || selectedDate >= currentDate;
  }
  return selectedDate >= currentDate;
};

const disableEndDate = (ts) => {
  const currentDate = getMidnightDate(new Date());
  const selectedDate = getMidnightDate(ts);

  if (starttimestamp.value) {
    const startDate = getMidnightDate(starttimestamp.value);
    if (startDate > currentDate) return true;

    const endDateLimit = new Date(startDate);
    endDateLimit.setDate(endDateLimit.getDate() + 30);
    return selectedDate < startDate || selectedDate > endDateLimit || selectedDate >= currentDate;
  }
  return selectedDate >= currentDate;
};

// --- 表格與 Excel 生成 ---
const makeExecl = (nowdata, nowcolumn, name) => {
  exceldata.value = [...nowdata];
  excelename.value = name;
  excelecolumn.value = nowcolumn.map(item => item.title);
};

const makecol = (data) => {
  columns.value = data.map((item, index) => ({
    key: `item${index + 1}`,
    align: "center",
    title: item[2],
    ...(index === 0 ? { fixed: "left", width: 150 } : {})
  }));
};

const getData = async () => {
  const params = {
    dataset_id: "report",
    table_id: category.value,
    begin_date: starttimestamp.value,
    end_date: endtimestamp.value,
    city: [city.value],
  };

  try {
    isLoading.value = true;
    const res = await getGcpReport(params);
    const resdata = res.data.data;
    
    makecol(resdata);

    // 資料轉置：略過每個陣列的前三個元素 (index 0, 1, 2)
    const columnLength = resdata[0].length - 3;
    const transposedData = Array.from({ length: columnLength }, () => ({}));

    resdata.forEach((items, colIndex) => {
      items.forEach((item, rowIndex) => {
        if (rowIndex < 3) return; // 跳過不需要的屬性
        transposedData[rowIndex - 3][`item${colIndex + 1}`] = item;
      });
    });

    totaldata.value = transposedData;
    makeExecl(totaldata.value, columns.value, "營運管理日報");

  } catch (error) {
    console.error("獲取日報資料失敗:", error);
    NotCityAlert("資料載入失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  // 因應預設值為 null，驗證邏輯同步更新
  if (!category.value) return NotCityAlert("請選擇系統");
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!starttimestamp.value) return NotCityAlert("請選擇開始日期");
  if (!endtimestamp.value) return NotCityAlert("請選擇結束日期");
  
  getData();
};

const rowClassName = (row) => {
  const highlightItems = [
    "場站資訊", "租借資訊", "收入資訊", "妥善率資訊", "票卡資訊", 
    "各時段使用資訊", "租賃收入明細", "營運資訊", "租賃時間使用資訊", 
    "調度管理", "騎乘距離分析", "維護管理"
  ];
  
  if (
    highlightItems.includes(row.item1) ||
    (row.item1 === "當日租借車次" && !row.item2) ||
    (row.item1 === "註冊票卡淨增加數" && !row.item2 && row.item2 !== 0)
  ) {
    return "too-old";
  }
};
</script>