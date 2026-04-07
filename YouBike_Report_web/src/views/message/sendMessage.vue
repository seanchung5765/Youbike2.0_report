<template>
  <div class="container-fluid">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0 mb-3">
      <h1 class="report-h1 fw-bold">簡訊發送</h1>
    </div>

    <form novalidate>
      <div class="row border-3 border py-3 mb-3 rounded">
        <div
          class="btn-toolbar mb-3"
          role="toolbar"
          aria-label="Toolbar with button groups"
        ></div>
        <h2 class="fs-5 fw-bold mb-2">1.輸入電話號碼</h2>
        <div class="col-auto mb-1">
          <input type="file" class="form-control" @change="ExcelHandler" ref="file" />
        </div>
        <div class="col-auto mb-1">
          <button
            type="button"
            class="btn btn-primary fw-bold"
            @click="exampleFileHandle"
          >
            下載範例檔案
          </button>
        </div>

        <div>
          <textarea
            :class="{
              'form-control': true,
              'is-valid': TextHandler,
              'is-invalid': TextHandler !== '' && !TextHandler,
            }"
            placeholder="0912345678,
0987654321,
0966666666,"
            id="floatingTextarea"
            style="height: 100px"
            v-model="CellPhoneTextareaMsg"
          ></textarea>
          <div class="invalid-feedback">{{ TextareaErrorMeg }}</div>
        </div>
      </div>
      <div class="row border-3 border py-3 rounded mb-3">
        <div class="row mb-1">
          <div
            class="btn-toolbar mb-3"
            role="toolbar"
            aria-label="Toolbar with button groups"
          ></div>
          <h2 class="fs-5 fw-bold mb-2">2.輸入簡訊內容</h2>

          <div class="col-10">
            <textarea
              v-model="textContent"
              class="form-control form-control-sm"
              placeholder="輸入簡訊內容"
              id="floatingTextarea"
              style="height: 100px"
            ></textarea>
          </div>

          <div class="col-2 d-flex flex-column justify-content-center">
            <p class="text-center gradient-bg mb-1">
              <span class="text-danger">{{ textContent.length }}</span
              >字
            </p>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-12">
            <div class="punctuation-panel">
              <button
                v-for="i in punctuations"
                :key="i"
                type="button"
                class="btn btn-sm me-1 mb-1 btn-outline-secondary"
                @click="clickItem(i)"
              >
                {{ i }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row d-flex justify-content-center">
        <button
          class="btn btn-danger btn-lg"
          style="width: 200px"
          type="button"
          @click="submit"
        >
          發送
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, inject, watch } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
// import { ArrowAltCircleUp } from "@vicons/fa";
const swal = inject("$swal");
const file = ref(null);

async function ErrorAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
async function SuccessAlert(text) {
  swal({
    icon: "success",
    title: `${text}`,
    showConfirmButton: false,
  });
}

const punctuations = ref([
  "，",
  "。",
  "？",
  "！",
  "「",
  "」",
  "『",
  "』",
  "︰",
  "（",
  "）",
  "《",
  "》",
  "〈",
  "〉",
  "［",
  "］",
  "｛",
  "｝",
  "：",
  "；",
  "‘",
  "’",
  "“",
  "”",
  "、",
  "。",
  "·",
  "……",
  "—",
  "《",
  "》",
  "（",
  "）",
  "【",
  "】",
  "+",
  "-",
  "±",
  "÷",
  "×",
  "=",
  "≠",
  "%",
  "∞",
  "√",
]);

function clickItem(item) {
  textContent.value += item;
}

const isLoading = ref(false);

const textContent = ref("");

const CellPhoneTextareaMsg = ref("");
const TextareaErrorMeg = ref("");
const TextHandler = ref("");

function exampleFileHandle() {
  const phoneNumbers = ["0912345678,", "0987654321,", "0988888888,", "0977777777,"];
  const txtContent = phoneNumbers.join("\n");
  const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = "電話號碼範例檔.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const ExcelHandler = async (event) => {
  const file = event.target.files[0];
  if (!file || !file.name.toLowerCase().endsWith(".txt")) {
    await ErrorAlert("請上傳txt文件");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const fileContents = e.target.result;
    CellPhoneTextareaMsg.value = fileContents;
  };

  reader.readAsText(file);
};

// 驗證是否為台灣手機號碼
function isValidTaiwanPhoneNumber(phoneNumber) {
  // 移除行尾的逗號（如果存在），然後檢查格式
  const cleanedNumber = phoneNumber.replace(/,$/, "");
  const regex = /^09\d{8}$/;
  return regex.test(cleanedNumber);
}

function CellPhoneTextareaMsgHandler(value) {
  if (value === null) return;

  TextHandler.value = true;
  TextareaErrorMeg.value = ""; // 清空之前的錯誤信息
  const lines = value.split("\n");

  lines.forEach((line, index) => {
    // 檢查是否以逗號結尾
    if (!line.endsWith(",")) {
      TextareaErrorMeg.value += `第${index + 1}行格式錯誤，應以逗號結尾。\n`;
      TextHandler.value = false;
    }
    // 檢查手機號碼格式
    if (!isValidTaiwanPhoneNumber(line)) {
      TextareaErrorMeg.value += `第${index + 1}行手機格式錯誤。\n`;
      TextHandler.value = false;
    }
  });

  return TextHandler.value;
}

watch(CellPhoneTextareaMsg, (value) => {
  CellPhoneTextareaMsgHandler(value);
});

const clearFrom = () => {
  CellPhoneTextareaMsg.value = "";
  textContent.value = "";
  TextHandler.value = false; // 重置验证状态
  TextareaErrorMeg.value = ""; // 清空错误信息
  file.value.value = null;
};

import { useUserStore } from "../../stores/userdata";
const store = useUserStore();
const { userId } = store;
const submit = async () => {
  const vee = CellPhoneTextareaMsgHandler(CellPhoneTextareaMsg.value);
  if (!vee) {
    return;
  }

  // 使用换行符分割文本，然后清除每行末尾的逗号和空格
  const phoneNumbers = CellPhoneTextareaMsg.value
    .split("\n")
    .map((line) => line.replace(/,$/, "").trim());

  // 过滤出有效的电话号码
  const validNumbers = phoneNumbers.filter(isValidTaiwanPhoneNumber);

  try {
    const url = `${import.meta.env.VITE_NODE_URL}/sms/send`;
    await axios.post(url, {
      phone: validNumbers,
      yb_id: userId,
      message: textContent.value,
      check: validNumbers.length >= 5000 ? true : false,
    });

    await SuccessAlert("發送成功");
    clearFrom();
  } catch (error) {
    console.log(error);
  }
};
</script>

<style lang="scss" scoped>
.gradient-bg {
  background: linear-gradient(to right, #edeeee, #c3c9d0);
}
</style>
