import axios from "axios";
import router from "@/router"; 
import Swal from "sweetalert2";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_NODE_URL,
  timeout: 100000,
});

//  1. 請求攔截器 (Request Interceptor)：每次發 API 前自動把 Cookie 的 Token 找出來帶上
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