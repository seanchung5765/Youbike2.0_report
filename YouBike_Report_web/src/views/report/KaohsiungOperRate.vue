<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">高雄2.0E可用率</h1>
    </div>

    <form
      class="mx-0 py-3 px-3 d-flex align-items-center gap-3 overflow-x-auto"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="d-flex align-items-center flex-shrink-0">
        <label class="fw-bolder mb-0 me-2">報表類型:</label>
        <div style="width: 150px;">
          <n-select v-model:value="tableType" :options="typeOptions" />
        </div>
      </div>

      <div class="d-flex align-items-center flex-shrink-0 border-start ps-3">
        <label class="fw-bolder mb-0 me-2">查詢區間:</label>
        <div style="width: 140px;">
          <n-date-picker v-model:formatted-value="beginDate" type="date" value-format="yyyy-MM-dd" placeholder="開始日期" :is-date-disabled="disableDate" />
        </div>
        <span class="fw-bold mx-2">至</span>
        <div style="width: 140px;">
          <n-date-picker v-model:formatted-value="endDate" type="date" value-format="yyyy-MM-dd" placeholder="結束日期" :is-date-disabled="disableDate" />
        </div>
      </div>

      <div class="d-flex gap-2 ms-auto flex-shrink-0">
        <button type="button" class="btn btn-info text-light fw-bold text-nowrap" @click="clearForm">清空</button>
        <button type="button" class="btn btn-success text-light fw-bold text-nowrap" @click="search">搜尋</button>
        <output-excel class="btn btn-primary text-light fw-bold text-nowrap" :data="exceldata" :name="excelename" :header="excelecolumn" />
      </div>
    </form>

    <div style="height: calc(100vh - 180px); padding-bottom: 10px; margin-top: 10px;">
      <n-data-table
        v-show="datatable.length > 0"
        size="small"
        :data="datatable"
        :columns="columns"
        :bordered="false"
        striped
        flex-height
        :pagination="{ pageSize: 100 }"
        style="height: 100%;"
        :class="{ 'dark-mode-table': ischange }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, watch } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable, NSelect, NDatePicker } from "naive-ui"; 
import OutputExcel from "../../components/OutputExcel.vue";
import { getKaohsiungOperRate } from "@/api/report"; 

const ischange = inject("ischange");
const swal = inject("$swal");
const isLoading = ref(false);

const tableType = ref("總表");
const beginDate = ref(null); 
const endDate = ref(null); 

const typeOptions = [
  { label: "總表", value: "總表" },
  { label: "明細", value: "明細" }
];

const datatable = ref([]);
const columns = ref([]);
const exceldata = ref([]);
const excelename = ref("");
const excelecolumn = ref([]);

// 若切換類型，就清空下方舊表單
watch(tableType, () => {
  datatable.value = [];
  exceldata.value = [];
});

const getTodayStart = () => new Date().setHours(0, 0, 0, 0);
const disableDate = (ts) => ts >= getTodayStart();

const clearForm = () => {
  beginDate.value = null;
  endDate.value = null;
  datatable.value = [];
};

const search = async () => {
  if (!beginDate.value || !endDate.value) {
    return swal({ icon: "warning", title: "請選擇完整查詢區間", showConfirmButton: false, timer: 1500 });
  }

  try {
    isLoading.value = true;
    const params = {
      table_type: tableType.value,
      begin_date: beginDate.value,
      end_date: endDate.value
    };

    const res = await getKaohsiungOperRate(params);
    const rawData = res.data?.data || []; 

    if (rawData.length === 0) {
      datatable.value = [];
      return swal({ icon: "info", title: "查無資料", showConfirmButton: false, timer: 1500 });
    }

    // 🚀 動態切換表頭與資料 Mapping (使用 col_ 前綴防錯位)
    if (tableType.value === '總表') {
      columns.value = [
        { key: "col_date", title: "日期", align: "center", width: 150 },
        { key: "col_hour", title: "時段", align: "center", width: 100 },
        { key: "col_count", title: "2.0E低電量禁用車數", align: "center", width: 200 },
        { key: "col_min", title: "2.0E低電量禁用分鐘數", align: "center", width: 220 },
        { key: "col_rate", title: "可用率", align: "center", width: 150 }
      ];
      datatable.value = rawData.map(item => ({
        col_date: item['日期'], col_hour: item['時段'], 
        col_count: item['2.0E低電量禁用車數'], col_min: item['2.0E低電量禁用分鐘數'], col_rate: item['可用率']
      }));
    } else {
      columns.value = [
        { key: "col_date", title: "日期", align: "center", width: 150 },
        { key: "col_asset", title: "車號", align: "center", width: 150 },
        { key: "col_hour", title: "時段", align: "center", width: 100 },
        { key: "col_sec", title: "持續秒數", align: "center", width: 150 },
        { key: "col_min", title: "持續分鐘數", align: "center", width: 150 }
      ];
      datatable.value = rawData.map(item => ({
        col_date: item['日期'], col_asset: item['車號'], col_hour: item['時段'], 
        col_sec: item['持續秒數'], col_min: item['持續分鐘數']
      }));
    }

    // 產生 Excel
    exceldata.value = datatable.value.map((row) => {
      const cleanRow = {};
      columns.value.forEach((col) => { cleanRow[col.title] = row[col.key]; });
      return cleanRow;
    });

    excelename.value = `高雄2.0E可用率_${tableType.value}_${beginDate.value}至${endDate.value}`;
    excelecolumn.value = columns.value.map(c => c.title);

  } catch (error) {
    swal({ icon: "error", title: "查詢失敗", showConfirmButton: false, timer: 1500 });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
:deep(.n-data-table-td) { white-space: normal !important; word-break: break-word; }
:deep(.n-data-table-tr:nth-child(even) td) { background-color: #f9f9f9 !important; }
:deep(.n-data-table-tr:nth-child(odd) td) { background-color: #ffffff !important; }
:deep(.n-data-table-tr:hover td) { background-color: #e6f7ff !important; }

/* 支援深色模式 */
:deep(.dark-mode-table .n-data-table-tr:nth-child(even) td) { background-color: #18181c !important; }
:deep(.dark-mode-table .n-data-table-tr:nth-child(odd) td) { background-color: #2c2c32 !important; }
:deep(.dark-mode-table .n-data-table-tr:hover td) { background-color: #3b3b45 !important; }
</style>