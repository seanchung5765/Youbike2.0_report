<template>
  <div class="container-fluid px-0">
    <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="true" />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">帳號角色管理</h1>
    </div>
    <form class="row mx-0" :class="{ 'report-header': !ischange, 'report-header-dark': ischange }">
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">帳號搜尋:</label>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12 px-0" style="min-width: 300px;">
        <n-select
          v-model:value="searchvalue"
          filterable
          placeholder="請輸入姓名或工號搜尋"
          :options="option"
          @update:value="handleSelect"
        />
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <button
          type="button"
          class="btn btn-success text-light mt-3 mt-md-0 col-md-auto mx-md-2"
          @click="search"
        >
          確定
        </button>
      </div>
    </form>
    <hr />
    
    <form v-if="submitdata && submitdata.users_id" class="row mx-0" :class="{ 'report-header': !ischange, 'report-header-dark': ischange }">
      <div class="row mx-auto px-0">
        <div class="col-md-3">
          <label class="form-label fw-bolder">姓名</label>
          <input type="text" class="form-control" v-model="submitdata.name" disabled />
        </div>
        <div class="col-md-3 mt-2 mt-md-0">
          <label class="form-label fw-bolder">工號</label>
          <input type="text" class="form-control" v-model="submitdata.users_id" disabled />
        </div>
        <div class="col-md-3 mt-2 mt-md-0">
          <label class="form-label fw-bolder">目前角色</label>
          <input type="text" class="form-control" v-model="submitdata.role_name" disabled />
        </div>
        <div class="col-md-3 mt-2 mt-md-0">
          <label class="form-label fw-bolder">修改成的角色</label>
          <select class="form-select" v-model="choserole">
            <option value="請選擇" disabled>請選擇</option>
            <option v-for="item in roles" :key="item.role_id" :value="item.role_id">
              {{ item.role_name }}
            </option>
          </select>
        </div>
        <div class="col col-md-auto mt-3 d-flex flex-column justify-content-end">
          <button type="button" class="btn btn-success" @click="revise">送出</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import axios from "axios";
import { NSelect } from "naive-ui"; // 改引用 NSelect
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { ref, inject, onMounted } from "vue";

const swal = inject("$swal");
const ischange = inject("ischange");
const isLoading = ref(false);
const submitdata = ref(null);
const option = ref([]);
const searchvalue = ref(null);
const choserole = ref("請選擇");
const roles = ref([]);
const userdata = ref([]);

async function NotAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false, timer: 1500 });
}
async function SeviseroleAlert(text) {
  swal({ icon: "success", title: text, showConfirmButton: false, timer: 1500 });
}

const getroles = async () => {
  const url = `${import.meta.env.VITE_NODE_URL}/isauth/roles`;
  const res = await axios.get(url);
  roles.value = res.data.rows || [];
};

async function getdata() {
  isLoading.value = true;
  await getroles();
  const url = `${import.meta.env.VITE_NODE_URL}/isauth/userrole`;
  const res = await axios.get(url);
  isLoading.value = false;
  
  userdata.value = res.data.rows || [];
  // 處理選項，移除底線，改用更易讀的格式
  option.value = userdata.value
    .filter(item => item.name && item.users_id) // 過濾掉 null 或不完整的資料
    .map(item => ({
      label: `${item.users_id} ${item.name}    ${item.role_name || ''}`,
      value: item.users_id // value 只存 ID，搜尋更準確
    }));
}

onMounted(getdata);

// 當選擇下拉選單時觸發
const handleSelect = (val) => {
  searchvalue.value = val;
};

const search = async () => {
  if (!searchvalue.value) return NotAlert("請先選擇帳號");
  try {
    isLoading.value = true;
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/role/${searchvalue.value}`;
    const res = await axios.get(url);
    if (res.data.rows && res.data.rows.length > 0) {
      submitdata.value = res.data.rows[0];
    } else {
      NotAlert("找不到該使用者");
    }
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    NotAlert("查詢失敗");
  }
};

const revise = async () => {
  try {
    if (choserole.value === "請選擇") return NotAlert("請選擇修正成的角色");
    isLoading.value = true;
    const users_id = submitdata.value.users_id;
    await axios.patch(`${import.meta.env.VITE_NODE_URL}/isauth/role/${users_id}`, {
      role: choserole.value,
    });
    await getdata();
    submitdata.value = null;
    choserole.value = "請選擇";
    searchvalue.value = null;
    isLoading.value = false;
    SeviseroleAlert("修正成功");
  } catch (error) {
    isLoading.value = false;
    NotAlert("修正失敗");
  }
};
</script>