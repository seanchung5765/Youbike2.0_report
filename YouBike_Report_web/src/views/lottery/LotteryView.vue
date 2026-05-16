<template>
  <div class="container-fluid p-md-4 pt-5" style="background-color: #efefef; min-height: 100vh;">
    <button
      class="btn btn-outline-secondary position-absolute top-0 end-0 m-3 m-md-4 fw-bold bg-white shadow-sm"
      @click="toggleFullScreen"
      style="z-index: 10;"
    >
      <i :class="isFullScreen ? 'bi bi-fullscreen-exit' : 'bi bi-fullscreen'"></i>
      <span class="ms-1 d-none d-sm-inline">{{ isFullScreen ? '退出全螢幕' : '全螢幕' }}</span>
    </button>

    <h1 class="fw-bold fs-1 text-center mb-5">活動抽獎</h1>
    <div class="row mb-5 justify-content-center">
      <div class="col-12 gx-md-5 d-flex justify-content-center">
        <div 
          class="ad-banner-container shadow-sm border rounded-3 bg-white d-flex align-items-center justify-content-center overflow-hidden position-relative mx-auto"
          @click="triggerAdUpload"
          :style="{ cursor: 'pointer', minHeight: '200px' }"
        >
          <input type="file" ref="adFileInput" class="d-none" accept="image/*" @change="handleAdUpload" />

          <img v-if="adImageUrl" :src="adImageUrl" class="img-fluid w-100 h-100 ad-image" alt="廣告看板" />

          <div v-else class="text-center text-muted p-5">
            <i class="bi bi-image fs-1"></i>
            <p class="mb-0 fw-bold">點擊上傳廣告橫幅 (建議尺寸: 1920x600)</p>
          </div>

          <div v-if="adImageUrl" class="ad-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
             <span class="badge bg-dark bg-opacity-50 p-2"><i class="bi bi-camera-fill me-1"></i>更換圖片</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row mb-md-4">
      <div class="col-md-6 gx-md-5 mb-3 mb-md-0">
        <label for="name" class="form-label fw-bolder fs-3">
          <i class="bi bi-star-fill me-1" style="color: #18a058"></i>名稱:
        </label>
        <input
          type="text"
          v-model="name"
          class="form-control form-control-lg"
          id="name"
          placeholder="請輸入抽獎活動名稱"
        />
      </div>

      <div class="col-md-6 gx-md-5 mb-3 mb-md-0">
        <div class="row">
          <div class="col-12 mb-2">
            <label for="gift" class="form-label fw-bolder fs-3">
              <i class="bi bi-sliders me-1" style="color: #18a058"></i>獎品設定:
            </label>
          </div>
          
          <div class="mb-2 col-12 col-xl-10" v-for="(j, index) in giftsetarr" :key="j.key">
            <div class="input-group input-group-lg shadow-sm">
              <span class="input-group-text text-white fw-bold" style="background-color: #18a058;">{{ index + 1 }}</span>
              <input
                type="text"
                class="form-control"
                v-model="j.name"
                placeholder="請輸入獎項名稱 (例: 頭獎)"
              />
              <input 
                type="number" 
                class="form-control" 
                style="flex: 0 0 100px;" 
                v-model.number="j.value" 
                min="1" 
                placeholder="人數" 
              />
            </div>
          </div>
          
          <div class="col-12 mt-2 d-flex gap-2">
            <button type="button" class="btn btn-outline-primary fw-bold" @click="addgiftsetinpust">
              <i class="bi bi-plus-lg"></i> 新增獎項
            </button>
            <button type="button" class="btn btn-outline-danger fw-bold" v-show="giftsetarr.length > 1" @click="cutgiftsetinpust">
              <i class="bi bi-trash"></i> 刪除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12 gx-md-5 mb-3 mb-md-4">
        <div class="d-flex align-items-center mb-3">
          <label for="userlist" class="form-label fw-bolder fs-3 mb-0 me-3">
            <i class="bi bi-person-fill-up me-1" style="color: #18a058"></i>抽獎名單:
          </label>
          <input
            type="file"
            id="excelFileInput"
            @change="Excelhandler"
            ref="file"
            class="form-control form-control-lg w-auto"
            accept=".xlsx, .xls, .csv"
          />
        </div>
        
        <div 
          v-if="exceldata.length > 0" 
          class="table-responsive bg-white border border-2 rounded-3 shadow-sm" 
          style="max-height: 400px; overflow-y: auto;"
        >
          <table class="table table-striped table-hover table-sm mb-0 text-nowrap align-middle">
            <thead class="table-light" style="position: sticky; top: 0; z-index: 1;">
              <tr>
                <th class="px-3 py-2" v-for="(header, index) in exceldata[0]" :key="'h'+index">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in excelPreviewList" :key="'r'+rowIndex">
                <td class="px-3" v-for="(cell, cellIndex) in row" :key="'c'+cellIndex">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="exceldata.length > 1" class="mt-3 d-flex justify-content-end">
          <div class="bg-dark text-white px-4 py-2 rounded-pill shadow-sm fw-bold">
            <i class="bi bi-people-fill me-2 text-warning"></i>
            符合抽獎資格總人數：
            <span class="fs-4 text-warning">{{ totalParticipants.toLocaleString() }}</span>
            <span class="ms-1">人</span>
          </div>
        </div>

        <div 
          v-else
          class="form-control bg-light d-flex align-items-center justify-content-center text-muted shadow-sm" 
          style="min-height: 200px; border: 2px dashed #ccc;"
        >
          <div class="text-center">
            <i class="bi bi-file-earmark-spreadsheet fs-1 mb-2"></i>
            <p class="mb-1 fs-5 fw-bold text-dark">尚未上傳名單</p>
            <p class="mb-1">得獎限制: 手機號碼和外觀卡號均不能重複</p>
            <p class="mb-0 text-danger">EXCEL 格式需填寫：&lt;手機號碼&gt; &lt;外觀卡號&gt; &lt;合計票數&gt;</p>
          </div>
        </div>
      </div>

      <div class="col-12 gx-md-5 mb-4 text-center">
        <button
          type="button"
          class="btn btn-lg btn-danger fw-bold px-5 py-3 shadow"
          style="font-size: 1.25rem; letter-spacing: 2px;"
          @click="startlottery"
        >
          <i class="bi bi-magic me-1"></i> 開始抽獎
        </button>
      </div>

      <div class="col-12 gx-md-5 mb-5" v-if="winnermantotal.length > 0">
        <label class="form-label fw-bolder fs-3">
          <i class="bi bi-cash-coin me-1" style="color: #18a058"></i>中獎結果:
        </label>
        
        <div class="table-responsive bg-white border border-success border-2 rounded-3 shadow">
          <table class="table table-hover table-bordered mb-0 text-nowrap align-middle">
            <thead class="table-success" style="position: sticky; top: 0; z-index: 1;">
              <tr>
                <th class="text-center px-3 py-3" style="width: 150px; font-size: 1.1rem;">🏆 中獎獎項</th>
                <th class="px-3 py-3" v-for="(header, index) in exceldata[0]" :key="'rh'+index">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(winner, index) in winnermantotal" :key="'w'+index">
                <td class="text-center fw-bold text-danger bg-light fs-5">
                  {{ winner.name }}
                </td>
                <td class="px-3" v-for="(cell, cellIndex) in winner.value" :key="'wc'+cellIndex">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="text-center mt-5">
          <button
            type="button"
            class="btn btn-lg btn-success fw-bold px-5 shadow"
            @click="sebmitexcel"
          >
            <i class="bi bi-file-earmark-excel me-1"></i> 導出 Excel
          </button>
        </div>
      </div>
    </div>

    <n-modal v-model:show="showModal" :mask-closable="false">
      <div class="text-center">
        <Vue3Lottie
          :animationData="LottieJson"
          :height="400"
          :width="400"
          :speed="1"
        ></Vue3Lottie>
        <h3 class="text-white mt-3 fw-bold" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">系統抽獎中...</h3>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted, onUnmounted } from "vue";
