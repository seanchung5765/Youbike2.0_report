<template>
  <div class="container-fluid">
    <div class="row mx-0 mb-3">
      <h1 class="report-h1 fw-bold">簡訊發送</h1>
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
            <span style="font-weight: 700">
              １.請先下載範例檔案<br />
              ２.編輯好資料後按選擇檔案<br />
              ３.選擇區域<br />
              ４.按儲存
            </span>
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
              >每一筆資料為<span style="color: red">換行</span>跟<span
                style="color: red"
                >,</span
              >區分</span
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
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="select"
        >
          <option disabled value="請選擇區域">請選擇區域</option>
          <option :value="city" v-for="city in panelsRef" :key="city">
            {{ city }}
          </option>
        </select>
      </div>
      <div class="col-auto mb-1">
        <input
          type="file"
          class="form-control"
          @change="ExcelHandler"
          ref="file"
        />
      </div>
    </div>

    <n-divider />
    <div class="row d-flex justify-content-center">
      <button
        class="btn btn-danger btn-lg"
        style="width: 200px"
        @click="submit"
      >
        儲存
      </button>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { NPopover, NIcon, NDivider } from "naive-ui";
import { AlertCircle } from "@vicons/ionicons5";
import { ref, inject } from "vue";
const Swal = inject("$swal");
import { useUserStore } from "../../stores/userdata";
const store = useUserStore();
const canusecitys = store.citys;

async function Alert(text) {
  Swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}

async function SuccessAlert(text) {
  Swal({
    icon: "success",
    title: `${text}`,
    showConfirmButton: false,
  });
}

const panelsRef = ref([]);
function cancity() {
  if (canusecitys.includes(2)) {
    panelsRef.value.push("台北市");
  }

  if (canusecitys.includes(3)) {
    panelsRef.value.push("新北市");
  }

  if (canusecitys.includes(4)) {
    panelsRef.value.push("桃園市");
  }

  if (canusecitys.includes(5)) {
    panelsRef.value.push("新竹市");
  }

  if (canusecitys.includes(6)) {
    panelsRef.value.push("新竹縣");
  }

  if (canusecitys.includes(20)) {
    panelsRef.value.push("竹科");
  }

  if (canusecitys.includes(7)) {
    panelsRef.value.push("苗栗縣");
  }

  if (canusecitys.includes(8)) {
    panelsRef.value.push("台中市");
  }

  if (canusecitys.includes(12)) {
    panelsRef.value.push("嘉義市");
  }

  if (canusecitys.includes(13)) {
    panelsRef.value.push("嘉義縣");
  }

  if (canusecitys.includes(14)) {
    panelsRef.value.push("台南市");
  }

  if (canusecitys.includes(15)) {
    panelsRef.value.push("高雄市");
  }

  if (canusecitys.includes(16)) {
    panelsRef.value.push("屏東縣");
  }

  if (canusecitys.includes(19)) {
    panelsRef.value.push("台東縣");
  }
}

const data = ref([]);
const select = ref("請選擇區域");
const file = ref(null);
const ExcelHandler = (event) => {
  const files = event.target.files[0];

  if (files.type !== "text/plain") {
    Alert("上傳格式必須為txt");
    file.value.value = null;
    return;
  }

  if (files) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      const lines = content.split("\n");
      data.value = lines
        .map((i) => {
          return i.replace(",", "");
        })
        .filter((item) => item !== "");
    };
    reader.readAsText(files);
  }
};

function exampleFileHandle() {
  const textToSave = `500119008,
500101187,
500101213,
500111086,`;
  const blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = "範例檔";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadUrl);
}

const submit = async () => {
  const carnum = data.value;

  if (select.value === "請選擇區域") {
    Alert("請選擇區域");
    return;
  } else if (file.value.value === "") {
    Alert("請選擇檔案");
    return;
  }

  try {
    const url = `${import.meta.env.VITE_NODE_URL}/mail/listmail`;
    const res = await axios.put(url, { carnum, area: select.value });

    if (res.data.message === "編輯成功") {
      SuccessAlert("編輯成功");
    }
  } catch (error) {
    console.log(error);
  } finally {
    // console.log(select.value);
    select.value = "請選擇區域";
    file.value.value = null;
  }
};

(() => {
  cancity();
})();
</script>

<style lang="scss" scoped></style>
