<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">1.0 交易查詢</h1>
    </div>

    <form
      @submit.prevent
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">手機號碼:</label>
        <div style="width: 200px;">
          <n-input 
            v-model:value="queryValue" 
            placeholder="請輸入手機號碼..." 
            clearable 
            @keyup.enter="search" 
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
          :max-height="600"
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
import { NDataTable, NInput } from "naive-ui"; 
import OutputExcel from "../../components/OutputExcel.vue";
import { getV1Transaction } from "@/api/report"; 

const ischange = inject("ischange");
const swal = inject("$swal");

const isLoading = ref(false);
const queryValue = ref(""); 
const datatable = ref([]);

const exceldata = ref([]);
const excelename = ref("1.0交易查詢");
const excelecolumn = ref([]);

// 🚀 依照表格建立完整欄位對應
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
  queryValue.value = "";
  datatable.value = [];
};

// 🚀 設定一灰一白的斑馬紋 class 判斷
const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'row-even' : 'row-odd';
};

// --- API 請求 ---
const search = async () => {
  if (!queryValue.value.trim()) {
    return swal({ icon: "error", title: "請輸入手機號碼", showConfirmButton: false, timer: 1500 });
  }

  try {
    isLoading.value = true;
    
    const params = {
      mem_id: queryValue.value.trim() 
    };

    const res = await getV1Transaction(params);
    const resData = res.data?.data || []; 
    
    if (resData.length > 0) {
      console.log("從後端代理拿回來的原始資料:", resData[0]);
    }

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

    datatable.value = mappedData;

    exceldata.value = [...datatable.value];
    excelecolumn.value = columns.value.map(c => c.title);

    if (datatable.value.length === 0) {
       swal({ icon: "warning", title: "查無此交易紀錄", showConfirmButton: false, timer: 1500 });
    }

  } catch (error) {
    console.error("API 查詢失敗:", error);
    swal({ icon: "error", title: "查詢失敗，請確認連線或權限", showConfirmButton: false, timer: 1500 });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 讓表格內容可以自動換行 */
:deep(.n-data-table-td) {
  white-space: normal !important; 
  word-break: break-word;         
}

/* 🚀 亮色模式 (預設)：一白一淺灰 */
:deep(.row-even td) {
  background-color: #ffffff !important;
}
:deep(.row-odd td) {
  background-color: #e8e8e8 !important; 
}
:deep(.n-data-table-tr:hover td) {
  background-color: #e6f7ff !important; /* 滑鼠 Hover 時的水藍色回饋 */
}

/* 🚀 暗色模式：一深黑一淺黑 */
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