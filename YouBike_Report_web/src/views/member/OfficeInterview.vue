<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">辦公室網路</h1>
    </div>
    <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12 mb-2">
      <button
        type="button"
        class="btn btn-success text-light col-md-auto"
        @click="submit"
      >
        查看
      </button>
    </div>
    <n-data-table
      v-show="data.length > 0"
      ref="dataTable"
      :columns="columns"
      :data="data"
      :pagination="{ pageSize: 20 }"
      :max-height="500"
      :scroll-x="300"
      :bordered="false"
      :single-line="false"
      size="small"
      striped
    />
  </div>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NDataTable } from "naive-ui";
const isLoading = ref(false);
const columns = [
  {
    key: "item1",
    align: "center",
    title: "號碼",
  },
  {
    key: "item2",
    align: "center",
    title: "單位",
  },
];
const data = ref([]);

const searchData = async () => {
  try {
    isLoading.value = true;
    const url = import.meta.env.VITE_NODE_URL;
    const res = await axios.get(`${url}/toexcel/officeinternet`);
    const { rows } = res.data;
    data.value = [...rows];
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const submit = () => {
  searchData();
};
</script>

<style></style>
