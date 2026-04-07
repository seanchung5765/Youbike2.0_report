<template>
  <div class="container-fluid">
    <div class="row mx-0 mb-3">
      <h1 class="report-h1 fw-bold">上傳檔案發送</h1>
    </div>
    <div class="row fw-bold d-flex">
      <div class="col-auto mb-1 d-flex">
        <div class="my-auto">
          <n-popover trigger="hover">
            <template #trigger>
              <n-icon size="20" color="#0DCAF0">
                <Alert-Circle />
              </n-icon>
            </template>
            <span style="font-weight: 700">請事先下載範例檔案，編輯好資料後直接上傳</span>
          </n-popover>
          <span class="ms-1 text-info">上傳方式</span>
        </div>
      </div>
      <div class="col-auto mb-1 d-flex">
        <div class="my-auto">
          <n-popover trigger="hover">
            <template #trigger>
              <n-icon size="20" color="#0DCAF0">
                <Alert-Circle />
              </n-icon>
            </template>
            <span style="font-weight: 700"
              >1. 手機號碼&簡訊內容<br />2. 換行為資料與資料間的分隔符號</span
            >
          </n-popover>
          <span class="ms-1 text-info">上傳格式</span>
        </div>
      </div>
      <div class="col-auto ms-auto">
        <button class="btn btn-primary fw-bold" @click="exampleFileHandle">
          下載範例檔案
        </button>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-auto mb-1">
        <input type="file" class="form-control" @change="ExcelHandler" ref="file" />
      </div>
    </div>

    <!-- <div class="row mb-3">
      <div class="col">
        <n-alert title="注意事項" type="info">
          1.注意事項111111 <br />
          2.注意事項222222<br />
          3.注意事項333333 <br />
          4.注意事項444444
        </n-alert>
      </div>
    </div> -->
    <div class="row d-flex justify-content-center">
      <button class="btn btn-danger btn-lg" style="width: 200px" @click="submit">
        發送
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, watch } from "vue";
import { NPopover, NIcon } from "naive-ui";
import { AlertCircle } from "@vicons/ionicons5";
import axios from "axios";
const swal = inject("$swal");

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

function exampleFileHandle() {
  const textToSave = `0912345678&好久不見，你好嗎?
0922104075&I love U
0960778857&忘了您的名字，真不好意思`;
  const blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = "範例檔(請使用記事本開啟)";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadUrl);
}

const CellPhoneTextareaMsg = ref("");
const file = ref(null);
const ExcelHandler = async (event) => {
  const file = event.target.files[0];

  if (!file || !file.name.toLowerCase().endsWith(".txt")) {
    await ErrorAlert("請上傳txt文件");
    clearData();
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const fileContents = e.target.result;
    CellPhoneTextareaMsg.value = fileContents;
  };

  reader.readAsText(file);
};

watch(CellPhoneTextareaMsg, async (value) => {
  await CellPhoneTextareaMsgHandler(value);
});

function clearData() {
  file.value.value = null;
  CellPhoneTextareaMsg.value = null;
}

async function CellPhoneTextareaMsgHandler(value) {
  if (value === null) {
    return;
  }

  const pattern = /^[0-9]{10}&.+$/;
  const lines = value.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!pattern.test(lines[i])) {
      await ErrorAlert(`第${i + 1}行資料格式錯誤`);
      clearData();
      return;
    }
  }
}

import { useUserStore } from "../../stores/userdata";
const store = useUserStore();
const { userId } = store;
async function submit() {
  if (!CellPhoneTextareaMsg.value) {
    await ErrorAlert("空資料不能發送");
    return;
  }

  const data = CellPhoneTextareaMsg.value.split("\n").map((i) => {
    const perData = i.split("&");
    return {
      phone: perData[0],
      yb_id: userId,
      message: perData[1],
    };
  });

  try {
    const url = `${import.meta.env.VITE_NODE_URL}/sms/sendMany`;

    await axios.post(url, { data, check: data.length >= 5000 ? true : false });

    await SuccessAlert("發送成功");
    clearData();
  } catch (error) {
    console.log(error);
  }
}
</script>

<style lang="scss" scoped></style>
