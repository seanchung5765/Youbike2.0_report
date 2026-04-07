<!-- eslint-disable vue/no-mutating-props -->
<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="false"
    :is-full-page="true"
  />
  <n-modal v-model:show="props.Modal">
    <n-card size="medium" preset="dialog">
      <n-form ref="formRef" :model="model" :rules="rules">
        <div class="fw-bold">
          <div class="row fs-4 mb-3">
            <div class="col">新增狀態</div>
          </div>
          <div class="row">
            <div class="col-6">
              <n-form-item
                label="系統:"
                label-style="font-weight: 700; font-size:16px"
              >
                <n-input v-model:value="props.title" :disabled="true" />
              </n-form-item>
            </div>
            <div class="col-6">
              <n-form-item
                label="城市:"
                label-style="font-weight: 700; font-size:16px"
              >
                <n-input v-model:value="props.city" :disabled="true" />
              </n-form-item>
            </div>
          </div>
          <n-popover trigger="hover">
            <template #trigger>
              <n-icon size="20" color="#0e7a0d">
                <Alert-Circle />
              </n-icon>
            </template>
            <span style="font-weight: 700"
              >未保養狀態 => 天<br />其他 => 分鐘</span
            >
          </n-popover>
          <div class="row">
            <div class="col-12 mb-3">
              <n-form-item
                path="time"
                label="分鐘 / 天"
                label-style="font-weight: 700; font-size:16px"
                rules="rules.time"
              >
                <n-input-number
                  v-model:value="model.time"
                  placeholder="請輸入數字"
                  :show-button="false"
                ></n-input-number>
              </n-form-item>
            </div>
            <div class="col-12">
              <n-form-item
                path="textareaValue"
                label="Email"
                label-style="font-weight: 700; font-size:16px"
                rules="rules.textareaValue"
              >
                <n-input
                  size="large"
                  v-model:value="model.textareaValue"
                  @change="handleTextareaInput"
                  placeholder="IloveYouBike@gmail.com,&#10;YouLoveYouBike@gmail.com,&#10;WeLoveYouBike@gmail.com,&#10;"
                  type="textarea"
                />
              </n-form-item>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col text-center">
            <n-button type="info" class="me-3" @click="submit">新增</n-button>
            <n-button type="error" @click="closeAddModal">取消</n-button>
          </div>
        </div>
      </n-form>
    </n-card>
  </n-modal>
</template>

<script setup>
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import axios from "axios";
import { AlertCircle } from "@vicons/ionicons5";
import {
  NModal,
  NCard,
  NButton,
  NInput,
  NFormItem,
  NInputNumber,
  NForm,
  NPopover,
  NIcon,
} from "naive-ui";
const swal = inject("$swal");
async function Alert(text) {
  swal({
    icon: "success",
    title: `${text}`,
    showConfirmButton: false,
  });
}

import { ref, inject } from "vue";

const props = defineProps({
  Modal: {
    type: Boolean,
  },
  title: {
    type: String,
  },
  city: {
    type: String,
  },
});

const model = ref({
  time: null,
  textareaValue: null,
});

const rules = {
  time: {
    validator(rule, value) {
      if (value === null) {
        return new Error("分鐘/天 不能為空");
      } else if (value <= 0) {
        return new Error("分鐘/天 必須大於0");
      }
      return true;
    },
    type: "number",
    trigger: ["blur", "input"],
  },
  textareaValue: {
    required: true,
    validator(rule, value) {
      if (!value) {
        return new Error("電子郵件不能為空");
      }

      let isok = true;
      let row = null;
      const lines = value.split("\n");
      lines.forEach((line, index) => {
        const lastCharacter = line.charAt(line.length - 1);
        //最後一個字要, 還有字串內要有@
        if (lastCharacter !== "," || line.indexOf("@") === -1) {
          row = index;
          isok = false;
        }
      });

      if (!isok) {
        return new Error(`第${row + 1}行格式錯誤`);
      } else {
        return true;
      }
    },
    trigger: ["blur", "input"],
  },
};

const isLoading = ref(false);
async function addStatus(parms) {
  try {
    isLoading.value = true;
    const url = `${import.meta.env.VITE_NODE_URL}/mail/status`;
    await axios.post(url, parms);
  } catch (error) {
    throw new Error("新增狀態失敗");
  } finally {
    isLoading.value = false;
  }
}

function dataObj() {
  const dataObj = {
    city: props.city,
    title: props.title,
    time: model.value.time,
    textareaValue: model.value.textareaValue
      .split(",")
      .filter((item) => item)
      .map((item) => item.replace(/\n/g, "")),
  };
  return dataObj;
}

async function validate() {
  try {
    await formRef.value.validate();
    return "驗證成功";
  } catch (error) {
    throw new Error("驗證失敗");
  }
}

const getData = inject("getData");
const formRef = ref(null);
async function submit() {
  try {
    //驗證格式
    await validate();
    //抓取以編輯好的參數
    const parms = dataObj();
    //送出 新增狀態
    await addStatus(parms);
    Alert("新增成功");

    //更新表單
    await getData();
    closeAddModal();
  } catch (error) {
    console.log(error);
  }
}

//去除前後空白
function handleTextareaInput() {
  const value = model.value.textareaValue;
  const lines = value.split("\n");
  const trimmedLines = lines.map((line) => line.trim());
  const formattedValue = trimmedLines.join("\n");
  model.value.textareaValue = formattedValue;
}

function clearfrom() {
  (model.value.time = null), (model.value.textareaValue = null);
}

const emit = defineEmits(["closeAddModal", "submit"]);

function closeAddModal() {
  clearfrom();
  emit("closeAddModal");
}
</script>

<style lang="scss" scoped>
.n-card {
  max-width: 800px;
}
</style>
