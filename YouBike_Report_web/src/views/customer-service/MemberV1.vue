<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">1.0 會員查詢</h1>
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
        <div style="width: 200px;">
          <n-input 
            v-model:value="phoneValue" 
            placeholder="請輸入會員手機..." 
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
import { getV1Member } from "../../api/report"; 

const ischange = inject("ischange");
const swal = inject("$swal");

const isLoading = ref(false);
const phoneValue = ref(""); 
const datatable = ref([]);

const exceldata = ref([]);
const excelename = ref("1.0會員查詢");
const excelecolumn = ref([]);

// 精準對齊 Jack 的三個中文欄位
const columns = ref([
  { key: "item1", align: "center", title: "會員編號", minWidth: 150 }, 
  { key: "item2", align: "center", title: "姓名", minWidth: 150 }, 
  { key: "item3", align: "center", title: "行動電話", minWidth: 150 },
  { key: "item4", align: "center", title: "備註", minWidth: 150 }
]);

const clearForm = () => {
  phoneValue.value = "";
  datatable.value = [];
};

const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'row-even' : 'row-odd';
};

// --- API 請求 ---
const search = async () => {
  // 🚀 優化防呆：先安全地拿到乾淨的手機號碼字串，防止後面呼叫 .trim() 噴錯
  const searchPhone = (phoneValue.value || "").trim();

  if (!searchPhone) {
    return swal({ icon: "error", title: "請輸入手機號碼", showConfirmButton: false, timer: 1500 });
  }

  try {
    isLoading.value = true;
    
    // 🚀 修正：刪除沒用到的常數宣告，並直接共用 searchPhone 變數
    const res = await getV1Member({ mem_id: searchPhone });
    const resData = res.data?.data || []; 
    
    // 100% 精準對應 Jack 的 Python 回傳中文欄位名
    let mappedData = resData.map((item) => ({
      item1: item['會員編號'] || '',
      item2: item['姓名'] || '',
      item3: item['行動電話'] || '',
      item4: item['備註'] || item['remark'] || item['memo'] || '',
    }));

    datatable.value = mappedData;

    exceldata.value = [...datatable.value];
    excelecolumn.value = columns.value.map(c => c.title);

    if (datatable.value.length === 0) {
       swal({ icon: "warning", title: "查無此會員紀錄", showConfirmButton: false, timer: 1500 });
    }

  } catch (error) {
    console.error("會員 API 查詢失敗:", error);
    swal({ icon: "error", title: "查詢失敗，請確認連線或權限", showConfirmButton: false, timer: 1500 });
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
:deep(.row-odd td) {
  background-color: #e8e8e8 !important; 
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