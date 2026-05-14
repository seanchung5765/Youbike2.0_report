import apiClient from "./index";

// 取得 GCP 報表資料 (泛用型)
export const getGcpReport = (params) => {
  return apiClient.get("/report/gcpfun", { params });
};