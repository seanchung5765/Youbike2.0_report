<template>
  <div class="container-fluid p-md-4 pt-5" style="background-color: #efefef">
    <h1 class="fw-bold fs-1 text-center">地區活動抽獎網站</h1>
    <div class="row"></div>
    <div class="row mb-md-5">
      <div class="col-md-6 gx-md-5 mb-3 mb-md-0">
        <label for="name" class="form-label fw-bolder fs-3"
          ><i class="bi bi-star-fill me-1" style="color: #18a058"></i
          >名稱:</label
        >
        <input
          type="email"
          v-model="name"
          class="form-control"
          id="name"
          placeholder="請輸入名稱"
        />
      </div>
      <div class="col-md-6 gx-md-5 mb-3 mb-md-0">
        <div class="row">
          <div class="col-12">
            <label for="gift" class="form-label fw-bolder fs-3"
              ><i class="bi bi-sliders me-1" style="color: #18a058"></i
              >獎品設定:</label
            >
          </div>
          <div
            class="mb-2 col-lg-6 col-xxl-4"
            v-for="j in giftsetarr"
            :key="j.key"
          >
            <div class="input-group">
              <input
                type="input"
                class="form-control"
                v-model="j.name"
                placeholder="請輸入名稱"
              />
              <select class="form-select" v-model="j.value">
                <option v-for="i in 700" :key="`${i}12`" :value="i">
                  {{ i }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-auto">
            <button
              type="button"
              class="btn btn-outline-primary"
              @click="addgiftsetinpust"
            >
              新增
            </button>
          </div>
          <div class="col-auto" v-show="giftsetarr.length > 1">
            <button
              type="button"
              class="btn btn-outline-danger"
              @click="cutgiftsetinpust"
            >
              刪除
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="mb-md-5 gx-md-5 mb-3 mb-md-0">
        <div class="row">
          <div class="col-auto">
            <label for="userlist" class="form-label fw-bolder fs-3"
              ><i class="bi bi-person-fill-up me-1" style="color: #18a058"></i
              >抽獎名單:</label
            >
          </div>
          <div class="col-auto">
            <input
              type="file"
              id="excelFileInput"
              @change="Excelhandler"
              ref="file"
              class="form-control"
            />
          </div>
        </div>
        <textarea
          class="form-control"
          id="userlist"
          rows="10"
          v-model="list1"
          readonly
          placeholder="得獎限制: 手機號碼和外觀卡號均不能重複
EXCEL格式需填寫 <手機號碼> <外觀卡號> <合計票數>
                "
        ></textarea>
      </div>
      <div class="row">
        <div class="gx-md-5 mb-3 mb-md-0 text-center">
          <button
            type="button"
            class="btn btn-lg btn-danger fw-bold px-4 me-3 mb-3 mb-md-0"
            @click="startlottery"
          >
            抽獎
          </button>
        </div>
      </div>
      <div class="gx-md-5 mb-3 mb-md-0" v-if="giftlist">
        <label for="giftlist" class="form-label fw-bolder fs-3"
          ><i class="bi bi-cash-coin me-1" style="color: #18a058"></i
          >中獎結果:</label
        >
        <textarea
          class="form-control"
          readonly
          id="giftlist"
          rows="10"
          v-model="giftlist"
        ></textarea>
        <div class="gx-md-5 mb-3 mb-md-0 text-center mt-5">
          <button
            type="button"
            class="btn btn-lg btn-primary fw-bold px-4 me-3"
            @click="sebmitexcel"
          >
            導出Excel
          </button>
        </div>
      </div>
    </div>
    <n-modal v-model:show="showModal" :mask-closable="false">
      <Vue3Lottie
        :animationData="LottieJson"
        :height="400"
        :width="400"
        :speed="1"
      ></Vue3Lottie>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import { NModal } from "naive-ui";
const showModal = ref(false);
const name = ref();
const list1 = ref();
const giftlist = ref();
const winnermantotal = ref([]);
import axios from "axios";
import CryptoJS from "crypto-js";

import random from "random";
//lottie
import { Vue3Lottie } from "vue3-lottie";
import LottieJson from "/public/Animation - 1690257463274.json";
// lottie end

const swal = inject("$swal");
const file = ref();
import * as XLSX from "xlsx";
import { ConstructOutline } from "@vicons/ionicons5";
async function NotAlert(text) {
  swal({
    icon: "error",
    title: `${text}`,
    showConfirmButton: false,
  });
}

let inputexceltitle = null;
const exceldata = ref([]);
const Excelhandler = (event) => {
  const files = event.target.files[0];
  const reader = new FileReader();
  // 以二进制格式读取文件
  reader.readAsArrayBuffer(files);

  reader.onload = (e) => {
    const data = e.target.result;
    const workbook = XLSX.read(data, {
      type: "binary",
      codepage: 65001,
      raw: true,
    });

    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 解析 Excel 数据为值数组，忽略空白行
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      blankrows: false,
    });
    exceldata.value = [...jsonData];

    let text = "";
    jsonData.forEach((item, index) => {
      if (index === 0) {
        inputexceltitle = item;
      }
      text += `${item}\n`;
    });
    list1.value = text;
  };
};

