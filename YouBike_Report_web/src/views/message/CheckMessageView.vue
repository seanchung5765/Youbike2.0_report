<template>
  <div class="container-fluid border border-3 pt-3">
    <div class="row mx-0 mb-3">
      <h1 class="report-h1 fw-bold">發送確認</h1>
    </div>
    <n-data-table
      :columns="columns"
      :bordered="false"
      :single-line="false"
      :data="data"
    />
  </div>
</template>

<script setup>
import { ref, h } from "vue";
import { NDataTable, NButton } from "naive-ui";
import axios from "axios";

const data = ref([]);

const columns = [
  {
    title: "筆數",
    key: "total_count",
  },
  {
    title: "日期",
    key: "date",
  },
  {
    title: "公號",
    key: "yb_id",
  },
  {
    title: "操作",
    key: "actions",
    render(row) {
      return h(
        NButton,
        {
          type: "primary",
          onClick: () => handleSend(row),
        },
        {
          default: () => "送出",
        }
      );
    },
  },
];

// 处理送出操作
const handleSend = async (row) => {
  const { date, yb_id } = row;
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/sms/update_check`;
    await axios.put(url, { date, yb_id });
  } catch (error) {
    console.log(error);
  } finally {
    await getData();
  }
};

async function getData() {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/sms/status_check`;
    const result = await axios.get(url);
    data.value = result.data.result;
  } catch (error) {
    console.log(error);
  }
}

// 获取数据
(async () => {
  await getData();
})();
</script>

<style lang="scss" scoped></style>
