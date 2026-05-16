<!--負責總畫面排版-->
<script setup>
import { RouterView } from "vue-router";
import FrontLayout from "./layouts/FrontLayout.vue";
import { NConfigProvider } from "naive-ui";
import { zhTW, dateZhTW } from "naive-ui";
</script>

<template>
  <n-config-provider :locale="zhTW" :date-locale="dateZhTW">
    <FrontLayout>
      <RouterView />
    </FrontLayout>
  </n-config-provider>
</template>

<style lang="scss">
// 將 @import 改為 @use
@use "./assets/all.scss";
</style>