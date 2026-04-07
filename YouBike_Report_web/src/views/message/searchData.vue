<template>
  <div class="container-fluid border border-3 pt-3">
    <div class="row mx-0 mb-3">
      <h1 class="report-h1 fw-bold">預約查詢</h1>
    </div>
    <div class="row mx-0 mb-3">
      <div class="col-6">
        <label for="Input1" class="form-label">特定門號</label>
        <input
          type="email"
          class="form-control"
          id="Input1"
          placeholder="0912345678"
          v-model="number"
        />
      </div>
    </div>
    <div class="row mx-0 mb-3">
      <div class="col-6">
        <label for="Input1" class="form-label">日期</label>
        <n-date-picker v-model:value="range" type="daterange" clearable />
      </div>
    </div>

    <div class="row mx-0 mb-3">
      <div class="col-6">
        <button type="button" class="btn btn-primary" @click="submit">送出</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NDatePicker } from "naive-ui";
import * as XLSX from "xlsx";
import axios from "axios";
import { ref, inject } from "vue";
const swal = inject("$swal");

async function ErrorAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const number = ref(null);
const range = ref(null);

function convertTimestampToDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function OutputExcel(data) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "簡訊日誌");
  const fileName = "簡訊日誌.xlsx";
  XLSX.writeFile(workbook, fileName);
}

const submit = async () => {
  if (!number.value) {
    ErrorAlert("手機未填寫");
    return;
  } else if (!range.value) {
    ErrorAlert("日期未填寫");
    return;
  }

  const startDate = convertTimestampToDate(range.value[0]);
  const endDate = convertTimestampToDate(range.value[1]);
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/sms/status?number=${
      number.value
    }&start=${startDate}&end=${endDate}`;
    const res = await axios.get(url);
    const { result } = res.data;
    OutputExcel(result);
  } catch (error) {
    console.log(error);
  }
};
</script>

<style lang="scss" scoped></style>