import { NModal } from "naive-ui";
import { Vue3Lottie } from "vue3-lottie";
import * as XLSX from "xlsx";
import LottieJson from '@/assets/Animation - 1690257463274.json';

// --- 狀態與變數管理 ---
const swal = inject("$swal");
const isFullScreen = ref(false);
const showModal = ref(false);
const adImageUrl = ref(null);
const adFileInput = ref(null);
const file = ref();
const name = ref("");
const winnermantotal = ref([]);
const exceldata = ref([]);
let inputexceltitle = null;

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      NotAlert(`無法進入全螢幕: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

const handleFullscreenChange = () => {
  isFullScreen.value = !!document.fullscreenElement;
};

const triggerAdUpload = () => {
  adFileInput.value.click();
};

const handleAdUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    adImageUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
});

const giftsetarr = ref([{ name: null, value: 1, key: 1 }]);

const excelPreviewList = computed(() => {
  return exceldata.value.length > 1 ? exceldata.value.slice(1) : [];
});

const NotAlert = (text) => {
  swal({ icon: "error", title: text, showConfirmButton: false, timer: 2500 });
};

const addgiftsetinpust = () => {
  giftsetarr.value.push({ name: null, value: 1, key: giftsetarr.value.length + 1 });
};

const cutgiftsetinpust = () => {
  if (giftsetarr.value.length > 1) giftsetarr.value.pop();
};

const totalParticipants = computed(() => {
  return exceldata.value.length > 1 ? exceldata.value.length - 1 : 0;
});

const Excelhandler = (event) => {
  const files = event.target.files[0];
  if (!files) return;
  
  const reader = new FileReader();
  reader.readAsArrayBuffer(files);

  reader.onload = (e) => {
    const workbook = XLSX.read(e.target.result, { type: "binary", codepage: 65001, raw: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
    
    exceldata.value = [...jsonData];
    inputexceltitle = jsonData[0]; 
  };
};

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const submit = async () => {
  const ticketnum = exceldata.value[0].indexOf("合計票數");
  const phonenum = exceldata.value[0].indexOf("手機號碼");
  const numbernum = exceldata.value[0].indexOf("外觀卡號");

  if (ticketnum === -1 || phonenum === -1 || numbernum === -1) {
    return NotAlert("EXCEL 格式錯誤：請確認包含手機號碼、外觀卡號、合計票數");
  }

  const prizesToDraw = giftsetarr.value.flatMap(gift => Array(Number(gift.value)).fill(gift.name));

  let pool = [];
  exceldata.value.slice(1).forEach((row) => {
    const tickets = parseInt(row[ticketnum]) || 0;
    for (let i = 0; i < tickets; i++) {
      pool.push(row);
    }
  });

  const uniqueUsers = new Set(pool.map(item => String(item[phonenum]))).size;
  if (uniqueUsers < prizesToDraw.length) {
    return NotAlert(`抽獎人數不足：符合資格的不重複人數(${uniqueUsers}) 小於 獎品總數(${prizesToDraw.length})`);
  }

  pool = shuffleArray(pool);

  const winners = [];
  const wonPhones = new Set();
  const wonCards = new Set();

  for (const candidate of pool) {
    if (winners.length === prizesToDraw.length) break;

    const phone = String(candidate[phonenum]);
    const card = String(candidate[numbernum]);

    if (!wonPhones.has(phone) && !wonCards.has(card)) {
      winners.push(candidate);
      wonPhones.add(phone);
      wonCards.add(card);
    }
  }

  winnermantotal.value = winners.map((winner, index) => ({
    name: prizesToDraw[index],
    value: winner,
  }));
};

const startlottery = () => {
  if (!name.value) return NotAlert("請輸入抽獎活動名稱");
  if (!giftsetarr.value[0].name) return NotAlert("請輸入至少一個獎品名稱");
  if (exceldata.value.length <= 1) return NotAlert("抽獎名單不能為空");

  showModal.value = true;
  setTimeout(() => {
    submit();
    showModal.value = false;
  }, 3500); 
};

const limitToFiveDigits = (val) => {
  const s = String(val);
  return s.length > 5 ? parseInt(s.substring(0, 4)) : (parseInt(val) || 0);
};

const getCityName = (num) => {
  const specificMap = {
    5001: "台北市", 5002: "新北市", 5003: "桃園市", 5004: "新竹市",
    5005: "新竹縣", 5006: "台中市", 5007: "苗栗縣", 5008: "彰化縣",
    5010: "嘉義市", 5011: "嘉義縣", 5012: "高雄市", 5013: "台南市", 
    5014: "屏東縣", 5082: "新竹科學園區"
  };
  return specificMap[num] || null;
};

const sebmitexcel = () => {
  const workbook = XLSX.utils.book_new();
  
  const groupedWinners = winnermantotal.value.reduce((acc, curr) => {
    if (!acc[curr.name]) acc[curr.name] = [];
    acc[curr.name].push(curr.value);
    return acc;
  }, {});

  Object.entries(groupedWinners).forEach(([prizeName, winners]) => {
    const sheetData = [inputexceltitle];
    winners.forEach(winner => sheetData.push(winner));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetData), prizeName);
  });

  const sendcarnum = exceldata.value[0].indexOf("借車場站代號");
  if (sendcarnum > 0) {
    const cityKeys = [
      "台北市", "新北市", "桃園市", "新竹市", "新竹縣", "新竹科學園區",
      "苗栗縣", "台中市", "彰化縣", "嘉義市", "嘉義縣", "台南市", 
      "高雄市", "屏東縣"
    ];
    
    const citySummary = Object.fromEntries(cityKeys.map(k => [k, 0]));

    winnermantotal.value.forEach((item) => {
      const num = limitToFiveDigits(item.value[sendcarnum]);
      const city = getCityName(num);
      if (city && citySummary[city] !== undefined) {
        citySummary[city]++;
      }
    });

    const cityArr = [["贈品區域", "配送數量"]];
    cityKeys.forEach(key => cityArr.push([key, citySummary[key]]));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(cityArr), "城市分類");
  }

  XLSX.writeFile(workbook, `${name.value}.xlsx`, { bookType: "xlsx" });
};
</script>

<style scoped>
/* 🚀 廣告看板容器響應式與置中設定 */
.ad-banner-container {
  width: 100%;             /* 確保手機版時能撐滿欄位寬度 */
  max-width: 1280px;       /* 防止在超大螢幕無限制拉伸 (1920/600 * 400 = 1280) */
  max-height: 400px; 
  aspect-ratio: 1920 / 600; /* 強制維持 3.2:1 的完美比例 */
  margin: 0 auto;          /* 🚀 絕對置中的關鍵 */
  transition: all 0.3s ease;
}

.ad-banner-container:hover {
  border-color: #18a058 !important;
  background-color: #f8fdfa !important;
}

.ad-image {
  object-fit: cover; 
}

.ad-overlay {
  opacity: 0;
  transition: opacity 0.3s;
  background: rgba(0, 0, 0, 0.1);
}

.ad-banner-container:hover .ad-overlay {
  opacity: 1;
}

th {
  background-clip: padding-box;
}

.table-responsive::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.table-responsive::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}
.table-responsive::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}
</style>