<template>
  <n-config-provider :theme="theme" style="height: 100vh">
    <n-layout has-sider style="height: 100vh">
      <n-layout-sider
        v-if="route.path != '/login' && route.path != '/YouBike_portal'"
        :default-collapsed="true"
        collapse-mode="transform"
        :native-scrollbar="false"
        :collapsed-width="0"
        :width="240"
        show-trigger="bar"
        bordered
      >
        <n-menu
          :options="dynamicMenuOptions"
          :collapsed-icon-size="22"
          :value="routeValue"
          class="fw-bold"
        />
        <div class="text-center mb-3">
          <n-switch :rail-style="railStyle" @update:value="handleChange">
            <template #checked> 暗暗模式 </template>
            <template #unchecked> 亮亮模式 </template>
          </n-switch>
        </div>
        <n-dropdown trigger="click" :options="options">
          <div class="text-center">
            <Icon size="30">
              <IosSettings></IosSettings>
            </Icon>
          </div>
        </n-dropdown>
      </n-layout-sider>
      <n-layout-content content-style="padding: 24px;">
        <slot></slot>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { useUserStore } from "@/stores/userdata";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { h, ref, watchEffect, provide, computed } from "vue";
import {
  NLayout, NLayoutSider, NLayoutContent, NIcon,
  NMenu, NDropdown, NConfigProvider, darkTheme, NSwitch,
} from "naive-ui";
// 引入所有你會用到的 Icon
import { Home, ChatboxEllipsesSharp } from "@vicons/ionicons5";
import { IosSettings } from "@vicons/ionicons4";
import { Book, User, Gift, MailBulk } from "@vicons/fa";
import { Icon } from "@vicons/utils";
import { Report, Account } from "@vicons/carbon";

const router = useRouter();
const route = useRoute();
const store = useUserStore();
const theme = ref(null);
let ischange = ref(0);
provide("ischange", ischange);

const handleChange = () => {
  if (theme.value == null) {
    ischange.value = 1;
    theme.value = darkTheme;
  } else {
    ischange.value = 0;
    theme.value = null;
  }
};

// --- 動態選單生成邏輯 ---
store.getdata(); // 觸發抓取資料與選單

// 建立一個字典，把資料庫的字串對應到實際的 Icon 元件
const iconMap = {
  'Home': Home,
  'Report': Report,
  'User': User,
  'Gift': Gift,
  'MailBulk': MailBulk,
  'ChatboxEllipsesSharp': ChatboxEllipsesSharp,
  'Book': Book
};

function renderIcon(icon) {
  if (!icon) return null;
  return () => h(NIcon, { size: 20 }, { default: () => h(icon) });
}

// 遞迴函式
const buildNaiveMenu = (menuData) => {
  return menuData.map(item => {
    // 基本架構
    const currentItem = {
      // 一律使用資料庫的 id 當作唯一 Key
      key: String(item.id),
      // 去資料庫找 icon_code，如果找不到就用預設的
      icon: item.icon_code ? renderIcon(iconMap[item.icon_code]) : undefined,
    };

    if (item.children && item.children.length > 0) {
      // 如果有子選單，代表它是一個目錄
      currentItem.label = item.name;
      currentItem.children = buildNaiveMenu(item.children);
    } else {
      // 如果沒有子選單，代表它是實際頁面，套用 RouterLink
      // 加上 fallback 防呆，如果真的沒路由就回首頁
      currentItem.label = () =>
        h(RouterLink, { to: { path: item.route_code || '/' } }, { default: () => item.name });
    }
    return currentItem;
  });
};
// 使用 computed 讓選單隨時保持最新狀態
const dynamicMenuOptions = computed(() => {
  const backendMenus = store.menus || [];
  
  // 你可以把「首頁」這類固定的東西手動加在最前面
  const defaultMenu = [
    {
      label: () => h(RouterLink, { to: { path: "/" } }, { default: () => "首頁" }),
      key: "/",
      icon: renderIcon(Home),
    }
  ];

  const generatedMenus = buildNaiveMenu(backendMenus);
  
  // 組合起來：首頁 + 後端動態選單
  return [...defaultMenu, ...generatedMenus];
});
// ---------------------------------

const options = [
  {
    label: "登出",
    key: "logout",
    props: {
      onClick: () => {
        // 清除 Cookie
        document.cookie = "youbike=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // 強制跳轉並重新整理頁面
        window.location.href = "/login"; 
      },
    },
  },
];

const routeValue = ref();
watchEffect(() => {
  routeValue.value = route.path;
});

const railStyle = ({ focused, checked }) => {
  const style = {};
  if (checked) {
    style.background = "#000000";
    if (focused) style.boxShadow = "0 0 0 2px #d0305040";
  } else {
    style.background = "#ff0100";
    if (focused) style.boxShadow = "0 0 0 2px #2080f040";
  }
  return style;
};
</script>

<style>
.n-menu-item-content__icon {
  margin-bottom: 5px;
}
</style>