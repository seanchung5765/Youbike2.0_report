<template>
  <div class="container-fluid px-0">
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">PowerBI 儀表板</h1>
    </div>

    <!-- 🚀 鐵壁防禦排版：強制單行、不換行、橫向捲軸 -->
    <form
      class="mx-0 py-3 px-3"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
      style="display: flex; flex-wrap: nowrap; align-items: center; gap: 16px; overflow-x: auto;"
    >
      <!-- 城市選擇 -->
      <div style="display: flex; align-items: center; flex-shrink: 0; gap: 8px;">
        <label class="fw-bolder mb-0" style="white-space: nowrap;">城市:</label>
        <div style="width: 140px;">
          <!-- 🚀 升級為 n-select -->
          <n-select
            v-model:value="city"
            :options="cityOptions"
            placeholder="請選擇"
            @update:value="showReport = false"
          />
        </div>
      </div>

      <!-- 按鈕 -->
      <div style="display: flex; flex-shrink: 0;">
        <button
          type="button"
          class="btn btn-success text-light"
          style="white-space: nowrap;"
          @click="search"
        >
          搜尋
        </button>
      </div>
    </form>

    <!-- 🚀 只有在點擊搜尋，且選擇台北市時才顯示 iframe -->
    <div
      v-if="showReport && city === '台北市'"
      style="width: 100%; height: 0; padding-bottom: 62.25%; position: relative; margin-top: 16px;"
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
import { ref, inject, computed } from "vue";
import { useUserStore } from "../../stores/userdata";
import { NSelect } from "naive-ui";

const store = useUserStore();
const canusecitys = store.citys || [];
const ischange = inject("ischange");
const swal = inject("$swal");

async function NotCityAlert(text) {
  swal({ icon: "error", title: text, showConfirmButton: false });
}

const city = ref(null);
const showReport = ref(false); // 🚀 控制報表顯示狀態

// --- 🚀 城市選單 (資料驅動，方便未來擴充) ---
const cityOptions = computed(() => {
  const map = [
    { label: "台北市", value: "台北市", auth: 2 },
    // 未來如果要開放其他城市，只要把下面的註解解開即可
    // { label: "新北市", value: "新北市", auth: 3 },
    // { label: "桃園市", value: "桃園市", auth: 4 },
    // { label: "新竹市", value: "新竹市", auth: 5 },
    // { label: "新竹縣", value: "新竹縣", auth: 6 },
    // { label: "竹科", value: "竹科", auth: 20 },
    // { label: "苗栗縣", value: "苗栗縣", auth: 7 },
    // { label: "台中市", value: "台中市", auth: 8 },
    // { label: "嘉義市", value: "嘉義市", auth: 12 },
    // { label: "嘉義縣", value: "嘉義縣", auth: 13 },
    // { label: "台南市", value: "台南市", auth: 14 },
    // { label: "高雄市", value: "高雄市", auth: 15 },
    // { label: "屏東縣", value: "屏東縣", auth: 16 },
  ];
  return map.filter(c => canusecitys.includes(c.auth));
});

const search = () => {
  if (!city.value) {
    NotCityAlert("請選擇城市"); // 🚀 修正了原本提示「請選擇日期」的 Bug
    showReport.value = false;
    return;
  }
  
  // 驗證通過，顯示報表
  showReport.value = true;
};
</script>

<style scoped></style>