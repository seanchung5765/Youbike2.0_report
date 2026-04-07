<template>
  <div class="container-fluid px-0">
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">PowerBI</h1>
    </div>
    <form
      class="row mx-0"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <label class="col-md-auto col-form-label px-0 px-md-2 fw-bolder">城市:</label>
        <div class="col-md-auto px-0">
          <select class="form-select form-select-sm" aria-label="car" v-model="city">
            <option selected disabled>請選擇</option>
            <option value="台北市" v-if="canusecitys.includes(2)">台北市</option>
            <!-- <option value="新北市" v-if="canusecitys.includes(3)">新北市</option>
            <option value="桃園市" v-if="canusecitys.includes(4)">桃園市</option>
            <option value="新竹市" v-if="canusecitys.includes(5)">新竹市</option>
            <option value="新竹縣" v-if="canusecitys.includes(6)">新竹縣</option>
            <option value="竹科" v-if="canusecitys.includes(20)">竹科</option>
            <option value="苗栗縣" v-if="canusecitys.includes(7)">苗栗縣</option>
            <option value="台中市" v-if="canusecitys.includes(8)">台中市</option>
            <option value="嘉義市" v-if="canusecitys.includes(12)">嘉義市</option>
            <option value="嘉義縣" v-if="canusecitys.includes(13)">嘉義縣</option>
            <option value="台南市" v-if="canusecitys.includes(14)">台南市</option>
            <option value="高雄市" v-if="canusecitys.includes(15)">高雄市</option>
            <option value="屏東縣" v-if="canusecitys.includes(16)">屏東縣</option> -->
          </select>
        </div>
        <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
          <button
            type="button"
            class="btn btn-success text-light mt-3 mt-md-0 col-md-auto mx-md-2"
            @click="search"
          >
            搜尋
          </button>
        </div>
      </div>
    </form>
    <div
      style="width: 100%; height: 0; padding-bottom: 62.25%; position: relative"
      v-if="city === '台北市'"
    >
      <iframe
        title="YB全策略儀表板"
        src="https://app.powerbi.com/view?r=eyJrIjoiOTgzYTA4YzAtMDRmMC00MmM4LWI4ZmQtM2JmOWY3NTNlZWZkIiwidCI6ImExMGQ2Y2E0LWVhZjYtNDNhYy04MmIyLWIzZGIzOGMyY2JjZSIsImMiOjEwfQ%3D%3D"
        frameborder="0"
        allowFullScreen="true"
        style="width: 100%; height: 100%; position: absolute; top: 0; left: 0"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import { useUserStore } from "../../stores/userdata";
const store = useUserStore();
const canusecitys = store.citys;
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}

const city = ref("請選擇");

const search = () => {
  if (city.value === "請選擇") {
    NotCityAlert("請選擇日期");
    return;
  }
};
</script>

<style lang="scss" scoped></style>
