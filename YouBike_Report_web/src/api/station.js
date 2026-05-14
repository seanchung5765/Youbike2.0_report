import apiClient from "./index";

// 取得全台縣市字典
export const getCityList = () => {
  return apiClient.get("/station/cities");
};