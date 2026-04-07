<script setup>
import { RouterView } from "vue-router";
import FrontLayout from "./components/FrontLayout.vue";
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
@import "./assets/all.scss";
</style>
