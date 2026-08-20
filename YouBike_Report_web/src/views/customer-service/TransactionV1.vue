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
        <button type="button" class="btn btn-warning text-dark fw-bold" style="white-space: nowrap;" @click="saveAllRemarks">
          <i class="bi bi-save-fill me-1"></i>批次儲存
          <span v-if="unsavedCount > 0" class="badge bg-danger ms-1">{{ unsavedCount }}</span>
        </button>
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
          :scroll-x="1700" 
          style="height: 100%;"
          :class="{ 'dark-mode-table': ischange }"
          :row-class-name="rowClassName" 
        />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, h, computed } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
// 拿掉了用不到的 NButton 跟 NInputGroup，保持乾淨
import { NDataTable, NInput, NSelect } from "naive-ui"; 
import OutputExcel from "../../components/OutputExcel.vue";
import { getV1Transaction, updateV1TransactionRemark } from "@/api/report"; 

const ischange = inject("ischange");
const swal = inject("$swal");
const isLoading = ref(false);

const phoneValue = ref(""); 
const cardValue = ref(""); 
const stationValue = ref(null);

// 🚀 計算目前有幾筆未儲存的變更
const unsavedCount = computed(() => datatable.value.filter(r => r.isModified).length);

// 🚀 批次儲存所有有修改的備註
const saveAllRemarks = async () => {
  const unsavedRows = datatable.value.filter(r => r.isModified);
  
  if (unsavedRows.length === 0) {
    return swal({ icon: "info", title: "目前沒有未儲存的變更", showConfirmButton: false, timer: 1500 });
  }

  try {
    isLoading.value = true;
    
    // 平行發送所有修改過的 API
    const promises = unsavedRows.map(row => 
      updateV1TransactionRemark({
        ID: parseInt(row.id),
        remark: row.item_remark || ""
      })
    );
    
    await Promise.all(promises);

    // 儲存成功後，重置狀態
    unsavedRows.forEach(row => {
      row.original_remark = row.item_remark;
      row.isModified = false;
    });

    swal({
      toast: true, position: 'top-end', icon: 'success', 
      title: `成功儲存 ${unsavedRows.length} 筆資料`, 
      showConfirmButton: false, timer: 2000 
    });

  } catch (error) {
    console.error("批次儲存失敗:", error);
    swal({ icon: "error", title: "批次儲存發生錯誤", showConfirmButton: false, timer: 1500 });
  } finally {
    isLoading.value = false;
  }
};

// 🚀 防呆檢查：如果有未儲存資料，警告使用者
const checkUnsavedChanges = async () => {
  if (unsavedCount.value > 0) {
    const result = await swal({
      title: "注意！尚有未存檔的變更",
      text: `您有 ${unsavedCount.value} 筆繳費狀態尚未儲存，確定要放棄這些變更嗎？`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定放棄",
      cancelButtonText: "取消，我要先儲存"
    });
    return result.isConfirmed; // 如果點了確定放棄，回傳 true
  }
  return true; // 沒變更直接放行
};


const stationOptions = [
  { label: "9970", value: "9970" }
];

const datatable = ref([]);
const exceldata = ref([]);
const excelename = ref("1.0交易查詢");
const excelecolumn = ref([]);

const columns = ref([
  { key: "item2", align: "center", title: "借車時間", width: 150 }, 
  { key: "item5", align: "center", title: "借車場站", minWidth: 190 }, 
  { key: "item1", align: "center", title: "還車時間", width: 150 },
  { key: "item4", align: "center", title: "還車場站", minWidth: 180 },
  { key: "item9", align: "center", title: "外觀卡號", width: 150 },
  { key: "item7", align: "center", title: "自行車號", width: 160 },
  { key: "item17", align: "center", title: "扣款時間", width: 150 },
  { key: "item18", align: "center", title: "扣款場站", width: 75, 
  render(row) {
      if (row.isSpecial9970) {
        // 使用 h 函數渲染出帶有紅色樣式的 span
        return h('span', { style: 'color: red; font-weight: bold;' }, '9970');
      }
      return row.item18;
    }
  },

  { key: "item12", align: "center", title: "交易金額", width: 80 },
  { key: "item13", align: "center", title: "租借時間(分)", width: 90 },
  { key: "item15", align: "center", title: "手機號碼", width: 95 },
  
  // 👉 是否已繳費下拉選單
  { 
    key: "item_remark", 
    align: "center", 
    title: "是否已繳費", 
    width: 100, 
    render(row) {
      return h(NSelect, {
        value: row.item_remark,
        options: [{ label: "是", value: "是" }],
        placeholder: "請選擇",
        clearable: true,
        // 🚀 給予黃色外框提示
        status: row.isModified ? "warning" : undefined, 
        onUpdateValue(v) {
          row.item_remark = v;
          row.isModified = (row.item_remark !== row.original_remark);
        }
      });
    }
  }
]);

