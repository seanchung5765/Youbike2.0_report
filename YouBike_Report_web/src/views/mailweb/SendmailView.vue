<template>
  <div class="contanier">
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">異常通知</h1>
    </div>
    <n-tabs
      v-model:value="valueRef"
      type="card"
      :tab-style="style"
      size="large">
      <n-tab-pane v-for="panel in panelsRef" :key="panel" :name="panel">
        <sendmainComponent :maildata="maildata" :city="valueRef" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
const style = {
  "min-width": "80px",
  "font-weight": "900",
};
import axios from "axios";
import { ref, watch, provide } from "vue";
// import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import sendmainComponent from "../../components/mailView/SendComponent.vue";
import { NTabs, NTabPane } from "naive-ui";
import { useUserStore } from "../../stores/userdata";
const store = useUserStore();
const canusecitys = store.citys;
const valueRef = ref(null);
const panelsRef = ref([]);

let totalData = [];
//權限
function cancity() {
  if (canusecitys.includes(2)) {
    panelsRef.value.push("台北市");
  }

  if (canusecitys.includes(3)) {
    panelsRef.value.push("新北市");
  }

  if (canusecitys.includes(4)) {
    panelsRef.value.push("桃園市");
  }

  if (canusecitys.includes(5)) {
    panelsRef.value.push("新竹市");
  }

  if (canusecitys.includes(6)) {
    panelsRef.value.push("新竹縣");
  }

  if (canusecitys.includes(20)) {
    panelsRef.value.push("竹科");
  }

  if (canusecitys.includes(7)) {
    panelsRef.value.push("苗栗縣");
  }

  if (canusecitys.includes(8)) {
    panelsRef.value.push("台中市");
  }

  if (canusecitys.includes(12)) {
    panelsRef.value.push("嘉義市");
  }

  if (canusecitys.includes(13)) {
    panelsRef.value.push("嘉義縣");
  }

  if (canusecitys.includes(14)) {
    panelsRef.value.push("台南市");
  }

  if (canusecitys.includes(15)) {
    panelsRef.value.push("高雄市");
  }

  if (canusecitys.includes(16)) {
    panelsRef.value.push("屏東縣");
  }

  if (canusecitys.includes(19)) {
    panelsRef.value.push("台東縣");
  }
}

provide("getData", getData);
async function getData() {
  try {
    const url = `${import.meta.env.VITE_NODE_URL}/mail/mailcontent`;
    const res = await axios.get(url);
    // console.log(res);
    totalData = res.data.data;
    filtermailData();
  } catch (error) {
    console.log(error);
  }
}

const maildata = ref([]);
//篩選以選重的資料
function filtermailData() {
  maildata.value = totalData.filter(
    (item) => item.city_name === valueRef.value
  );
}

//選擇城市發生改變就重新給值
watch(valueRef, () => {
  filtermailData();
});

(async () => {
  cancity();

  //沒有城市權限則跳出
  if (panelsRef.value.length === 0) {
    return;
  }

  //default是第一個
  valueRef.value = panelsRef.value[0];
  await getData();
})();
</script>

<style lang="scss" scoped></style>
