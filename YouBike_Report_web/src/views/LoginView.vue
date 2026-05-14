<!--負責顯示 登入畫面-->
<template>
  <div class="container">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6 border border-3 py-3 px-3 rounded-3">
        <div class="my-0">
          <img
            src="/youbike-logo-white.png"
            class="img-fluid"
            alt="YouBike Logo"
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
                  @keyup.enter="focusPassword" 
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
              ref="passwordInput" 
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
import { ref, inject } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userdata";
import { login } from "@/api/auth"; 
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { NForm, NButton, NFormItem, NInput, NPopover } from "naive-ui";

const swal = inject("$swal");
const store = useUserStore();
const router = useRouter();

const isLoading = ref(false);
const formRef = ref(null);
const passwordInput = ref(null); // 取得密碼輸入框的參考
const showPopover = ref(false);

const formValue = ref({ account: "", password: "" });

const rules = {
  account: [{ required: true, message: "請輸入帳號", trigger: "blur" }],
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
};

// 處理帳號輸入，轉大寫並顯示提示
const handleInput = () => {
  showPopover.value = true;
  formValue.value.account = formValue.value.account.toUpperCase();
};

// 帳號框按下 Enter 時，將焦點移至密碼框
const focusPassword = () => {
  passwordInput.value?.focus();
};

// 提交表單
const subButton = async () => {
  // 1. 先做前端表單驗證 (分開攔截)
  try {
    await formRef.value.validate();
  } catch (errors) {
    // 驗證沒過 (例如沒填)，直接結束，讓 Naive UI 顯示紅字提示即可
    return; 
  }

  // 2. 驗證通過，開始發送 API 請求
  try {
    isLoading.value = true;
    
    // 將前端的 account 映射成後端要的 username
    const payload = {
      account: formValue.value.account,
      password: formValue.value.password
    };

    const res = await login(payload);
    
    // 設定 Cookie
    const token = res.data.token;
    const expirationDate = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
    document.cookie = `youbike=${token}; expires=${expirationDate.toGMTString()};path=/;`;

    // 取得使用者資料並導航
    await store.getdata();
    router.push("/");
    
  } catch (error) {
    console.error("Login Error:", error);
    
    // 顯示後端傳來的錯誤訊息
    // axios 錯誤通常包在 error.response.data.message 裡面
    const errorMsg = error.response?.data?.message || "無法連線至伺服器，請稍後再試";
    swal({ title: errorMsg, icon: "error" }); 
    
  } finally {
    isLoading.value = false;
  }
};
</script>

<style>
</style>