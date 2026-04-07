<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">工程</h1>
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
      :max-height="650"
      size="small"
      :scroll-x="1200"
      :bordered="false"
      :single-line="false"
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
    title: "序號",
  },
  {
    key: "item2",
    align: "center",
    title: "門號/帳號",
  },
  {
    key: "item3",
    align: "center",
    title: "線路編號/SIM NO",
    width: 200,
  },
  {
    key: "item4",
    align: "center",
    title: "APN",
  },
  {
    key: "item5",
    align: "center",
    title: "IP",
  },
  {
    key: "item6",
    align: "center",
    title: "3G/4G/ADSL/Fiber",
  },
  {
    key: "item7",
    align: "center",
    title: "電信商",
  },
  {
    key: "item8",
    align: "center",
    title: "租約/方案 名稱",
  },
  {
    key: "item9",
    align: "center",
    title: "優惠方案內容",
  },
  {
    key: "item10",
    align: "center",
    title: "月份-申請總數-序",
  },
  {
    key: "item11",
    align: "center",
    title: "地區",
  },
  {
    key: "item12",
    align: "center",
    title: "場站代號",
  },
  {
    key: "item13",
    align: "center",
    title: "站名/狀態/用途(人名/車號)",
  },
  {
    key: "item14",
    align: "center",
    title: "聯絡單-號碼",
    width: 250,
  },
  {
    key: "item15",
    align: "center",
    title: "部門代號",
  },
];
const data = ref([]);

const searchData = async () => {
  try {
    isLoading.value = true;
    const url = import.meta.env.VITE_NODE_URL;
    const res = await axios.get(`${url}/toexcel/engine`);
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
