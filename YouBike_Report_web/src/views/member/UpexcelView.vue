<template>
  <div class="container-fluid px-0">
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">上傳檔案</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <input
          type="file"
          class="form-control"
          @change="Excelhandler"
          ref="file"
        />
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder"
          >表格:</label
        >
        <div class="col-md-auto px-0">
          <select
            class="form-select form-select-sm"
            aria-label="car"
            v-model="category"
          >
            <option selected disabled>請選擇</option>
            <option value="engine">工程</option>
            <option value="FourG">1.0 4G場站</option>
            <option value="officetel">辦公室電話</option>
            <option value="officeinternet">辦公室網路</option>
            <option value="IpadTotal">平板統計</option>
          </select>
        </div>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <button
          type="button"
          class="btn btn-success text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="submit"
        >
          送出
        </button>
        <button
          type="button"
          class="btn btn-secondary text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="cancel"
        >
          清除
        </button>
      </div>
    </form>

    <template v-if="data.length">
      <n-watermark
        content="預覽圖"
        cross
        selectable
        :font-size="16"
        :line-height="16"
        :width="192"
        :height="128"
        :x-offset="12"
        :y-offset="28"
        :rotate="-15"
      >
        <n-data-table
          :data="data"
          :columns="columns"
          :pagination="{ pageSize: 20 }"
          :max-height="500"
          :scroll-x="800"
          :bordered="false"
          :single-line="false"
          striped
        />
      </n-watermark>
    </template>
  </div>
</template>

<script setup>
import { NDataTable, NWatermark } from "naive-ui";
import axios from "axios";
import * as XLSX from "xlsx";
import { ref, inject } from "vue";

const ischange = inject("ischange");

const file = ref(null);
let totaldata = [];
const columns = ref([]);
const data = ref([]);
const category = ref("請選擇");
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

async function subdata() {
  try {
    const payload = {
      data: data.value,
    };
    const url = import.meta.env.VITE_NODE_URL;
    await axios.put(`${url}/toexcel/${category.value}`, payload);
  } catch (error) {
    console.log(error);
  }
}
//取消清除
function cancel() {
  file.value.value = "";
  data.value = [];
  columns.value = [];
  category.value = "請選擇";
}

async function sureAlert() {
  const res = await swal({
    title: "確定送出嗎?",
    text: "送出後，將會覆蓋原本的表格",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確定",
    cancelButtonText: "取消",
  });
  if (res.isConfirmed) {
    subdata();
    cancel();
    SuccessAlert("成功上傳");
  }
}

const makecol = () => {
  const col = totaldata[0];
  let arr = [];
  col.forEach((item, index) => {
    arr.push({
      key: `item${index}`,
      align: "center",
      title: item,
    });
  });
  columns.value = [...arr];
};

const makedata = () => {
  const col = totaldata;
  const totalarr = [];
  col.forEach((item, index) => {
    if (index === 0) {
      return;
    }
    let arr = {};
    for (let i = 0; i < totaldata[0].length; i++) {
      arr[`item${i}`] = item[i];
    }
    totalarr.push(arr);
  });
  data.value = [...totalarr];
};

//抓excel檔案
const Excelhandler = async (event) => {
  const files = event.target.files[0];

  //抓附檔名
  const fileName = files.name;
  const fileExtension = fileName.split(".").pop();
  if (fileExtension !== "csv") {
    ErrorAlert("格式不正確");
    cancel();
    return;
  }
  const filePath = URL.createObjectURL(files);
  await getData(filePath);
  makecol();
  makedata();
};

//把檔案解析成文字
const getData = async (url) => {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    totaldata = [...processExcelData(res.data)];
  } catch (error) {
    console.log(error);
  }
};

function processExcelData(fileData) {
  const workbook = XLSX.read(fileData, { type: "array", codepage: 65001 });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1, //指定表頭行
    defval: "", //指定空值為' '
    blankrows: true, //可以讓空行出現
    //參考 https://www.npmjs.com/package/xlsx
  });
  // 此时 `jsonData` 就是将 Excel 数据转换为数组的结果
  return jsonData;
}

const submit = async () => {
  if (category.value === "請選擇") {
    ErrorAlert("請選擇表格");
    return;
  } else if (data.value.length === 0) {
    ErrorAlert("請選擇檔案");
    return;
  }
  sureAlert();
};
</script>

<style lang="scss" scoped></style>
