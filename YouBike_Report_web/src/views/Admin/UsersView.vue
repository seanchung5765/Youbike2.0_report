<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">使用者角色管理</h1>
    </div>
    
    <form
      class="row mx-0 py-2"
      :class="{ 'report-header': !ischange, 'report-header-dark': ischange }"
    >
      <div class="row align-items-center col-md-auto col-12 pe-0">
        <label class="col-md-auto col-form-label fw-bolder pe-0">新增/搜尋帳號:</label>
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-4 col-12 px-0">
        <n-select
          v-model:value="searchvalue"
          :options="option"
          placeholder="請選擇或輸入帳號來賦予權限..."
          filterable
          clearable
          style="min-width: 300px;"
        />
      </div>
      <div class="row mx-0 mx-md-2 align-items-center col-md-auto col-12">
        <button
          type="button"
          class="btn btn-primary text-light mt-3 mt-md-0 col-md-auto mx-md-2 fw-bold"
          @click="search"
        >
          加入編輯列表
        </button>
      </div>
    </form>
    
    <hr />

    <div class="mx-3 mt-3">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h4 class="fw-bold mb-2 mb-md-0">目前擁有權限的清單</h4>
        <div style="max-width: 300px; width: 100%;">
          <input 
            type="text" 
            class="form-control" 
            placeholder="🔍 搜尋清單中的姓名或工號..." 
            v-model="localSearchQuery"
          >
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover table-bordered align-middle text-center">
          <thead class="table-dark">
            <tr>
              <th scope="col" style="width: 5%">序號</th>
              <th scope="col" style="width: 15%">姓名</th>
              <th scope="col" style="width: 15%">工號</th>
              <th scope="col" style="width: 35%">角色</th>
              <th scope="col" style="width: 30%">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredPermissionUsers.length === 0">
              <td colspan="5" class="text-muted py-3">
                {{ localSearchQuery ? '找不到符合關鍵字的使用者' : '目前沒有擁有權限的使用者' }}
              </td>
            </tr>
            <tr v-for="(item, index) in filteredPermissionUsers" :key="item.users_id">
              <td class="fw-bold text-muted">{{ index + 1 }}</td>
              <td class="fw-bold">{{ item.name }}</td>
              <td>{{ item.users_id }}</td>
              
              <td>
                <template v-if="!item.isEditing">
                  <span class="badge bg-secondary fs-6" v-if="!item.role_name || item.role_name === ' '">無角色</span>
                  <span class="badge bg-info text-dark fs-6" v-else>{{ item.role_name }}</span>
                </template>
                
                <template v-else>
                  <select class="form-select mx-auto" style="max-width: 300px;" v-model="item.edit_role_id">
                    <option value="" disabled>請選擇要修改的角色...</option>
                    <option
                      v-for="r in roles"
                      :key="r.role_id"
                      :value="r.role_id"
                    >
                      {{ r.role_name }}
                    </option>
                  </select>
                </template>
              </td>

              <td>
                <div v-if="!item.isEditing">
                  <button 
                    type="button" 
                    class="btn btn-warning btn-sm fw-bold px-3 me-2" 
                    @click="editRow(item)"
                  >
                    編輯
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-danger btn-sm fw-bold px-3" 
                    @click="deleteRow(item)"
                  >
                    刪除
                  </button>
                </div>

                <div v-else>
                  <button type="button" class="btn btn-success btn-sm fw-bold px-3 me-2" @click="confirmRow(item)">
                    確認
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm fw-bold px-3" @click="cancelEdit(item)">
                    取消
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from "vue";
import { NSelect } from "naive-ui";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { getRoles, getUserRoles, getUserRole, updateUserRole, deleteUser } from "@/api/admin";
import { useUserStore } from "../../stores/userdata";

const swal = inject("$swal");
const ischange = inject("ischange");
const store = useUserStore();

const myEmpId = store.userId || store.account || "";

const isLoading = ref(false);
const option = ref([]);
const roles = ref([]);
const permissionUsers = ref([]);
const searchvalue = ref(null);
const localSearchQuery = ref("");

const showAlert = (icon, text) => swal({ icon, title: text, showConfirmButton: false, timer: 1500 });

const filteredPermissionUsers = computed(() => {
  if (!localSearchQuery.value) {
    return permissionUsers.value;
  }
  const query = localSearchQuery.value.toLowerCase().trim();
  return permissionUsers.value.filter(user => {
    return (
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.users_id && user.users_id.toLowerCase().includes(query)) ||
      (user.role_name && user.role_name.toLowerCase().includes(query))
    );
  });
});

