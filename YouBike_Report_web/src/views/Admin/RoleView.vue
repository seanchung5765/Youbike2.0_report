<template>
  <div class="container-fluid px-0">
    <loading
      v-model:active="isLoading"
      :can-cancel="false"
      :is-full-page="true"
    />
    <div class="row mx-0">
      <h1 class="report-h1 fw-bold">角色權限管理</h1>
      <div class="px-0 pb-2 d-flex justify-content-end">
        <button type="button" class="btn btn-success" @click="addmodel">
          新增角色
        </button>
      </div>
    </div>
    <n-space vertical>
      <n-table striped>
        <thead>
          <tr>
            <th>角色名稱</th>
            <th>功能</th>
            <th>功能</th>
            <th>功能</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in roles" :key="item.role_id">
            <td>{{ item["role_name"] }}</td>
            <td>
              <button
                type="button"
                class="btn btn-success"
                @click="lookmodel(item['role_id'], item['role_name'])"
              >
                查看
              </button>
            </td>
            <td>
              <button
                type="button"
                class="btn btn-primary"
                @click="editmodel(item['role_id'], item['role_name'])"
              >
                編輯
              </button>
            </td>
            <td>
              <button
                type="button"
                class="btn btn-danger"
                @click="deletemodel(item['role_id'], item['role_name'])"
              >
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </n-table>
    </n-space>
  </div>
  <RolepageAlert
    :isopen="openModel"
    @closemodel="closemodel"
    :title="howname"
    v-model:rolename="rolename"
    :clickid="clickid"
    :data="data"
    :use="use"
    @getrolelist="getdata"
  ></RolepageAlert>
</template>

<script setup>
import { ref, inject, onMounted } from "vue";
import { NTable, NSpace } from "naive-ui";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import RolepageAlert from "../../components/RolepageAlert.vue";
import { getRoles, deleteRole, getAllPages, getRolePages } from "@/api/admin";

const swal = inject("$swal");

const isLoading = ref(false);
const use = ref("");
const openModel = ref(false);
const clickid = ref(null);
const roles = ref([]);
const data = ref([]);
const howname = ref("");
const rolename = ref(""); // 🚀 新增：專門用來綁定與編輯角色名稱

// 動態分組函式：不再用數字 (page_type) 寫死，改用分類名稱 (category_name)
const groupPagesByType = (pagesArray) => {
  const map = new Map();
  
  pagesArray.forEach(page => {
    // 直接吃資料庫 JOIN 出來的名稱！
    const catName = page.category_name || "其他功能"; 
    
    if (!map.has(catName)) {
      map.set(catName, { categoryName: catName, items: [] }); 
    }
    map.get(catName).items.push(page);
  });
  
  return Array.from(map.values()); 
};

// --- 共用邏輯：取得並比對角色權限資料 (給查看、編輯共用) ---
const fetchAndProcessRolePages = async (id) => {
  const [rolePagesRes, allPagesRes] = await Promise.all([
    getRolePages(id),
    getAllPages()
  ]);

  const canUsePageIds = rolePagesRes.data.data.map(p => p.page_id);
  const allPages = allPagesRes.data.data;

  // 標記哪些頁面是有權限的
  const processedPages = allPages.map(page => ({
    ...page,
    isselect: canUsePageIds.includes(page.page_id)
  }));

  // 回傳動態分組後的陣列
  return groupPagesByType(processedPages);
};

// -----------------------------------------

// 取得角色列表
const getdata = async () => {
  try {
    isLoading.value = true;
    const res = await getRoles();
    roles.value = res.data.data;
  } catch (error) {
    console.error("取得角色列表失敗", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getdata();
});

const setmodel = () => {
  openModel.value = true;
};

const closemodel = () => {
  openModel.value = false;
};

// --- 功能按鈕事件 ---

// 查看角色
const lookmodel = async (id, name) => {
  try {
    isLoading.value = true;
    howname.value = "查看角色"; // 🚀 固定標題
    rolename.value = name;      // 🚀 帶入目前的名稱供顯示
    use.value = "look";
    setmodel();
    data.value = await fetchAndProcessRolePages(id);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// 編輯角色
const editmodel = async (id, name) => {
  try {
    isLoading.value = true;
    howname.value = "編輯角色"; // 🚀 固定標題
    rolename.value = name;      // 🚀 帶入目前的名稱供編輯
    clickid.value = id;
    use.value = "edit";
    setmodel();
    data.value = await fetchAndProcessRolePages(id);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// 新增角色
const addmodel = async () => {
  try {
    isLoading.value = true;
    howname.value = "新增角色"; // 🚀 固定標題
    rolename.value = "";        // 🚀 清空名稱讓使用者自己打
    use.value = "add";
    setmodel();
    
    const res = await getAllPages();
    const allPages = res.data.data.map(page => ({
      ...page,
      isselect: false
    }));
    
    data.value = groupPagesByType(allPages);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// 刪除角色與彈窗確認
const deletemodel = async (id, name) => {
  const payload = {
    title: `確定刪除 "${name}" 嗎`,
    text: "刪除了將不可復原",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "是的",
    cancelButtonText: "取消",
  };
  
  const result = await swal(payload);
  if (result.isConfirmed) {
    try {
      isLoading.value = true;
      await deleteRole(id); 
      await getdata(); 
      swal({ icon: "success", title: "刪除成功", showConfirmButton: false, timer: 1500 });
    } catch (error) {
      console.error(error);
      swal({ icon: "error", title: "刪除失敗" });
    } finally {
      isLoading.value = false;
    }
  }
};
</script>