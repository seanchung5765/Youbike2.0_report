<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">使用者可閱地區</h1>
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
          placeholder="請選擇員工 (可多選)..."
          filterable
          clearable
          multiple
          :max-tag-count="2"
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
        <h4 class="fw-bold mb-2 mb-md-0">目前擁有地區使用者清單</h4>
        <div style="max-width: 300px; width: 100%;">
          <input 
            type="text" 
            class="form-control" 
            placeholder="🔍 搜尋姓名、工號或地區..." 
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
              <th scope="col" style="width: 45%">擁有地區權限</th>
              <th scope="col" style="width: 20%">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredPermissionUsers.length === 0">
              <td colspan="5" class="text-muted py-3">
                {{ localSearchQuery ? '找不到符合關鍵字的使用者或地區' : '目前沒有設定地區權限的使用者' }}
              </td>
            </tr>
            
            <tr v-for="(item, index) in filteredPermissionUsers" :key="item.users_id">
              <td class="fw-bold text-muted">{{ index + 1 }}</td>
              <td class="fw-bold">{{ item.name }}</td>
              <td>{{ item.users_id }}</td>
              
              <td class="text-start px-4">
                <template v-if="!item.isEditing">
                  <span 
                    v-for="city in item.cities.filter(c => c.isselect)" 
                    :key="city.city_id" 
                    class="badge bg-info text-dark fs-6 me-2 mb-1"
                  >
                    {{ city.city_name }}
                  </span>
                  <span v-if="item.cities.filter(c => c.isselect).length === 0" class="badge bg-secondary fs-6">
                    目前無任何地區權限
                  </span>
                </template>
                
                <template v-else>
                  <n-select
                    v-model:value="item.selectedCityIds"
                    multiple
                    filterable
                    :options="citySelectOptions"
                    placeholder="請勾選地區..."
                    :max-tag-count="4"
                    style="min-width: 250px;"
                  />
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
                  <button type="button" class="btn btn-success btn-sm fw-bold px-3 me-2 mb-1 mb-md-0" @click="confirmRow(item)">
                    儲存
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
// 🚀 引入 deleteUser API
import { getUserRoles, getUserRole, getAllCities, updateUserCities, getAllUserCitiesAll, deleteUser } from "@/api/admin";

const swal = inject("$swal");
const ischange = inject("ischange");

const isLoading = ref(false);
const option = ref([]);
const permissionUsers = ref([]);
const searchvalue = ref([]);
const localSearchQuery = ref("");
const allActiveCitiesList = ref([]);

const showAlert = (icon, text) => swal({ icon, title: text, showConfirmButton: false, timer: 1500 });

const citySelectOptions = computed(() => {
  return allActiveCitiesList.value.map(c => ({
    label: c.city_name,
    value: c.city_id
  }));
});

const filteredPermissionUsers = computed(() => {
  if (!localSearchQuery.value) return permissionUsers.value;
  const query = localSearchQuery.value.toLowerCase().trim();
  
  return permissionUsers.value.filter(user => {
    if (user.name && user.name.toLowerCase().includes(query)) return true;
    if (user.users_id && user.users_id.toLowerCase().includes(query)) return true;
    const hasMatchingCity = user.cities.some(c => c.isselect && c.city_name.toLowerCase().includes(query));
    if (hasMatchingCity) return true;
    return false;
  });
});

const getdata = async () => {
  try {
    isLoading.value = true;
    const [rolesRes, citiesRes, allUserCitiesRes] = await Promise.all([
      getUserRoles(),
      getAllCities(),
      getAllUserCitiesAll()
    ]);

    const allUsers = rolesRes.data.data || [];
    allActiveCitiesList.value = citiesRes.data.data.filter(c => c.status === 'active');
    const mappedUserCities = allUserCitiesRes.data.data || [];

    const userCityMap = {};
    mappedUserCities.forEach(item => {
      if (!userCityMap[item.users_id]) userCityMap[item.users_id] = [];
      userCityMap[item.users_id].push(item.city_id);
    });

    option.value = allUsers.map((element) => ({
      label: `${element.name}_${element.users_id}`,
      value: element.users_id,
    }));

    const usersWithCities = allUsers.filter(u => userCityMap[u.users_id] && userCityMap[u.users_id].length > 0);

    permissionUsers.value = usersWithCities.map(u => {
      const myCityIds = userCityMap[u.users_id] || [];
      const citiesState = allActiveCitiesList.value.map(city => ({
        ...city,
        isselect: myCityIds.includes(city.city_id)
      }));
      
      return {
        ...u,
        cities: citiesState,
        selectedCityIds: [],
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
    if (!searchvalue.value || searchvalue.value.length === 0) return showAlert("error", "請先選擇帳號");

    isLoading.value = true;
    
    for (const userId of searchvalue.value) {
      const existInList = permissionUsers.value.find(u => u.users_id === userId);
      if (existInList) {
        editRow(existInList);
        continue;
      }

      const res = await getUserRole(userId);
      if (res.data.data && res.data.data.length > 0) {
        const userData = res.data.data[0];
        
        permissionUsers.value.unshift({
          ...userData,
          cities: allActiveCitiesList.value.map(c => ({ ...c, isselect: false })),
          selectedCityIds: [],
          isEditing: true
        });
      }
    }

    searchvalue.value = [];
    localSearchQuery.value = "";
    showAlert("success", "已加入編輯列表");
  } catch (error) {
    console.error(error);
    showAlert("error", "查詢失敗");
  } finally {
    isLoading.value = false;
  }
};

const editRow = (item) => {
  item.selectedCityIds = item.cities.filter(c => c.isselect).map(c => c.city_id);
  item.isEditing = true;
};

const cancelEdit = (item) => {
  item.isEditing = false;
};

// 🚀 核心邏輯處理函式：處理清空或刪除動作
const handleClearOrDelete = async (item) => {
  const hasRole = item.role_name && item.role_name.trim() !== "";
  
  if (!hasRole) {
    // 沒角色也沒地區，全刪除
    await deleteUser(item.users_id);
    showAlert("success", "已移除地區權限，並清除無效帳號");
  } else {
    // 有角色，只清空地區
    await updateUserCities(item.users_id, []);
    showAlert("success", "已清空地區權限");
  }

  // 從畫面上移除
  permissionUsers.value = permissionUsers.value.filter(u => u.users_id !== item.users_id);
};

// 🚀 刪除按鈕
const deleteRow = async (item) => {
  const confirmResult = await swal({
    title: `確定要移除 ${item.name} 的地區權限嗎？`,
    text: "這將會清空該員的所有地區權限！",
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
      await handleClearOrDelete(item);
    } catch (error) {
      console.error(error);
      showAlert("error", "刪除失敗");
    } finally {
      isLoading.value = false;
    }
  }
};

// 🚀 儲存按鈕
const confirmRow = async (item) => {
  try {
    isLoading.value = true;
    
    const payload = item.selectedCityIds.map(id => ({ city_id: id }));

    // 如果把城市全拔掉，視同刪除動作
    if (payload.length === 0) {
      await handleClearOrDelete(item);
      return;
    }

    // 正常更新
    await updateUserCities(item.users_id, payload);
    showAlert("success", "地區權限儲存成功");
    
    item.cities.forEach(c => {
      c.isselect = item.selectedCityIds.includes(c.city_id);
    });
    
    item.isEditing = false;
  } catch (error) {
    console.error(error);
    showAlert("error", "修改失敗");
  } finally {
    isLoading.value = false;
  }
};
</script>