const getdata = async () => {
  try {
    isLoading.value = true;
    const [rolesRes, userRolesRes] = await Promise.all([
      getRoles(),
      getUserRoles()
    ]);

    roles.value = rolesRes.data.data || [];
    const allUsers = userRolesRes.data.data || [];

    const superRoleName = roles.value.find(r => r.role_id === 1)?.role_name || "超級管理員";
    const me = allUsers.find(u => u.users_id === myEmpId);
    const isSuperAdmin = me && me.role_name === superRoleName;

    // 給「下拉選單」用的名單：保留所有 LDAP 的人，但非超管不能看到自己
    const searchableUsers = allUsers.filter(u => {
      if (!isSuperAdmin && u.users_id === myEmpId) return false;
      return true;
    });

    option.value = searchableUsers.map((element) => ({
      label: `${element.name}_${element.users_id} ${element.role_name && element.role_name.trim() !== '' ? '('+element.role_name+')' : ''}`,
      value: element.users_id,
    }));

    // 給「下方表格」用的名單：必須是已經有設定權限的人
    const tableUsers = searchableUsers.filter(u => {
      const hasRole = u.role_name && u.role_name.trim() !== "";
      return hasRole;
    });

    permissionUsers.value = tableUsers.map((u) => {
      const matchedRole = roles.value.find(r => r.role_name === u.role_name);
      return {
        ...u,
        edit_role_id: matchedRole ? matchedRole.role_id : "",
        isEditing: false
      };
    });

  } catch (error) {
    console.error("載入初始資料失敗", error);
    showAlert("error", "載入資料失敗");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getdata();
});

const search = async () => {
  try {
    if (!searchvalue.value) return showAlert("error", "請先選擇帳號");

    const existInList = permissionUsers.value.find(u => u.users_id === searchvalue.value);
    if (existInList) {
      searchvalue.value = null;
      existInList.isEditing = true;
      localSearchQuery.value = ""; 
      return showAlert("success", "該帳號已在清單中，已為您開啟編輯模式");
    }

    isLoading.value = true;
    const res = await getUserRole(searchvalue.value);
    if (!res.data.data || res.data.data.length === 0) {
      return showAlert("error", "查無此工號，請確認輸入是否正確");
    }

    const userData = res.data.data[0];
    
    // 🚀 新增的人會被推到最上面 (序號 1)，方便立刻編輯
    permissionUsers.value.unshift({
      ...userData,
      edit_role_id: "", 
      isEditing: true
    });

    searchvalue.value = null;
    localSearchQuery.value = "";
  } catch (error) {
    console.error(error);
    showAlert("error", "查詢失敗");
  } finally {
    isLoading.value = false;
  }
};

const editRow = (item) => {
  item.isEditing = true;
};

const cancelEdit = (item) => {
  item.isEditing = false;
  const matchedRole = roles.value.find(r => r.role_name === item.role_name);
  item.edit_role_id = matchedRole ? matchedRole.role_id : "";
};

const deleteRow = async (item) => {
  const confirmResult = await swal({
    title: `確定要刪除 ${item.name} 嗎？`,
    text: "這將會移除該員在報表系統的所有角色與城市權限！",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "刪除",
    cancelButtonText: "取消"
  });

  if (confirmResult.isConfirmed) {
    try {
      isLoading.value = true;
      await deleteUser(item.users_id);
      showAlert("success", "已成功刪除該使用者紀錄");
      
      // 🚀 核心修改：刪除後只從前端陣列中移除他，不觸發 getdata() 刷掉其他人
      permissionUsers.value = permissionUsers.value.filter(u => u.users_id !== item.users_id);
      
    } catch (error) {
      console.error(error);
      showAlert("error", "刪除失敗");
    } finally {
      isLoading.value = false;
    }
  }
};

const confirmRow = async (item) => {
  try {
    if (item.edit_role_id === "") return showAlert("error", "請選擇角色");

    isLoading.value = true;
    const payload = { role: item.edit_role_id, name: item.name };
    await updateUserRole(item.users_id, payload);
    showAlert("success", "角色修改成功");

    // 🚀 核心修改：確認後不觸發 getdata()，直接把前端這筆資料轉成非編輯狀態
    const matchedRole = roles.value.find(r => r.role_id === item.edit_role_id);
    item.role_name = matchedRole ? matchedRole.role_name : "";
    item.isEditing = false;
    
  } catch (error) {
    console.error(error);
    showAlert("error", "修改失敗");
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.form-select {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
</style>