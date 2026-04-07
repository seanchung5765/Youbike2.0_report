<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">帳號角色管理</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0"
          >帳號資料:</label
        >
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12 px-0">
        <n-mention
          :options="option"
          default-value="@"
          v-model:value="searchvalue"
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
    <form
      v-if="submitdata"
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-auto px-0">
        <div class="col-md-3">
          <label for="labelname" class="form-label fw-bolder">姓名</label>
          <input
            type="text"
            class="form-control"
            id="labelname"
            v-model="submitdata.name"
            disabled
          />
        </div>
        <div class="col-md-3 mt-2 mt-md-0">
          <label for="labelid" class="form-label fw-bolder">公號</label>
          <input
            type="text"
            class="form-control"
            id="labelid"
            v-model="submitdata.users_id"
            disabled
          />
        </div>
        <div class="col-md-3 mt-2 mt-md-0">
          <label for="labelid" class="form-label fw-bolder">目前角色</label>
          <input
            type="text"
            class="form-control"
            id="labelid"
            v-model="submitdata.role_name"
            disabled
          />
        </div>
        <div class="col-md-3 mt-2 mt-md-0">
          <label for="" class="form-label fw-bolder">修改成的角色</label>
          <select class="form-select" v-model="choserole">
            <option selected disabled>請選擇</option>
            <option
              v-for="item in roles"
              :key="item.role_name"
              :value="item.role_id"
            >
              {{ item.role_name }}
            </option>
          </select>
        </div>
        <div
          class="col col-md-auto mt-3 d-flex flex-column justify-content-end"
        >
          <button type="button" class="btn btn-success" @click="revise">
            送出
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import axios from "axios";
import { NMention } from "naive-ui";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { ref, inject } from "vue";
const swal = inject("$swal");
async function NotAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
async function SeviseroleAlert(text) {
  swal({
    icon: "success",
    title: `${text}`,
    showConfirmButton: false,
  });
}
const ischange = inject("ischange");
const isLoading = ref(false);
const submitdata = ref(null);
const option = ref([]);

const choserole = ref("請選擇");
const roles = ref(null);
const getroles = async () => {
  const url = `${import.meta.env.VITE_NODE_URL}/isauth/roles`;
  const res = await axios.get(url);
  const data = res.data.rows;
  roles.value = [...data];
};

//從後端抓使用者資料後,放到option上面
const userdata = ref([]);
async function getdata() {
  isLoading.value = true;
  await getroles();
  const arr = [];
  const url = `${import.meta.env.VITE_NODE_URL}/isauth/userrole`;
  const res = await axios.get(url);
  isLoading.value = false;
  userdata.value = [...res.data.rows];
  userdata.value.forEach((element) => {
    arr.push({
      label: `${element.name}_${element.users_id}_${element.role_name}`,
      value: `${element.name}_${element.users_id}_${element.role_name}`,
    });
  });
  option.value = [...arr];
  console.log(option.value);
}

(async function startfun() {
  await getdata();
})();

const searchvalue = ref();
const search = async () => {
  try {
    isLoading.value = true;
    let value = "";
    //把@去掉
    if (searchvalue.value.includes("@")) {
      value = searchvalue.value.replace("@", "");
    }
    let chose = {
      name: value.split("_")[0],
      id: value.split("_")[1],
      role_name: value.split("_")[2],
    };
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/role/${chose.id}`;
    const res = await axios.get(url);
    submitdata.value = res.data.rows[0];
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    return NotAlert("格式不正確");
  }
};

const revise = async () => {
  try {
    isLoading.value = true;
    if (choserole.value == "請選擇") {
      isLoading.value = false;
      return NotAlert("請選擇修正成的角色");
    }
    const users_id = submitdata.value.users_id;
    const payload = {
      role: choserole.value,
    };
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/role/${users_id}`;
    await axios.patch(url, payload);

    //刷新選擇的帳號資料
    await getdata();
    //清空選擇
    submitdata.value = null;
    choserole.value = "請選擇";
    isLoading.value = false;
    searchvalue.value = "@";
    SeviseroleAlert("修正成功");
  } catch (error) {
    isLoading.value = false;
    return NotAlert("修正失敗");
  }
};
</script>

<style lang="scss" scoped></style>
