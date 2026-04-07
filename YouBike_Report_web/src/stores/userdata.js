import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("counter", () => {
  const page = ref(null);
  const token = ref(null);
  const citys = ref(null);
  const userId = ref(null);
  // const userEmail = ref(null);
  //把cookie取出後 在處理成token存起來
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
      // 每次 axios 發出請求自動帶入標頭
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
      const payload = decodeToken(token.value);
      page.value = [...getUsePages(payload)];
      citys.value = [...getCanUseCity(payload)];
      userId.value = payload.userId;
    }
  }
  return { page, getdata, token, citys, userId };
});

function decodeToken(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

const getCanUseCity = (payload) => {
  const cities = [];
  for (const key in payload) {
    //console.log(`payload key = ${key}`);
    if (key === "city_cows") {
      payload.city_cows.forEach((element) => {
        //console.log(`element = ${JSON.stringify(element)}`);
        cities.push(element.city_id);
      });
    }
  }

  return cities;
};

// 把token解碼 後把上面的腳色存起來
const getUsePages = (payload) => {
  const arr = [];
  const cityArr = [];
  for (const key in payload) {
    if (payload[key]["page_id"]) {
      arr.push(payload[key]["page_id"]);
    }
    if (key === "city_cows") {
      payload.city_cows.forEach((element) => {
        cityArr.push(element.city_id);
      });
    }
  }
  return arr;
};
