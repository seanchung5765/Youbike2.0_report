<!--負責顯示 首頁四大天王 -->
<template>
  <div class="container-fluid">
    <n-card style="margin-bottom: 16px">
      <n-tabs type="line" animated size="large">
        <n-tab-pane name="DailySummaryTab" tab="營運儀表板">
          <DailySummaryTab />
        </n-tab-pane>
        <n-tab-pane name="RideTrendTab" tab="騎乘數">
          <RideTrendTab />
        </n-tab-pane>
        <n-tab-pane name="BikeSlotRateTab" tab="見車見位">
          <BikeSlotRateTab />
        <!--</n-tab-pane>
        <n-tab-pane name="OverviewTab" tab="無車無位">
          <OverviewTab />-->
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { NCard, NTabs, NTabPane } from "naive-ui";
import DailySummaryTab from "../components/frontpage/DailySummaryTab.vue";
import RideTrendTab from "../components/frontpage/RideTrendTab.vue";
import BikeSlotRateTab from "../components/frontpage/BikeSlotRateTab.vue";
//import OverviewTab from "../components/frontpage/OverviewTab.vue";
</script>

<style></style>
