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
  if (payload && Array.isArray(payload.city_cows)) {
    return payload.city_cows.map(element => element.city_id);
  }
  return [];
};

// 🚀 核心修正：直接對接後端乾淨的 payload.pages
const getUsePages = (payload) => {
  if (payload && Array.isArray(payload.pages)) {
    return payload.pages.map(element => Number(element.page_id));
  }
  return [];
};