<template>
  <div class="container-fluid">
    <n-card style="margin-bottom: 16px">
      <n-tabs type="line" animated size="large">
        <n-tab-pane name="PageoneView" tab="首頁">
          <PageOneView />
        </n-tab-pane>
        <n-tab-pane name="PageTwoView" tab="營運處">
          <PageTwoView />
        </n-tab-pane>
        <n-tab-pane name="PageThreeView" tab="見車見位">
          <PageThreeView />
        </n-tab-pane>
        <n-tab-pane name="PageFourView" tab="無車無位">
          <PageFourView />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { NCard, NTabs, NTabPane } from "naive-ui";
import PageOneView from "../components/frontpage/PageOneView.vue";
import PageTwoView from "../components/frontpage/PageTwoView.vue";
import PageThreeView from "../components/frontpage/PageThreeView.vue";
import PageFourView from "../components/frontpage/PageFourView.vue";
</script>

<style></style>
