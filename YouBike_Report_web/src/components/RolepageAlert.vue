<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="false"
    :is-full-page="true"
  />
  <n-modal v-model:show="props.isopen" :mask-closable="false">
    <n-card style="max-width: 1000px" preset="card" :title="props.title">
      <div>
        <n-form>
          <n-form-item
            label="角色名稱"
            path="inputValue"
            v-if="props.use == 'add'"
          >
            <n-input placeholder="請輸入" v-model:value="typename" />
          </n-form-item>
          <template v-for="group in props.data" :key="group.categoryName">
            <template v-if="group.items && group.items.length > 0">
              
              <h5 class="mt-3 fw-bold text-primary">📁 {{ group.categoryName }}</h5>
              
              <div class="p-3 mb-3 border rounded bg-light">
                <div 
                  class="form-check form-check-inline my-1" 
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

          <div style="display: flex; justify-content: flex-end" class="mt-3">
            <button
              type="button"
              class="btn btn-secondary me-3"
              @click="cancel"
            >
              取消
            </button>
            <button type="button" class="btn btn-success" @click="submit">
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
const typename = ref(null);

const props = defineProps({
  isopen: { type: Boolean, required: true },
  title: { type: String, required: true },
  data: { type: Array, required: true },
  use: {
    type: String,
    required: true,
    validator(value) {
      return ["look", "edit", "add", ""].includes(value);
    },
  },
  clickid: { type: Number },
});

const emit = defineEmits(["closemodel", "getrolelist"]);

// 統一的提示視窗
const showAlert = (icon, text) => {
  swal({ icon: icon, title: text, showConfirmButton: false, timer: 1500 });
};

// 關閉視窗並清空資料
const cancel = () => {
  typename.value = null;
  emit("closemodel");
};

// 送出表單
const submit = async () => {
  if (props.use === "look") return cancel();

  try {
    isLoading.value = true;

    // 🚀 神級優化：直接攤平二維陣列，並過濾出有打勾 (isselect === true) 的項目
    const selectedPages = props.data.flatMap(group => group.items).filter(item => item.isselect);

    if (props.use === "edit") {
      // 組裝編輯用的 Payload
      const payload = selectedPages.map(item => ({
        role_id: props.clickid,
        page_id: item.page_id,
      }));
      
      await updateRolePages(props.clickid, payload);
      showAlert("success", "權限更新成功");

    } else if (props.use === "add") {
      if (!typename.value) {
        isLoading.value = false;
        return showAlert("error", "請填寫角色名稱");
      }
      
      // 組裝新增用的 Payload
      const payload = selectedPages.map(item => ({
        page_id: item.page_id,
      }));

      await createRole({ name: typename.value, payload });
      showAlert("success", "新增角色成功");
    }

    emit("getrolelist"); // 呼叫外層重新抓取角色列表
    cancel();            // 關閉視窗

  } catch (error) {
    console.error("處理角色權限失敗:", error);
    showAlert("error", props.use === "edit" ? "更新失敗" : "新增角色失敗");
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped></style>