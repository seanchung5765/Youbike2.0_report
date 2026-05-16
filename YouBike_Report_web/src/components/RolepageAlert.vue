<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="false"
    :is-full-page="true"
  />
  <n-modal v-model:show="props.isopen" :mask-closable="false">
    <n-card style="max-width: 650px; width: 95vw;" preset="card" :title="props.title">
      <div>
        <n-form>
          <n-form-item label="角色名稱">
            <n-input
              placeholder="請輸入角色名稱"
              :value="props.rolename"
              @update:value="val => emit('update:rolename', val)"
              :disabled="props.use === 'look'"
            />
          </n-form-item>

          <template v-for="group in props.data" :key="group.categoryName">
            <template v-if="group.items && group.items.length > 0">
              
              <h5 class="mt-4 fw-bold text-primary category-title">📁 {{ group.categoryName }}</h5>
              
              <div class="p-3 mb-3 border rounded bg-light">
                <div 
                  class="form-check form-check-inline my-2 d-inline-flex align-items-center" 
                  v-for="item in group.items" 
                  :key="item.page_id"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="item.isselect"
                    :disabled="props.use === 'look'"
                    :id="item.page_name"
                  />
                  <label class="form-check-label" :for="item.page_name" style="cursor: pointer;">
                    {{ item.page_name }}
                  </label>
                </div>
              </div>

            </template>
          </template>

          <div style="display: flex; justify-content: flex-end" class="mt-4">
            <button
              type="button"
              class="btn btn-secondary me-3"
              @click="cancel"
            >
              取消
            </button>
            <button type="button" class="btn btn-success" @click="submit" v-if="props.use !== 'look'">
              確定
            </button>
          </div>
        </n-form>
      </div>
    </n-card>
  </n-modal>
</template>

<script setup>
import { ref, inject } from "vue";
import { NModal, NCard, NForm, NFormItem, NInput } from "naive-ui";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
// 引入我們統整好的後端 API
import { updateRolePages, createRole } from "@/api/admin";

const swal = inject("$swal");
const isLoading = ref(false);

const props = defineProps({
  isopen: { type: Boolean, required: true },
  title: { type: String, required: true },
  rolename: { type: String, default: "" }, 
  data: { type: Array, required: true },
  use: {
    type: String,
    validator(value) {
      return ["look", "edit", "add", ""].includes(value);
    },
  },
  clickid: { type: Number },
});

const emit = defineEmits(['closemodel', 'getrolelist', 'update:rolename']);

// 統一的提示視窗
const showAlert = (icon, text) => {
  swal({ icon: icon, title: text, showConfirmButton: false, timer: 1500 });
};

// 關閉視窗
const cancel = () => {
  emit("closemodel");
};

// 送出表單
const submit = async () => {
  if (props.use === "look") return cancel();

  if (!props.rolename || props.rolename.trim() === "") {
    return showAlert("error", "請填寫角色名稱");
  }

  try {
    isLoading.value = true;

    const selectedPages = props.data.flatMap(group => group.items).filter(item => item.isselect);

    if (props.use === "edit") {
      const payload = selectedPages.map(item => ({
        role_id: props.clickid,
        page_id: item.page_id,
      }));
      
      await updateRolePages(props.clickid, { name: props.rolename, payload });
      showAlert("success", "權限與名稱更新成功");

    } else if (props.use === "add") {
      const payload = selectedPages.map(item => ({
        page_id: item.page_id,
      }));

      await createRole({ name: props.rolename, payload });
      showAlert("success", "新增角色成功");
    }

    emit("getrolelist"); 
    cancel();            

  } catch (error) {
    console.error("處理角色權限失敗:", error);
    showAlert("error", props.use === "edit" ? "更新失敗" : "新增角色失敗");
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* ==========================================================================
   🚀 專屬字體與樣式放大區 (透過 :deep 穿透修改 Naive UI 組件內部樣式)
   ========================================================================== */

/* 1. 放大彈窗大標題 */
:deep(.n-card-header__title) {
  font-size: 1.45rem !important;
  font-weight: bold !important;
}

/* 2. 放大角色名稱的 Label */
:deep(.n-form-item-label) {
  font-size: 1.2rem !important;
  font-weight: bold !important;
  margin-bottom: 4px !important;
}

/* 3. 放大角色名稱的文字輸入框 */
:deep(.n-input) {
  font-size: 1.15rem !important;
}

/* 4. 放大資料夾分類標題 */
.category-title {
  font-size: 1.25rem !important;
}

/* 5. 放大 Checkbox 框框本體 */
.form-check-input {
  width: 1.3em !important;
  height: 1.3em !important;
  margin-top: 0 !important; /* 修正 Bootstrap 預設的位移 */
}

/* 6. 放大 Checkbox 後方的權限文字 */
.form-check-label {
  font-size: 1.15rem !important;
  margin-left: 6px !important;
  font-weight: 500;
}

/* 7. 放大下方「確定」、「取消」按鈕的文字 */
.btn {
  font-size: 1.1rem !important;
  padding: 6px 18px !important;
}
</style>