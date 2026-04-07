<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="false"
    :is-full-page="true"
  />
  <div class="row">
    <div class="col-3 mb-3">
      <n-select
        v-model:value="typevalue"
        :options="typeoptions"
        style="max-width: 200px"
      />
    </div>
  </div>
  <div class="row mb-2">
    <div class="col">
      <n-data-table
        class="fw-bold"
        :columns="createColumns"
        :data="data"
        :pagination="{ pageSize: 100 }"
        :paginate-single-page="false"
        size="small"
      />
    </div>
  </div>
  <div class="row pb-7">
    <div class="col text-center">
      <n-button type="info" @click="openAddModal">+</n-button>
    </div>
  </div>

  <AddComponent
    :Modal="showAddModal"
    @closeAddModal="closeAddModal"
    :title="typevalue"
    :city="city"
  />

  <EditComponent
    :Modal="showeditModal"
    @closeEditModal="closeEditModal"
    :editData="editData"
  />
</template>

<script setup>
import { NSelect, NDataTable, NButton } from "naive-ui";
import Loading from "vue-loading-overlay";
import axios from "axios";
import "vue-loading-overlay/dist/css/index.css";
import { ref, h, watch, inject } from "vue";
import AddComponent from "./AddComponent.vue";
import EditComponent from "./editComponent.vue";

const getData = inject("getData");
const swal = inject("$swal");
async function DateteAlert(data) {
  const res = await swal({
    title: "確定刪除嗎?",
    text: "刪除將不可復原",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "刪除",
    cancelButtonText: "取消",
  });
  if (res.isConfirmed) {
    await DeleteStatus(data);
    await getData();
    await swal.fire({
      title: "刪除成功",
      icon: "success",
    });
  }
}
const isLoading = ref(false);
async function DeleteStatus(data) {
  try {
    isLoading.value = true;

    const url = `${import.meta.env.VITE_NODE_URL}/mail/status?city=${
      data.city
    }&time=${data.time}&type=${data.type}`;
    await axios.delete(url);
  } catch (error) {
    throw new Error("刪除狀態失敗");
  } finally {
    isLoading.value = false;
  }
}

const props = defineProps({
  maildata: {
    type: Array,
  },
  city: {
    type: String,
  },
});

const typeoptions = [
  {
    label: "低電量狀態",
    value: "低電量狀態",
  },
  {
    label: "斷線狀態",
    value: "斷線狀態",
  },
  {
    label: "未保養狀態",
    value: "未保養狀態",
  },
];

const typevalue = ref("低電量狀態");

const data = ref([]);

const createColumns = [
  {
    title: "系統",
    key: "type",
    align: "center",
  },
  {
    title: "分鐘 / 天",
    key: "min",
    align: "center",
  },
  {
    title: "操作",
    key: "edit",
    align: "center",
    render(row) {
      const btn = row.btn.map((tagKey) => {
        return h(
          NButton,
          {
            style: {
              marginRight: "6px",
            },
            type: `${tagKey.color}`,
            bordered: false,
            onClick: () =>
              tagKey.name === "編輯" ? editBnt(row) : delteBtn(row),
          },
          {
            default: () => tagKey.name,
          }
        );
      });
      return btn;
    },
  },
];

async function delteBtn(row) {
  console.log(row);
  const data = {
    type: row.type,
    time: parseInt(row.min),
    city: props.city,
  };
  await DateteAlert(data);
}

function filterData() {
  const arr = [];
  //項目做分群
  props.maildata.forEach((item, index) => {
    let isDuplicate = false;
    if (index !== 0) {
      arr.forEach((arritem, index) => {
        if (
          arritem["type_name"] === item["type_name"] &&
          arritem["time"] === item["time"]
        ) {
          arr[index]["mail"].push(item.mail);

          isDuplicate = true;
        }
      });
    }
    if (!isDuplicate) {
      arr.push({
        city_name: item["city_name"],
        type_name: item["type_name"],
        time: item["time"],
        mail: [item["mail"]],
      });
    }
  });

  data.value = [];
  arr
    .sort((a, b) => a["time"] - b["time"])
    .forEach((item) => {
      if (item["type_name"] === typevalue.value)
        data.value.push({
          type: item["type_name"],
          min: item.time.toString(),
          btn: [
            {
              name: "編輯",
              color: "info",
            },
            {
              name: "刪除",
              color: "error",
            },
          ],
          mail: item.mail,
        });
    });
}

//AddModal
const showAddModal = ref(false);
function openAddModal() {
  showAddModal.value = true;
}
function closeAddModal() {
  showAddModal.value = false;
}

const editData = ref({});
// editModal
function editBnt(row) {
  // console.log(row);
  openeditModal();
  editData.value = {
    mail: row.mail,
    type: row.type,
    min: row.min,
    city: props.city,
  };
  // editData.value = row;
  // console.log("這是編輯", row);
}
const showeditModal = ref(false);
function openeditModal() {
  showeditModal.value = true;
}
function closeEditModal() {
  showeditModal.value = false;
}

watch(
  [() => typevalue.value, () => props.maildata],
  () => {
    filterData();
  },
  { deep: true }
);
(() => {
  filterData();
})();
</script>

<style lang="scss" scoped></style>
