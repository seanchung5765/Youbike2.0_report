<template>
  <n-card size="medium" preset="dialog">
    <n-form ref="formRef" :model="model" :rules="rules">
      <div class="fw-bold">
        <div class="row">
          <div class="col-12">
            <n-form-item
              path="textareaValue"
              label="Email"
              label-style="font-weight: 700; font-size:16px"
              rules="rules.textareaValue"
            >
              <n-input
                size="large"
                v-model:value="model.textareaValue"
                @change="handleTextareaInput"
                placeholder="IloveYouBike@gmail.com,&#10;YouLoveYouBike@gmail.com,&#10;WeLoveYouBike@gmail.com,&#10;"
                type="textarea"
              />
            </n-form-item>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col text-center">
          <n-button type="info" class="me-3" @click="submit">儲存</n-button>
        </div>
      </div>
    </n-form>
  </n-card>
</template>

<script setup>
import "vue-loading-overlay/dist/css/index.css";
import axios from "axios";
import { NCard, NButton, NInput, NFormItem, NForm } from "naive-ui";
const swal = inject("$swal");
async function Alert(text) {
  swal({
    icon: "success",
    title: `${text}`,
    showConfirmButton: false,
  });
}

import { ref, inject } from "vue";

const props = defineProps({
  maildata: {
    type: Array,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const model = ref({
  textareaValue: null,
});

const rules = {
  textareaValue: {
    required: true,
    validator(rule, value) {
      let isok = true;
      let row = null;
      const lines = value.split("\n");
      lines.forEach((line, index) => {
        const lastCharacter = line.charAt(line.length - 1);
        //最後一個字要, 還有字串內要有@
        if (lastCharacter !== "," || line.indexOf("@") === -1) {
          row = index;
          isok = false;
        }
      });

      if (!isok && value) {
        return new Error(`第${row + 1}行格式錯誤`);
      } else {
        return true;
      }
    },
    trigger: ["blur", "input"],
  },
};

// //去除前後空白
function handleTextareaInput() {
  const value = model.value.textareaValue;
  const lines = value.split("\n");
  const trimmedLines = lines.map((line) => line.trim());
  const formattedValue = trimmedLines.join("\n");
  model.value.textareaValue = formattedValue;
}

function editEmail(arr) {
  let str = "";
  arr.forEach((element, index) => {
    if (index === arr.length - 1) {
      str += `${element.mail},`;
    } else {
      str += `${element.mail},\n`;
    }
  });
  if (str === ",") {
    return null;
  }
  return str;
}

const formRef = ref(null);
async function validate() {
  try {
    await formRef.value.validate();
    return "驗證成功";
  } catch (error) {
    throw new Error("驗證失敗");
  }
}

const getData = inject("getData");

const submit = async () => {
  try {
    //驗證格式
    await validate();
    const text = model.value.textareaValue
      .split(",")
      .filter((item) => item)
      .map((item) => item.replace(/\n/g, ""));

    const url = `${import.meta.env.VITE_NODE_URL}/mail/station/status`;

    await axios.put(url, {
      city: props.city,
      mailList: [...text],
      type: props.type,
    });

    await Alert("儲存成功");

    await getData();
    // console.log(res);
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  model.value.textareaValue = editEmail(props.maildata);
})();
</script>

<style lang="scss" scoped></style>