// 函數：解密加密字符串並返回 JavaScript 物件
function decryptString(encryptedString, secretKey) {
  // 解密加密字符串
  var decrypted = CryptoJS.AES.decrypt(encryptedString, secretKey);

  // 將解密的結果轉換回 JSON 物件
  var decryptedJsonString = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedJsonString);
}

//抓取黑名單
const getblacklist = async () => {
  const url = `${import.meta.env.VITE_NODE_URL}/lottery/blacklist`;
  const res = await axios.get(url);
  const resdata = res.data.data;
  let arr = {
    mobile: [],
    cardno: [],
  };
  
  resdata.forEach((item) => {
    arr.mobile.push(
      decryptString(item.mobile, import.meta.env.VITE_CryptoJS_PASSWORD)
    );
    arr.cardno.push(item.cardno);
  });
  return arr;
};

const giftsetarr = ref([
  {
    name: null,
    value: 1,
    key: 1,
  },
]);

const addgiftsetinpust = () => {
  const length = giftsetarr.value.length + 1;
  giftsetarr.value.push({
    name: null,
    value: 1,
    key: length,
  });
};

const cutgiftsetinpust = () => {
  if (giftsetarr.value.length > 1) {
    giftsetarr.value.pop();
  }
};

const submit = async () => {
  //黑名單
  const blacklist = await getblacklist();
  //獎品池
  let giftpool = [];
  winnermantotal.value = [];
  //獲取次數第幾欄
  const ticketnum = exceldata.value[0].indexOf("合計票數");

  exceldata.value.forEach((items, index) => {
    if (index === 0) {
      return;
    }
	
	
	
    for (let i = 1; i <= items[ticketnum]; i++) {
      giftpool.push(items);
    }
  });

  let setdatapool = [];
  giftsetarr.value.forEach((items) => {
    for (let i = 1; i <= items.value; i++) {
      setdatapool.push(items.name);
    }
  });

  if (giftpool.length < setdatapool.length) {
    return NotAlert("抽獎人小於獎品");
  }

  //獲取次數第幾欄 ,相同手機跟外觀卡號不能中獎
  const phonenum = exceldata.value[0].indexOf("手機號碼");
  const numbernum = exceldata.value[0].indexOf("外觀卡號");

  // console.log(giftpool, blacklist);
  //excel格式錯誤匯出彈跳視窗
  if (ticketnum === -1 || phonenum === -1 || numbernum === -1) {
    return NotAlert("excel格式錯誤");
  }
  // console.log(giftpool, giftpool.length);
  //最終得獎人
  let winnerman = [];
  //黑名單錯誤次數
  let blacklistNum = 0;
  while (winnerman.length !== setdatapool.length) {
    let ispush = true;
    //按照人數隨機random
    const randomnum = random.int(0, giftpool.length - 1);
    //console.log("randomnum=" + randomnum, "numbernum=" + numbernum, "phonenum=" + phonenum, giftpool.length);
    console.log(blacklist, giftpool, randomnum, numbernum);
    //黑名單檢查
    console.log(`giftpool[${randomnum}]=` + giftpool[randomnum])
    console.log(`giftpool[${randomnum}][${numbernum}]=` + giftpool[randomnum][numbernum])

    if (blacklist.cardno.indexOf(giftpool[randomnum][numbernum].toString()) !== -1 ||
        blacklist.mobile.indexOf(giftpool[randomnum][phonenum].toString()) !== -1) {
      ispush = false;

      //如果重複抽到100次則出錯
      blacklistNum++;
      console.log(blacklistNum);
      if (blacklistNum === 100) {
        return NotAlert("抽獎失敗");
      }
    }
    else {
      //如果沒抽到黑名單次數歸零
      blacklistNum = 0;
    }

    //把資料轉字串
    winnerman.forEach((item) => {
      //外觀卡號和手機號碼如果一樣就不能抽
      if (item[phonenum] === giftpool[randomnum][phonenum] ||
          item[numbernum] === giftpool[randomnum][numbernum]) {
        ispush = false;
      }
    });

    if (ispush) {
      winnerman.push(giftpool[randomnum]);
    }
  }





  winnerman.forEach((item, index) => {
    winnermantotal.value.push({
      name: setdatapool[index],
      value: winnerman[index],
    });
  });

  let text = `${name.value}
========================================
`;
  winnermantotal.value.forEach((item, index) => {
    if (index === 0) {
      text += `${item.name}\n${item.value}`;
    } else if (item["name"] === winnermantotal.value[index - 1]["name"]) {
      text += `\n${item.name}\n${item.value}`;
    } else {
      text += `\n\n\n${item.name}\n${item.value}`;
    }
  });
  giftlist.value = text;
};

