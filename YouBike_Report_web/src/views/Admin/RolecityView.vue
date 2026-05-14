<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">使用者可閱縣市管理</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">帳號資料:</label>
      </div>
        <div class="row mx-0 mx-md-2 align-items-center col-md-4 col-12 px-0">
          
          <n-select
            v-model:value="searchvalue"
            :options="option"
            placeholder="請選擇或輸入帳號..."
            filterable
            clearable
            style="min-width: 300px;" 
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
      <h2 class="mt-2 fw-bold">{{ showname }}</h2>
      <h3 class="mt-2 fw-bold">城市:</h3>
      <template v-for="(item, index) in checkdata" :key="`${index}111`">
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="checkbox"
            :id="item.city_name"
            v-model="item.isselect"
          />
          <label class="form-check-label fw-bold" :for="item.city_name">
            {{ item.city_name }}
          </label>
        </div>
      </template>

      <div style="display: flex; justify-content: flex-start" class="mt-3">
        <!-- 💡 修正了原本的 type="buttno" 錯字 -->
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
import { ref, inject, onMounted } from "vue";
import { NSelect } from "naive-ui";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { getUserRoles, getUserCities, getAllCities, updateUserCities } from "@/api/admin";

const ischange = inject("ischange");
const swal = inject("$swal");

const isLoading = ref(false);
const searchvalue = ref("");
const option = ref([]);
const checkdata = ref([]);
const showname = ref("");

// 提示視窗封裝
const showAlert = (icon, text) => swal({ icon, title: text, showConfirmButton: false });

// 載入初始下拉選單資料
const getdata = async () => {
  try {
    isLoading.value = true;
    const res = await getUserRoles();
    
    // 💡 優化：使用 map 直接轉換格式，取代原本的 forEach + push
    option.value = res.data.data.map((element) => ({
      label: `${element.name}_${element.users_id}`,
      value: `${element.name}_${element.users_id}`,
    }));
  } catch (error) {
    console.error("取得使用者列表失敗", error);
  } finally {
    isLoading.value = false;
  }
};

// 💡 遵循 Vue 3 規範，使用 onMounted 取代原本的立即執行函式 (IIFE)
onMounted(() => {
  getdata();
});

// 搜尋特定使用者的權限
const search = async () => {
  try {
    // 把 @ 去掉並防呆檢查
    if (!searchvalue.value) {
      return showAlert("error", "請先選擇帳號");
    }
    
    showname.value = searchvalue.value;
    const selectid = searchvalue.value.split("_")[1];

    isLoading.value = true;
    // 💡 優化：Promise.all 內部不需要再加 await
    const [userCityRes, allCityRes] = await Promise.all([
      getUserCities(selectid),
      getAllCities(),
    ]);

    const userCities = userCityRes.data.data.map((item) => item.city_id);
    const allCities = allCityRes.data.data;

    // 💡 優化：使用 map 一次性合併資料，取代原本冗長的 forEach if-else 判斷
      checkdata.value = allCities
      .filter((city) => city.status === 'active') 
      .map((city) => ({
      ...city,
      isselect: userCities.includes(city.city_id),
    }));

  } catch (error) {
    showAlert("error", "讀取資料失敗");
  } finally {
    isLoading.value = false;
  }
};

const cancel = () => {
  checkdata.value = [];
};

// 送出修改
const submit = async () => {
  try {
    isLoading.value = true;
    const id = showname.value.split("_")[1].trim();
    
    // 💡 優化：使用 filter 和 map 組合，取代 forEach + push
    const payload = checkdata.value
      .filter((item) => item.isselect)
      .map((item) => ({
        users_id: id,
        city_id: item.city_id,
      }));

    await updateUserCities(id, payload);
    
    cancel();
    searchvalue.value = null;
    showAlert("success", "成功修改");
  } catch (error) {
    console.error(error);
    showAlert("error", "修改失敗");
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped></style>