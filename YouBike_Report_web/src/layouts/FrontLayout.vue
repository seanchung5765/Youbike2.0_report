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
        <div style="display: flex; flex-direction: column; height: 100%;">
          
          <n-dropdown trigger="click" :options="options">
            <div class="user-profile text-center py-4">
              <Icon size="24" class="text-primary">
                <User />
              </Icon>
              <div class="fw-bold mt-2">{{ store.userId || store.account || '工號' }}</div>
            </div>
          </n-dropdown>

          <div style="flex: 1; overflow-y: auto; overflow-x: hidden;">
            <n-menu
              :options="dynamicMenuOptions"
              :collapsed-icon-size="22"
              :value="routeValue"
              class="fw-bold"
            />
          </div>

          <div class="text-center py-3 pb-4">
            <!--<n-switch :rail-style="railStyle" @update:value="handleChange">
              <template #checked> 暗暗模式 </template>
              <template #unchecked> 亮亮模式 </template>
            </n-switch>-->
            <div class="mt-2 fw-bold" style="font-size: 12px; color: #888; letter-spacing: 1px;">
              v2.2.3
            </div>
          </div>

        </div>
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
import { Home, ChatboxEllipsesSharp, Headset } from "@vicons/ionicons5";
import { Book, User, Gift, MailBulk } from "@vicons/fa";
import { Icon } from "@vicons/utils";
import { Report } from "@vicons/carbon";

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
  'Book': Book,
  'Headset': Headset 
};

function renderIcon(icon) {
  if (!icon) return null;
  return () => h(NIcon, { size: 20 }, { default: () => h(icon) });
}

// 遞迴函式
const buildNaiveMenu = (menuData) => {
  return menuData.map(item => {
    // 判斷是否為「主目錄」：
    const isParent = item.children && item.children.length > 0;

    // 🚀 決定圖示的邏輯
    let itemIcon = undefined;
    if (isParent) {
      if (item.icon_code && iconMap[item.icon_code]) {
        // 1. 如果資料庫有填寫 icon_code，優先使用資料庫的
        itemIcon = renderIcon(iconMap[item.icon_code]);
      } else if (item.name === '客服專區') {
        // 2. 🚀 防呆機制：如果名字叫「客服專區」但資料庫沒填，強制套用 Headset！
        itemIcon = renderIcon(Headset);
      }
    }

    const currentItem = {
      key: String(item.id),
      icon: itemIcon,
      label: item.name
    };

    if (isParent) {
      currentItem.children = buildNaiveMenu(item.children);
    } else {
      currentItem.label = () =>
        h(RouterLink, { to: { path: item.route_code || '/' } }, { default: () => item.name });
    }
    return currentItem;
  });
};

// 使用 computed 讓選單隨時保持最新狀態
const dynamicMenuOptions = computed(() => {
  const backendMenus = store.menus || [];
  
  const defaultMenu = [
    {
      label: () => h(RouterLink, { to: { path: "/" } }, { default: () => "首頁" }),
      key: "/",
      icon: renderIcon(Home),
    }
  ];

  const generatedMenus = buildNaiveMenu(backendMenus);
  
  return [...defaultMenu, ...generatedMenus];
});
// ---------------------------------

// 下拉選單：包含登出按鈕
const options = [
  {
    label: "登出系統",
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

/* 🚀 使用者名稱區塊的 Hover 互動效果 */
.user-profile {
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;
}
.user-profile:hover {
  opacity: 0.7;
}
</style>