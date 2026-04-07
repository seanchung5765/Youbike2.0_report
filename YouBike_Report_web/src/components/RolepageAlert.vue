<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="false"
    :is-full-page="true"
  />
  <n-modal v-model:show="props.isopen" :mask-closable="false">
    <n-card style="max-width: 1000px" preset="card" :title="props.title">
      <div>
        <n-form>
          <n-form-item
            label="角色名稱"
            path="inputValue"
            v-if="props.use == 'add'"
          >
            <n-input placeholder="請輸入" v-model:value="typename" />
          </n-form-item>
          <template v-for="(items, index) in props.data" :key="`${index}111`">
            <h3 class="mt-2" v-if="index === 0">營運報表</h3>
            <h3 class="mt-2" v-if="index === 1">網站管理</h3>
            <h3 class="mt-2" v-if="index === 2">會員資料</h3>
            <h3 class="mt-2" v-if="index === 3">抽獎網站</h3>
            <h3 class="mt-2" v-if="index === 4">異常通知</h3>
            <h3 class="mt-2" v-if="index === 5">簡訊</h3>
            <template v-for="item in items" :key="item.page_id">
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="item.isselect"
                  :disabled="props.use === 'look'"
                  :id="item.page_name"
                />
                <label class="form-check-label" :for="item.page_name">{{
                  item.page_name
                }}</label>
              </div>
            </template>
          </template>

          <div style="display: flex; justify-content: flex-end" class="mt-3">
            <button
              type="buttno"
              class="btn btn-secondary me-3"
              @click="cancel"
            >
              取消
            </button>
            <button type="button" class="btn btn-success" @click="submit">
              確定
            </button>
          </div>
        </n-form>
      </div>
    </n-card>
  </n-modal>
  <div></div>
</template>

<script setup>
import { NModal, NCard, NForm, NFormItem, NInput } from "naive-ui";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import { ref, inject } from "vue";
const swal = inject("$swal");
async function ErrorAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}
import axios from "axios";
const isLoading = ref(false);
const typename = ref();
const props = defineProps({
  isopen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  use: {
    type: String,
    required: true,
    validator(value) {
      return ["look", "edit", "add", ""].includes(value);
    },
  },
  clickid: {
    type: Number,
  },
});
const emit = defineEmits(["closemodel", "getrolelist"]);

const cancel = () => {
  emit("closemodel");
};

const submit = async () => {
  if (props.use === "look") {
    return cancel();
  } else if (props.use === "edit") {
    const data = [...props.data];
    const arr = [];
    //這裡做頁面權限的
    data.forEach((items) => {
      items.forEach((item) => {
        if (item.isselect) {
          arr.push({
            page_id: item.page_id,
            role_id: props.clickid,
          });
        }
      });
    });

    isLoading.value = true;
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/role/${props.clickid}`;
    isLoading.value = false;
    emit("closemodel");
    await axios.put(url, arr);
  } else if (props.use === "add") {
    if (!typename.value) {
      emit("closemodel");
      return ErrorAlert("請填寫角色名稱");
    }
    const url = `${import.meta.env.VITE_NODE_URL}/isauth/role`;
    const arr = [];
    const data = props.data;

    data.forEach((items) => {
      items.forEach((item) => {
        if (item.isselect) {
          arr.push({
            page_id: item.page_id,
          });
        }
      });
    });

    const payload = {
      name: typename.value,
      payload: [...arr],
    };
    try {
      isLoading.value = true;
      await axios.post(url, payload);
      isLoading.value = false;
      emit("closemodel");
    } catch (error) {
      emit("closemodel");
      return ErrorAlert("新增角色失敗");
    }
    typename.value = null;
    emit("getrolelist");
    return emit("closemodel");
  }
};
</script>

<style lang="scss" scoped></style>