const startlottery = () => {
  if (!name.value) {
    return NotAlert(`請輸入名稱`);
  } else if (!giftsetarr.value[0].name) {
    return NotAlert("請輸入獎品設定");
  } else if (exceldata.value.length < 1) {
    return NotAlert("抽獎名單不能為空");
  }

  showModal.value = true;
  // 延迟五秒执行第二个函数
  setTimeout(function () {
    submit();
    showModal.value = false;
  }, 4000);
};

//如果一串數字有超過5位數 只取前4位數就好

function limitToFiveDigits(number) {
  if (typeof number !== "number") {
    throw new Error("Input must be a number");
  }

  const numStr = number.toString();
  if (numStr.length > 5) {
    return parseInt(numStr.substring(0, 4));
  } else {
    return number;
  }
}

const sebmitexcel = () => {
  let giftobj = [];
  //整理好禮物表
  winnermantotal.value.forEach((item, index) => {
    if (index === 0) {
      giftobj.push([]);
      giftobj[0].push(item);
    } else {
      if (
        winnermantotal.value[index]["name"] ===
        winnermantotal.value[index - 1]["name"]
      ) {
        giftobj[giftobj.length - 1].push(item);
      } else {
        giftobj.push([]);
        giftobj[giftobj.length - 1].push(item);
      }
    }
  });

  //導出excel
  const workbook = XLSX.utils.book_new();
  giftobj.forEach((items) => {
    let arr = [];
    //表的標題
    arr.push(inputexceltitle);
    items.forEach((item) => {
      arr.push(item.value);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(arr);
    XLSX.utils.book_append_sheet(workbook, worksheet, `${items[0]["name"]}`);
  });

  const citysortobj = {
    台北: [],
    "台北2.0": [],
    新北: [],
    "新北2.0": [],
    桃園: [],
    "桃園2.0": [],
    竹市: [],
    "竹市2.0": [],
    "竹縣2.0": [],
    竹科: [],
    "竹科2.0": [],
    苗栗: [],
    "苗栗2.0": [],
    台中: [],
    "台中2.0": [],
    彰化: [],
    "彰化2.0": [],
    "嘉義2.0": [],
    "台南2.0": [],
    "高雄2.0": [],
    "屏東2.0": [],
  };
  //製作 城市分類
  const sendcarnum = exceldata.value[0].indexOf("借車場站代號");
  //如果有出現借車場站代號
  if (sendcarnum > 0) {
    winnermantotal.value.forEach((item) => {
      const num = limitToFiveDigits(parseInt(item.value[sendcarnum]));
      if (num >= 1 && num <= 900) {
        citysortobj["台北"].push(num);
      } else if (num >= 1001 && num <= 1900) {
        citysortobj["新北"].push(num);
      } else if (num >= 2001 && num <= 2900) {
        citysortobj["桃園"].push(num);
      } else if (num >= 3001 && num <= 3900) {
        citysortobj["台中"].push(num);
      } else if (num >= 6101 && num <= 6290) {
        citysortobj["竹市"].push(num);
      } else if (num >= 6601 && num <= 6990) {
        citysortobj["苗栗"].push(num);
      } else if (num >= 7001 && num <= 7290) {
        citysortobj["彰化"].push(num);
      } else if (num >= 9601 && num <= 9696) {
        citysortobj["竹科"].push(num);
      } else if (num == 5001) {
        citysortobj["台北2.0"].push(num);
      } else if (num == 5002) {
        citysortobj["新北2.0"].push(num);
      } else if (num == 5003) {
        citysortobj["桃園2.0"].push(num);
      } else if (num == 5004) {
        citysortobj["竹市2.0"].push(num);
      } else if (num == 5005) {
        citysortobj["竹縣2.0"].push(num);
      } else if (num == 5006) {
        citysortobj["台中2.0"].push(num);
      } else if (num == 5007) {
        citysortobj["苗栗2.0"].push(num);
      } else if (num == 5008) {
        citysortobj["彰化2.0"].push(num);
      } else if (num == 5010) {
        citysortobj["嘉義2.0"].push(num);
      } else if (num == 5012) {
        citysortobj["高雄2.0"].push(num);
      } else if (num == 5013) {
        citysortobj["台南2.0"].push(num);
      } else if (num == 5014) {
        citysortobj["屏東2.0"].push(num);
      } else if (num == 5082) {
        citysortobj["竹科2.0"].push(num);
      }
    });

    const arr = [["贈品區域", "配送數量"]];
    for (const key in citysortobj) {
      let item = [key, citysortobj[key].length];
      arr.push(item);
    }
    const worksheet = XLSX.utils.aoa_to_sheet(arr);
    XLSX.utils.book_append_sheet(workbook, worksheet, "城市分類");
  }

  const outputFileName = `${name.value}.xlsx`;
  const outputFileType = "xlsx";
  XLSX.writeFile(workbook, outputFileName, { bookType: outputFileType });
};
</script>

<style lang="scss" scoped></style>
