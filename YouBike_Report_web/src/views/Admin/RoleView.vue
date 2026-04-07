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
    :clickid="clickid"
    :data="data"
    :use="use"
    @getrolelist="getdata"
  ></RolepageAlert>
</template>

<script setup>
import axios from "axios";
import { ref, inject } from "vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import RolepageAlert from "../../components/RolepageAlert.vue";
import { NTable, NSpace } from "naive-ui";
const swal = inject("$swal");
async function sureAlert(id, name) {
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
  const res = await swal(payload);
  if (res.isConfirmed) {
    try {
      isLoading.value = true;
      const url = `${import.meta.env.VITE_NODE_URL}/isauth/role/${id}`;
      await axios.delete(url);
      isLoading.value = false;
    } catch (error) {
      console.log(error);
    }
  }
}
const isLoading = ref(false);
const use = ref("");
const openModel = ref(false);
const clickid = ref(null);

const roles = ref([]);
const data = ref([]);
const getdata = async () => {
  try {
    isLoading.value = true;
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/roles`;
    const res = await axios.get(url);
    roles.value = [...res.data.rows];
    isLoading.value = false;
  } catch (error) {
    console.log(error);
  }
};

(async function startfun() {
  await getdata();
})();

const howname = ref("");
const setmodel = () => {
  openModel.value = true;
};

const lookmodel = async (id, name) => {
  try {
    howname.value = name;
    setmodel();
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/role_pages/${id}`;
    const url2 = `${import.meta.env.VITE_NODE_URL}/isauth/pages`;
    isLoading.value = true;
    const res = await Promise.all([axios.get(url), axios.get(url2)]);
    isLoading.value = false;
    const canusepage = res[0].data.rows;
    const allpage = res[1].data.rows;
    const arr = [];
    canusepage.forEach((element) => {
      arr.push(element.page_id);
    });

    allpage.forEach((item) => {
      if (arr.includes(item["page_id"])) {
        item["isselect"] = true;
      } else {
        item["isselect"] = false;
      }
    });
    const newarr = [];
    allpage.forEach((item) => {
      if (newarr.length < item.page_type) {
        newarr.push([]);
      }
      newarr[item.page_type - 1].push(item);
    });
    data.value = [...newarr];
    use.value = "look";
  } catch (error) {
    console.log(error);
  }
};

const editmodel = async (id, name) => {
  use.value = "edit";
  howname.value = name;
  clickid.value = id;
  setmodel();
  const url = `${import.meta.env.VITE_NODE_URL}/isauth/role_pages/${id}`;
  const url2 = `${import.meta.env.VITE_NODE_URL}/isauth/pages`;
  isLoading.value = true;
  const res = await Promise.all([axios.get(url), axios.get(url2)]);
  isLoading.value = false;
  const canusepage = res[0].data.rows;
  const allpage = res[1].data.rows;
  const arr = [];
  canusepage.forEach((element) => {
    arr.push(element.page_id);
  });

  allpage.forEach((item) => {
    if (arr.includes(item["page_id"])) {
      item["isselect"] = true;
    } else {
      item["isselect"] = false;
    }
  });
  const newarr = [];
  allpage.forEach((item) => {
    if (newarr.length < item.page_type) {
      newarr.push([]);
    }
    newarr[item.page_type - 1].push(item);
  });
  data.value = [...newarr];
};

const deletemodel = async (id, name) => {
  await sureAlert(id, name);
  await getdata();
};

const addmodel = async () => {
  try {
    use.value = "add";
    setmodel();
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/pages`;
    isLoading.value = true;
    const res = await Promise.all([await axios.get(url)]);
    // const res = await axios.get(url)
    const datas = res[0].data.rows;
    isLoading.value = false;
    const arr = [];
    datas.forEach((item) => {
      if (arr.length < item.page_type) {
        arr.push([]);
      }
      arr[item.page_type - 1].push({
        isselect: false,
        ...item,
      });
    });

    howname.value = "新增角色";
    data.value = [...arr];
  } catch (error) {
    console.log(error);
  }
};

const closemodel = async () => {
  openModel.value = false;
};
</script>

<style lang="scss" scoped></style>
