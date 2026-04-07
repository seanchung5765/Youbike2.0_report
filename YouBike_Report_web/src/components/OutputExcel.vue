<template>
  <button type="button" @click.prevent="cli()">匯出</button>
</template>

<script setup>
import * as XLSX from "xlsx";
import { inject } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  header: {
    type: Array,
    required: true,
  },
});

const swal = inject("$swal");

async function NotCityAlert(text) {
  await swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}

const cli = async () => {
  let data = [...props.data];
  if (!props.data.length) {
    return await NotCityAlert("空資料不能匯出");
  } else {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.utils.sheet_add_aoa(worksheet, [props.header], { origin: "A1" });
    XLSX.writeFile(workbook, `${props.name}.xlsx`);
  }
};
</script>

<style></style>
