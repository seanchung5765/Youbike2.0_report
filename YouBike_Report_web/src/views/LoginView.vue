<template>
  <div class="login-wrapper">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
      color="#f2b400"
    />

    <div class="login-card">
      <div class="text-center mb-4">
        <img
          src="https://www.youbike.com.tw/region/assets/images/logo.svg"
          class="img-fluid login-logo"
          alt="YouBike Logo"
        />
        <h4 class="mt-3 fw-bold text-secondary">報表管理系統</h4>
      </div>

      <n-form ref="formRef" :rules="rules" :size="'large'" :model="formValue">
        <n-form-item label="帳號" path="account">
          <n-popover trigger="focus" placement="top">
            <template #trigger>
              <n-input
                v-model:value="formValue.account"
                placeholder="請輸入帳號"
                @input="handleInput"
                @keyup.enter="subButton"
                :input-props="{ autocomplete: 'username' }"
              >
                <template #prefix>
                  <span class="material-icons-outlined icon-style">person</span>
                </template>
              </n-input>
            </template>
            <div class="popover-content">英文只允許大寫</div>
          </n-popover>
        </n-form-item>

        <n-form-item label="密碼" path="password">
          <n-input
            v-model:value="formValue.password"
            placeholder="請輸入密碼"
            type="password"
            show-password-on="mousedown"
            @keyup.enter="subButton"
            :input-props="{ autocomplete: 'current-password' }"
          >
            <template #prefix>
              <span class="material-icons-outlined icon-style">lock</span>
            </template>
          </n-input>
        </n-form-item>

        <div class="mt-4">
          <n-button
            attr-type="button"
            type="primary"
            @click="subButton"
            class="w-100 login-btn"
            round
          >
            登入系統
          </n-button>
        </div>
      </n-form>

      <div class="text-center mt-5">
        <small class="text-muted">Version 1.0.1</small>
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
const store = useUserStore();
const isLoading = ref(false);
const router = useRouter();
const formRef = ref(null);
const formValue = ref({ account: "", password: "" });

const rules = {
  account: [{ required: true, message: "請輸入帳號", trigger: "blur" }],
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
};

const handleInput = () => {
  formValue.value.account = formValue.value.account.toUpperCase();
};

const subButton = async () => {
  try {
    isLoading.value = true;
    await formRef.value.validate();
    const { account, password } = formValue.value;
    const url = import.meta.env.VITE_NODE_URL;
    
    const res = await axios.post(`${url}/isauth/login`, { account, password });
    const token = res.data.token;
    
    const expirationDate = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
    document.cookie = `youbike=${token}; expires=${expirationDate.toGMTString()};path=/;`;
    
    await store.getdata();
    isLoading.value = false;
    router.push("/");
  } catch (error) {
    isLoading.value = false;
    if (error?.code !== 'ERR_CANCELED') {
      swal({
        icon: 'error',
        title: "登入失敗",
        text: "帳號或密碼錯誤，請重新確認",
        confirmButtonColor: '#f2b400'
      });
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons+Outlined');

/* 強制全域設置，防止 Body 預設 Margin 導致的位移 */
:global(html), :global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 禁止滾動 */
  background-color: #f0f2f5; /* 灰色底色滿版 */
}

/* 確保所有元素計算寬度包含 Padding */
* {
  box-sizing: border-box;
}

.login-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center; /* 水平絕對置中 */
  align-items: center;     /* 垂直絕對置中 */
  padding: 20px;           /* 手機端預留邊距 */
  background-color: #f0f2f5;
  position: fixed;         /* 固定位置防止位移 */
  top: 0;
  left: 0;
}

.login-card {
  background: #ffffff;
  border-radius: 20px;
  /* 強化深色陰影，增加懸浮層次感 */
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25); 
  width: 100%;
  max-width: 420px;
  padding: 3rem 2.5rem;
  z-index: 10;
  transition: transform 0.3s ease;
}

/* 手機端適配佈局 */
@media (max-width: 576px) {
  .login-card {
    padding: 2rem 1.5rem;
    max-width: 100%;
  }
  .login-logo {
    max-width: 140px;
  }
}

.login-logo {
  max-width: 180px;
}

.login-btn {
  height: 50px;
  font-size: 18px;
  font-weight: 600;
  background-color: #f2b400 !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(242, 180, 0, 0.35);
}

.login-btn:hover {
  background-color: #d9a200 !important;
  transform: translateY(-1px);
}

.icon-style {
  font-size: 20px;
  color: #aaa;
}

.popover-content {
  padding: 4px 8px;
  font-weight: 500;
  color: #d32f2f;
}

:deep(.n-form-item-label) {
  font-weight: bold;
  color: #444;
}
</style>