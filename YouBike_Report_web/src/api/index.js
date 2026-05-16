import axios from "axios";
import router from "@/router"; 
import Swal from "sweetalert2";

// 🚀 關鍵修改：優先讀取雲端動態設定的網址，如果沒有（例如本機開發環境）才吃 Vite 的變數
const baseURL = window.APP_CONFIG?.API_URL || import.meta.env.VITE_NODE_URL;

const apiClient = axios.create({
  baseURL: baseURL, // 替換成剛剛宣告的變數
  timeout: 100000,
});

// 1. 請求攔截器 (Request Interceptor)：每次發 API 前自動把 Cookie 的 Token 找出來帶上
apiClient.interceptors.request.use(
  (config) => {
    // 尋找名為 youbike 的 cookie
    let token = null;
    const cookies = document.cookie.split(";");
    cookies.forEach((item) => {
      if (item.split("=")[0].trim() === "youbike") {
        token = item.split("=")[1];
      }
    });

    // 如果有 Token，就塞進 Headers 裡面
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. 回應攔截器 (Response Interceptor)：統一處理後端回傳的錯誤 (例如 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 401 代表未授權 (Token 沒帶、過期、或被竄改)
          // 清除失效的 Cookie
          document.cookie = "youbike=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          
          // 彈出提示並踢回登入頁
          Swal.fire({
            icon: "warning",
            title: "登入已過期或無效",
            text: "請重新登入！",
            showConfirmButton: true
          }).then(() => {
            router.push("/login"); // 確保你的登入頁路由是 /login
          });
          break;
        case 403:
          console.error("權限不足");
          break;
        default:
          console.error(`API 發生錯誤: ${error.response.status}`);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// 報表點擊率計數 API
export const recordClick = (pageId) => {
  // 使用設定好 baseURL 的 apiClient 默默在背景發送請求
  // 萬一網路不穩或後端沒開，.catch() 會直接吃掉錯誤，完全不影響前端畫面
  return apiClient.post('/report/record-click', { page_id: pageId }).catch(err => {
    console.warn("點擊計數背景發送失敗 (可忽略):", err);
  });
};