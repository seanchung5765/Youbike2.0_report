import apiClient from "./index";


//RolecityView.vue
// 取得所有員工名單 (供 Mention 選單使用)
export const getUserRoles = () => apiClient.get("/admin/userrole");

// 取得特定員工的城市權限
export const getUserCities = (id) => apiClient.get(`/admin/usercity/${id}`);

// 取得系統中所有的城市列表
export const getAllCities = () => apiClient.get("/admin//citys");

// 更新特定員工的城市權限
export const updateUserCities = (id, data) => apiClient.put(`/admin/role_citys/${id}`, data);

export const deleteUser = (id) => apiClient.delete(`/admin/users/${id}`);


//RoleView.vue
// 取得所有角色
export const getRoles = () => apiClient.get("/admin/roles");

// 新增角色
export const createRole = (data) => apiClient.post("/admin/role", data);

// 更新角色的頁面權限
export const updateRolePages = (id, data) => apiClient.put(`/admin/role/${id}`, data);

// 刪除角色
export const deleteRole = (id) => apiClient.delete(`/admin/role/${id}`);

// 取得所有頁面清單
export const getAllPages = () => apiClient.get("/admin/pages"); 

// 取得特定角色的可用頁面
export const getRolePages = (id) => apiClient.get(`/admin/role_pages/${id}`);


//UsersView.vue
// 取得特定帳號的角色詳細資料
export const getUserRole = (id) => apiClient.get(`/admin/role/${id}`);

// 更新特定帳號的角色 (注意：這裡是用 PATCH)
export const updateUserRole = (id, data) => apiClient.patch(`/admin/role/${id}`, data);