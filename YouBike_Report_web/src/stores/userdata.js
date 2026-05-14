import { ref } from "vue";
import { defineStore } from "pinia";
import { getMenus } from "@/api/auth";

export const useUserStore = defineStore("userdata", () => {
  const userPages = ref([]); 
  const token = ref(null);
  const citys = ref(null);
  const userId = ref(null);
  const menus = ref([]);

  // 從後端取得該角色的「過濾選單」
  const fetchMenus = async () => {
    try {
      // 🌟 優化 1：建議換成環境變數，例如 `${import.meta.env.VITE_API_URL}/auth/menus`
      // 如果你的 axios 有設定 baseURL，這裡甚至可以直接寫 "/auth/menus"
      const res = await getMenus();
      menus.value = res.data.data;
    } catch (error) {
      console.error("選單抓取失敗", error);
    }
  };

  function getdata() {
    let isTokenLife = false;
    const cookies = document.cookie.split(";");
    cookies.forEach((item) => {
      if (item.split("=")[0].trim() === "youbike") {
        isTokenLife = true;
        token.value = item.split("=")[1];
      }
    });
    
    if (isTokenLife) {
      
      // 取得解碼後的 payload
      const payload = decodeToken(token.value);
      
      // 🌟 如果解碼失敗 (回傳 null)，就當作沒登入
      if (!payload) return false; 
      
      userPages.value = [...getUsePages(payload)];
      citys.value = [...getCanUseCity(payload)];
      userId.value = payload.userId;
      
      if (menus.value.length === 0) {
        fetchMenus();
      }
      return true; 
    }
    return false; 
  }

  // 🌟 優化：加上手動清空狀態的 function，登出時可以直接呼叫 store.resetAll()
  function resetAll() {
    userPages.value = [];
    menus.value = [];
    token.value = null;
    userId.value = null;
    citys.value = null;
  }

  return { userPages, getdata, token, citys, userId, menus, fetchMenus, resetAll };
});

// --- 下面是輔助解碼的 Function ---

function decodeToken(token) {
  // 🌟 優化 2：加上 try...catch 防呆
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error("Token 解析失敗:", error);
    return null;
  }
}

const getCanUseCity = (payload) => {
  // 🌟 優化 3：直接存取，不需要跑迴圈
  if (payload && Array.isArray(payload.city_cows)) {
    return payload.city_cows.map(element => element.city_id);
  }
  return [];
};

const getUsePages = (payload) => {
  const arr = [];
  for (const key in payload) {
    if (payload[key] && payload[key]["page_id"]) {
      arr.push(Number(payload[key]["page_id"])); 
    }
  }
  return arr;
};