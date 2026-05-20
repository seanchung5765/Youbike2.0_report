import apiClient from "./index";

// 取得 GCP 報表資料 (泛用型)
export const getGcpReport = (params) => {
  return apiClient.get("/report/gcpfun", { params });
};

// 1.0 交易查詢
export const getV1Transaction = (data) => {
  return apiClient.post('/report/v1/transaction', data);
};