const clearForm = async () => {
  // 🚀 清空前先檢查是否有未存檔資料
  const canProceed = await checkUnsavedChanges();
  if (!canProceed) return;

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
  // 🚀 搜尋前先檢查是否有未存檔資料
  const canProceed = await checkUnsavedChanges();
  if (!canProceed) return;

  if (!phoneValue.value.trim()) {
    return swal({ icon: "error", title: "手機號碼為必填項目", showConfirmButton: false, timer: 1500 });
  }

  const currentStation = stationValue.value || "";

  try {
    isLoading.value = true;
    
    const params = {
      mem_id: phoneValue.value.trim(),
      card_no: cardValue.value.trim(),
      // 🚀 關鍵修改 1：故意傳空字串給後端，讓後端回傳所有資料，我們交給前端來「智慧過濾」
      paystatno: "" 
    };

    const res = await getV1Transaction(params);
    let resData = res.data?.data || []; 

    // 🚀 關鍵修改 2：前端智慧過濾邏輯
    if (currentStation !== "") {
      resData = resData.filter(item => {
        const station = (item['扣款場站'] || '').trim();
        const amount = Number(item['交易金額']) || 0;
        
        if (currentStation === '9970') {
          // 當搜尋 9970 時：保留原本就是 9970 的，以及「空白且金額大於0」的特殊紅字單
          return station === '9970' || (station === '' && amount > 0);
        }
        
        // 如果是搜尋其他場站，就照常比對
        return station === currentStation;
      });
    }

    let mappedData = resData.map((item, index) => {
      const item18 = (item['扣款場站'] || '').trim();
      const item12 = (item['交易金額'] === '' || item['交易金額'] == null) ? '0' : String(item['交易金額']);
      
      const isSpecial9970 = (item18 === '' && Number(item12) > 0);

      return {
        id: item['ID'] || item['id'] || null,
        item_remark: item['remark'] || item['備註'] || '',
        original_remark: item['remark'] || item['備註'] || '', // 紀錄原始值
        isModified: false, // 狀態預設為未修改
        item1: (item['還車時間'] || '').replace('+00', ''),
        item2: (item['借車時間'] || '').replace('+00', ''),
        item4: item['還車場站'] || '',
        item5: item['借車場站'] || '',
        item7: item['自行車號'] || '',
        item8: item['票卡種類'] || '',
        item9: item['外觀卡號'] || '',
        item11: item['費率'] || '',
        item12: item12,
        item13: item['租用(分)'] || '',
        item15: item['手機號碼'] || '',
        item17: (item['扣款時間'] || '').replace('+00', ''),
        item18: item18,
        isSpecial9970: isSpecial9970 // 記錄此筆資料是否要顯示紅色 9970
      };
    });

    mappedData.sort((a, b) => {
      if (a.item2 > b.item2) return -1; 
      if (a.item2 < b.item2) return 1;  
      return 0;
    });

    const seenCards = new Set();
    mappedData.forEach(row => {
      if (row.item9 && row.item9.trim() !== "") {
        if (!seenCards.has(row.item9)) {
          row.isLatest = true;       
          seenCards.add(row.item9);  
        } else {
          row.isLatest = false;
        }
      } else {
        row.isLatest = false;
      }
    });

    datatable.value = mappedData;

    exceldata.value = mappedData.map((row) => {
      const cleanRow = {};
      columns.value.forEach((col) => {
        if (col.key === "item18" && row.isSpecial9970) {
          cleanRow[col.title] = "9970";
        } else {
          cleanRow[col.title] = row[col.key]; 
        }
      });
      return cleanRow;
    });

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
  background-color: #ffd650fb !important; 
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