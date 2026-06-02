<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">票卡資料維護1.0</h1>
    </div>

    <form
      @submit.prevent
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 12px; overflow-x: auto;"
    >
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 6px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">手機號碼:</label>
        <div style="width: 140px;">
          <n-input 
            v-model:value="phoneValue" 
            placeholder="選填..." 
            clearable 
            @keyup.enter="search" 
          />
        </div>
      </div>

      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px; border-left: 2px solid #ccc; padding-left: 12px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">外觀卡號:</label>
        <div style="width: 200px;">
          <n-input 
            v-model:value="cardValue" 
            placeholder="選填..." 
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
          :scroll-x="1500" 
          :bordered="false"
          :single-line="false"
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
import { getV1Cards } from "../../api/report"; 

const ischange = inject("ischange");
const swal = inject("$swal");

const isLoading = ref(false);
const phoneValue = ref(""); 
const cardValue = ref("");
const datatable = ref([]);

const exceldata = ref([]);
const excelename = ref("1.0卡片查詢");
const excelecolumn = ref([]);

const columns = ref([
  { key: "item1", align: "center", title: "行動電話", width: 110 }, 
  { key: "item2", align: "center", title: "使用者帳號", minWidth: 200 }, 
  { key: "item3", align: "center", title: "外觀卡號", width: 160 },
  { key: "item4", align: "center", title: "晶片號碼", minWidth: 220 }, 
  { key: "item5", align: "center", title: "註冊時間", width: 160 },
  { key: "item6", align: "center", title: "停用時間", width: 160 },
  { key: "item7", align: "center", title: "加保時間", width: 160 },
  { key: "item8", align: "center", title: "退保時間", width: 160 },
  { key: "item9", align: "center", title: "註記", minWidth: 100 },
  { key: "item10", align: "center", title: "卡片狀態", minWidth: 100 }
]);

const clearForm = () => {
  phoneValue.value = "";
  cardValue.value = "";
  datatable.value = [];
};

const rowClassName = (row, index) => {
  return index % 2 === 0 ? 'row-even' : 'row-odd';
};

// --- API 請求 ---
const search = async () => {
  const searchPhone = (phoneValue.value || "").trim();
  const searchCard = (cardValue.value || "").trim();

  // 🚀 關鍵防呆：改成「至少輸入一項查詢條件」，保護 DB 不被全表掃描
  if (!searchPhone && !searchCard) {
    return swal({ icon: "warning", title: "請至少輸入一項查詢條件", showConfirmButton: false, timer: 1500 });
  }

  try {
    isLoading.value = true;
    
    const res = await getV1Cards({ 
      mem_id: searchPhone,
      card_no: searchCard
    });
    
    const resData = res.data?.data || []; 

    let mappedData = resData.map((item) => ({
      item1: item['行動電話'] || '',
      item2: item['使用者帳號'] || '',
      item3: item['外觀卡號'] || '',
      item4: item['晶片號碼'] || '',
      item5: (item['註冊時間'] || '').replace('+00', ''),
      item6: (item['停用時間'] || '').replace('+00', ''),
      item7: (item['加保時間'] || '').replace('+00', ''),
      item8: (item['退保時間'] || '').replace('+00', ''),
      item9: item['註記'] || '',
      item10: item['卡片狀態'] || '',
    }));

    datatable.value = mappedData;

    exceldata.value = [...datatable.value];
    excelecolumn.value = columns.value.map(c => c.title);

    if (datatable.value.length === 0) {
       swal({ icon: "warning", title: "查無此卡片紀錄", showConfirmButton: false, timer: 1500 });
    }

  } catch (error) {
    console.error("卡片 API 查詢失敗:", error);
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

/* 一灰一白的 CSS 設定 */
:deep(.row-even td) {
  background-color: #ffffff !important; 
}
:deep(.row-odd td) {
  background-color: #e8e8e8 !important; 
}
:deep(.n-data-table-tr:hover td) {
  background-color: #e6f7ff !important; 
}

/* 深色模式適配 */
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