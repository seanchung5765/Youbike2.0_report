<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">帳號城市權限管理</h1>
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
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12 px-0" style="min-width: 250px;">
        <n-select
          v-model:value="searchvalue"
          filterable
          placeholder="請輸入姓名或工號"
          :options="option"
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
    <div v-if="checkdata.length > 0">
      <h2 class="mt-2 fw-bold">{{ showname.split('_')[1] }} {{ showname.split('_')[0] }} </h2>
      <h3 class="mt-2 fw-bold">城市:</h3>
      <template v-for="(item, index) in checkdata" :key="`${index}111`">
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="checkbox"
            :id="item.city_name"
            v-model="item.isselect"
          />
          <label class="form-check-label fw-bold" :for="item.city_name">{{
            item.city_name
          }}</label>
        </div>
      </template>

      <div style="display: flex; justify-content: flex-start" class="mt-3">
        <button type="button" class="btn btn-secondary me-3" @click="cancel">
          取消
        </button>
        <button type="button" class="btn btn-success" @click="submit">
          確定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { NSelect } from "naive-ui"; // 改用 NSelect
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { ref, inject } from "vue";

const ischange = inject("ischange");
const isLoading = ref(false);
const searchvalue = ref(null); // 改為 null
const option = ref([]);
const swal = inject("$swal");

async function NotAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
    timer: 1500
  });
}
async function successAlert(text) {
  swal({
    icon: "success",
    title: `${text}`,
    showConfirmButton: false,
    timer: 1500
  });
}

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
    // 為了讓搜尋能同時搜名字跟工號，label 顯示豐富一點
    arr.push({
      label: `${element.users_id} ${element.name}`, 
      value: `${element.name}_${element.users_id}`, // 維持原本的 split 邏輯
    });
  });
  option.value = [...arr];
}

(async function startfun() {
  await getdata();
})();

const checkdata = ref([]);
const showname = ref("");

const search = async () => {
  if (!searchvalue.value) return NotAlert("請先選擇帳號");
  try {
    // 因為改用 Select，不需要再 replace("@", "")，直接拿 value
    let value = searchvalue.value;
    showname.value = value;
    const selectid = value.split("_")[1];
    
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/usercity/${selectid}`;
    const url2 = `${import.meta.env.VITE_NODE_URL}/isauth/citys`;
    
    isLoading.value = true;
    const res = await Promise.all([
      axios.get(url),
      axios.get(url2),
    ]);
    isLoading.value = false;
    
    const persondata = res[0].data.rows;
    const alldata = res[1].data.rows;

    const persondataarr = persondata.map((item) => item.city_id);
    const arr = [];
    alldata.forEach((item, index) => {
      // 深度拷貝避免影響原資料
      const tempItem = { ...item };
      if (persondataarr.includes(item.city_id)) {
        tempItem.isselect = true;
      } else {
        tempItem.isselect = false;
      }
      arr.push(tempItem);
    });
    checkdata.value = [...arr];
  } catch (error) {
    isLoading.value = false;
    return NotAlert("格式不正確");
  }
};

const cancel = () => {
  checkdata.value = [];
  searchvalue.value = null; // 清空選取項
};

const submit = async () => {
  try {
    const id = showname.value.split("_")[1].trim();
    const arr = [];
    checkdata.value.forEach((item) => {
      if (item.isselect) {
        arr.push({
          users_id: id,
          city_id: item.city_id,
        });
      }
    });

    const url = `${import.meta.env.VITE_NODE_URL}/isauth/role_citys/${id}`;
    
    isLoading.value = true;
    await axios.put(url, arr);
    isLoading.value = false;
    
    await successAlert("成功修改");
    cancel(); // 修改成功後清空畫面
  } catch (error) {
    isLoading.value = false;
    console.log(error);
    NotAlert("修改失敗");
  }
};
</script>

<style lang="scss" scoped></style>