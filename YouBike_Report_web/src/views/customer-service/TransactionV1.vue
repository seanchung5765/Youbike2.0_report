<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">會員交易查詢1.0</h1>
    </div>

    <form
      @submit.prevent
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 6px;">
        <span class="text-danger fw-bold">*</span>
        <label class="fw-bolder mb-0" style="white-space: nowrap;">手機號碼:</label>
        <div style="width: 140px;">
          <n-input 
            v-model:value="phoneValue" 
            placeholder="必填..." 
            clearable 
            @keyup.enter="search" 
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">卡號:</label>
        <div style="width: 150px;">
          <n-input 
            v-model:value="cardValue" 
            placeholder="選填..." 
            clearable 
            @keyup.enter="search" 
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">扣款場站:</label>
        <div style="width: 150px;">
          <n-select 
            v-model:value="stationValue" 
            :options="stationOptions" 
            placeholder="選填..." 
            clearable 
          />
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex-shrink: 0; margin-left: auto;">
        <button type="button" class="btn btn-info text-light" style="white-space: nowrap;" @click="clearForm">清空</button>
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

    <div style="height: calc(100vh - 180px); padding-bottom: 10px; margin-top: 10px;">
        <n-data-table
          v-show="datatable.length > 0"
          size="small"
          ref="dataTableRef"
          :data="datatable"
          :columns="columns"
          :max-height="2000"
          :bordered="false"
          :single-line="false"
          striped
          flex-height
          style="height: 100%;"
          :class="{ 'dark-mode-table': ischange }"
          :row-class-name="rowClassName" 
        />
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
// 🚀 關鍵修正 1：把 NSelect 加回 import 中
import { NDataTable, NInput, NSelect } from "naive-ui"; 
import OutputExcel from "../../components/OutputExcel.vue";
import { getV1Transaction } from "@/api/report"; 

const ischange = inject("ischange");
const swal = inject("$swal");

const isLoading = ref(false);

const phoneValue = ref(""); 
const cardValue = ref(""); 
const stationValue = ref(null); // 🚀 下拉選單預設給 null

// 🚀 關鍵修正 2：定義扣款場站的下拉選單選項
const stationOptions = [
  { label: "9970", value: "9970" }
];

const datatable = ref([]);

const exceldata = ref([]);
const excelename = ref("1.0交易查詢");
const excelecolumn = ref([]);

const columns = ref([
  { key: "item2", align: "center", title: "借車時間", width: 165 }, 
  { key: "item5", align: "center", title: "借車場站", minWidth: 190 }, 
  { key: "item1", align: "center", title: "還車時間", width: 165 },
  { key: "item4", align: "center", title: "還車場站", minWidth: 180 },
  { key: "item9", align: "center", title: "外觀卡號", width: 150 },
  { key: "item7", align: "center", title: "自行車號", width: 160 },
  { key: "item17", align: "center", title: "扣款時間", width: 165 },
  { key: "item18", align: "center", title: "扣款場站", width: 80 },
  { key: "item12", align: "center", title: "交易金額", width: 80 },
  { key: "item13", align: "center", title: "租借時間(分)", width: 90 },
  { key: "item15", align: "center", title: "手機號碼", width: 110 }
]);

const clearForm = () => {
  phoneValue.value = "";
  cardValue.value = "";
  stationValue.value = null;
  datatable.value = [];
};

const rowClassName = (row, index) => {
  if (row.isLatest) {
    return 'row-highlight'; 
  }
  return index % 2 === 0 ? 'row-even' : 'row-odd';
};

// --- API 請求 ---
const search = async () => {
  // 防呆邏輯 1：手機號碼必填
  if (!phoneValue.value.trim()) {
    return swal({ icon: "error", title: "手機號碼為必填項目", showConfirmButton: false, timer: 1500 });
  }

  // 🚀 關鍵修正 3：因為下拉選單沒選時是 null，直接拿 value 判斷，避免呼叫 .trim() 報錯
  const currentStation = stationValue.value || "";

  try {
    isLoading.value = true;
    
    const params = {
      mem_id: phoneValue.value.trim(),
      card_no: cardValue.value.trim(),
      paystatno: currentStation
    };

    const res = await getV1Transaction(params);
    const resData = res.data?.data || []; 

    let mappedData = resData.map((item, index) => ({
      item1: (item['還車時間'] || '').replace('+00', ''),
      item2: (item['借車時間'] || '').replace('+00', ''),
      item4: item['還車場站'] || '',
      item5: item['借車場站'] || '',
      item7: item['自行車號'] || '',
      item8: item['票卡種類'] || '',
      item9: item['外觀卡號'] || '',
      item11: item['費率'] || '',
      item12: (item['交易金額'] === '' || item['交易金額'] == null) ? '0' : item['交易金額'],
      item13: item['租用(分)'] || '',
      item15: item['手機號碼'] || '',
      item17: (item['扣款時間'] || '').replace('+00', ''),
      item18: item['扣款場站'] || ''
    }));

    mappedData.sort((a, b) => {
      if (a.item2 > b.item2) return -1; 
      if (a.item2 < b.item2) return 1;  
      return 0;
    });

    const seenCards = new Set();
    mappedData.forEach(row => {
      // 確保有卡號才做紀錄，避免空卡號互相干擾
      if (row.item9 && row.item9.trim() !== "") {
        if (!seenCards.has(row.item9)) {
          row.isLatest = true;       // 第一次遇到這個卡號，標記為最新
          seenCards.add(row.item9);  // 把這張卡號記進黑名單，之後遇到的都不算最新
        } else {
          row.isLatest = false;
        }
      } else {
        row.isLatest = false;
      }
    });

    datatable.value = mappedData;

    exceldata.value = [...datatable.value];
    excelecolumn.value = columns.value.map(c => c.title);

    if (datatable.value.length === 0) {
       swal({ icon: "warning", title: "查無此交易紀錄", showConfirmButton: false, timer: 1500 });
    }

  } catch (error) {
    console.error("API 查詢失敗:", error);
    swal({ icon: "error", title: "查詢失敗，請確認連線或參數", showConfirmButton: false, timer: 1500 });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
:deep(.n-data-table-td) {
  white-space: normal !important; 
  word-break: break-word;         
}

:deep(.row-even td) {
  background-color: #ffffff !important;
}

:deep(.row-highlight td) {
  background-color: #ffd650fb !important; /* 你可以改成你喜歡的黃色，例如 #ffffb3 */
}
:deep(.n-data-table-tr:hover td) {
  background-color: #e6f7ff !important; 
}

:deep(.dark-mode-table .row-even td) {
  background-color: #18181c !important; 
}
:deep(.dark-mode-table .row-odd td) {
  background-color: #2c2c32 !important; 
}
:deep(.dark-mode-table .n-data-table-tr:hover td) {
  background-color: #3b3b45 !important; 
}
</style>