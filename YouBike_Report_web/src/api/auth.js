import apiClient from "./index";

/**
 * 使用者登入
 * @param {Object} data - 包含 account 和 password 的物件
 */
export const login = (data) => {
  return apiClient.post("/auth/login", data);
};

// 取得動態左側選單
export const getMenus = () => {
  return apiClient.get("/auth/menus");
};