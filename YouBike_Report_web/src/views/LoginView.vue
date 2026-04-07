<template>
  <div class="container">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6 border border-3 py-3 px-3 rounded-3">
        <div class="my-3">
          <img
            src="https://www.youbike.com.tw/region/assets/images/logo.svg"
            class="img-fluid"
            alt="logo圖片"
          />
        </div>
        <n-form ref="formRef" :rules="rules" :size="'large'" :model="formValue">
          <n-form-item label="帳號" path="account">
            <n-popover trigger="click" v-model:show="showPopover">
              <template #trigger>
                <n-input
                  v-model:value="formValue.account"
                  placeholder="請輸入帳號"
                  @input="handleInput"
                  @keyup.enter="subButton"
                  :input-props="{
                    autocomplete: 'username',
                  }"
                />
              </template>
              <div>英文只允許大寫</div>
            </n-popover>
          </n-form-item>
          <n-form-item label="密碼" path="password">
            <n-input
              v-model:value="formValue.password"
              placeholder="請輸入密碼"
              type="password"
              show-password-on="mousedown"
              @keyup.enter="subButton"
              :input-props="{
                autocomplete: 'current-password',
              }"
            />
          </n-form-item>
          <n-button
            attr-type="button"
            type="primary"
            @click="subButton"
            class="col-12 col-md-2"
          >
            送出
          </n-button>
        </n-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "../stores/userdata";
import { ref, inject } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NForm, NButton, NFormItem, NInput, NPopover } from "naive-ui";
import axios from "axios";
import { useRouter } from "vue-router";
const swal = inject("$swal");
async function NotCityAlert() {
  swal({
    title: "帳號密碼錯誤",
  });
}

const store = useUserStore();
const isLoading = ref(false);
const router = useRouter();
const formRef = ref(null);
const formValue = ref({
  account: "",
  password: "",
});

const rules = {
  account: [{ required: true, message: "請輸入帳號", trigger: "blur" }],
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
};

const showPopover = ref(false);
const handleInput = () => {
  showPopover.value = true;
  formValue.value.account = formValue.value.account.toUpperCase();
};

const subButton = async () => {
  try {
    // console.log(store.user.acc)
    isLoading.value = true;
    await formRef.value.validate();
    // 驗證通過的處理
    const { account, password } = formValue.value;
    const url = import.meta.env.VITE_NODE_URL;
    const user = {
      account: account,
      password: password,
    };

    const res = await axios.post(`${url}/isauth/login`, user);
    const token = res.data.token;
    // console.log(token);
    const currentDate = new Date();
    // 设置过期时间为当前时间加上8小時
    const expirationDate = new Date(currentDate.getTime() + 8 * 60 * 60 * 1000);
    // 将过期时间转换为 GMT 格式的字符串
    const expires = expirationDate.toGMTString();
    // 设置 Cookie
    document.cookie = `youbike=${token}; expires=${expires};path=/;`;
    store.getdata();
    isLoading.value = false;
    router.push("/");
  } catch (error) {
    isLoading.value = false;
    console.log(error);
    NotCityAlert();
    // 驗證錯誤的處理
  }
};
</script>

<style>
/* 根據需要添加樣式 */
</style>
