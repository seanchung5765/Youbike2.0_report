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

    <div style="height: calc(100vh - 180px); padding-bottom: 10px; margin-top: 10px;">
      <n-data-table
        v-show="totaldata.length > 0 && Object.keys(totaldata[0]).length > 0"
        ref="dataTable"
        size="small"
        :columns="columns"
        :data="totaldata"
        :row-class-name="rowClassName"
        :pagination="{ pageSize: 100 }"
        :scroll-x="1000"
        :bordered="false"
        :single-line="false"
        striped
        flex-height
        style="height: 100%;"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from "vue";
import { useUserStore } from "../../stores/userdata";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import OutputExcel from "../../components/OutputExcel.vue";
import { NDataTable, NDatePicker, NSelect } from "naive-ui";

import { getGcpReport } from "@/api/report"; 
import { getAllCities } from "@/api/admin"; 

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

const starttimestamp = ref(null);
const endtimestamp = ref(null);
const category = ref(null); 
const city = ref(null); 
const isLoading = ref(false);
const dataTable = ref(null);
const totaldata = ref([]);
const columns = ref([]);

const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

const sysOptions = ref([
  { label: '2.0', value: 'daily_report_query2' },
  { label: '2.0E', value: 'daily_report_query2E' }
]);

const dbCities = ref([]);

const loadCities = async () => {
  try {
    const res = await getAllCities();
    const data = res.data.data || [];
    dbCities.value = data.filter(c => c.status === 'active' && canusecitys.includes(c.city_id));
  } catch (error) {
    console.error("載入縣市失敗:", error);
  }
};

// 🚀 終極防呆版城市轉換邏輯
const availableCityOptions = computed(() => {
  if (!category.value) return [];
  
  const suffix = category.value === 'daily_report_query2' ? '2' : '2E';

  return dbCities.value.map(c => {
    // 1. 抓出字串 (防呆處理逗號分隔的情況)
    let rawCode = c.codes ? c.codes.split(',')[0].trim() : '';
    
    // 2. 把字串洗乾淨：不管資料庫存的是 Taipei 還是 Taipei2E，強制移除結尾的 2 或 2E (i代表不分大小寫)
    let cleanBaseCode = rawCode.replace(/2E$/i, '').replace(/2$/i, '');
    
    return {
      label: c.city_name,
      value: cleanBaseCode + suffix // 3. 確保一定是乾淨的 Base + 正確的 Suffix (保證產出 Taipei2 或 Taipei2E)
    };
  }).filter(c => c.value !== '2' && c.value !== '2E'); // 避免空字串變成純後綴
});

onMounted(() => {
  loadCities();
});

const NotCityAlert = (text) => {
  swal({ icon: "error", title: text, showConfirmButton: false, timer: 1500 });
};

const cleardate = () => {
  starttimestamp.value = null;
  endtimestamp.value = null;
};

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

const rowClassName = (row, index) => {
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
  
  return index % 2 === 1 ? 'gray-row' : '';
};

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
    const resdata = res.data?.data || [];
    
    // 🚀 防呆機制：如果 GCP 真的找不到這幾天的資料，給予提示並中斷，避免 Vue 報錯白畫面
    if (resdata.length === 0) {
      totaldata.value = [];
      NotCityAlert("該區間查無資料");
      return;
    }

    makecol(resdata);

    const columnLength = resdata[0].length - 3;
    const transposedData = Array.from({ length: columnLength }, () => ({}));

    resdata.forEach((items, colIndex) => {
      items.forEach((item, rowIndex) => {
        if (rowIndex < 3) return; 
        transposedData[rowIndex - 3][`item${colIndex + 1}`] = item;
      });
    });

    totaldata.value = transposedData;
    makeExecl(totaldata.value, columns.value, "營運管理日報");

    if (dataTable.value?.page) dataTable.value.page(1);

  } catch (error) {
    console.error("獲取日報資料失敗:", error);
    NotCityAlert("資料載入失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

const search = () => {
  if (!category.value) return NotCityAlert("請選擇系統");
  if (!city.value) return NotCityAlert("請選擇城市");
  if (!starttimestamp.value) return NotCityAlert("請選擇開始日期");
  if (!endtimestamp.value) return NotCityAlert("請選擇結束日期");
  
  getData();
};
</script>

<style scoped>
/* 🚀 灰色行的背景顏色 (#e8e8e8) */
:deep(.gray-row td) {
  background-color: #e8e8e8 !important;
}

/* 斑馬紋滑鼠經過高亮 */
:deep(.n-data-table .n-data-table-tr.gray-row:hover td) {
  background-color: #d1d1d1 !important;
}

/* 🚀 這是你原本寫在 JS 的 too-old (分類大標題高亮) */
:deep(.too-old td) {
  background-color: #ffe699 !important; /* 給個明顯的黃色系背景突顯大標題 */
  font-weight: bold !important;
}

:deep(.n-data-table .n-data-table-tr.too-old:hover td) {
  background-color: #ffd966 !important;
}



</style>