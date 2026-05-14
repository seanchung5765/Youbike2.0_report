require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const { GoogleAuth } = require("google-auth-library");

// 延遲時間
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let exp = 0;
let token = null;

const idToken = async () => {
  const currentTimestamp = Date.now();
  // 緩存機制：設定為 25 分鐘提早更新，避免剛好卡在 30 分鐘邊界失效
  const twentyFiveMinutesAgo = currentTimestamp - 25 * 60 * 1000;

  if (token && exp > twentyFiveMinutesAgo) {
    return token;
  }

  try {
    const targetAudience = process.env.GCP_URL;
    if (!targetAudience) {
      throw new Error("請先在 .env 或雲端環境變數中設定 GCP_URL");
    }

    // 鎖定本地開發用的實體 JSON 檔案路徑
    const keyPath = path.join(__dirname, "../config/upheld-now-268802-d8afa282b657.json");
    let authOptions = {};

    // 環境自動判斷核心
    if (fs.existsSync(keyPath)) {
      // 情況 A：在本地電腦開發，找得到實體檔案，強制使用該檔案登入
      authOptions = { keyFilename: keyPath };
    } 
    // 情況 B：在 Cloud Run 上，找不到實體檔案 (authOptions 為空)
    // Google 套件會自動啟動 Application Default Credentials (ADC) 機制，向雲端底層索取安全身分

    // 初始化 GoogleAuth，自動處理複雜的 JWT 簽發與 Token 交換
    const auth = new GoogleAuth(authOptions);
    const client = await auth.getIdTokenClient(targetAudience);
    const headers = await client.getRequestHeaders();

    // 取出 Bearer 後面的 Token 字串
    token = headers.Authorization.split(" ")[1];
    exp = currentTimestamp;
    
    await delay(500);
    return token;
  } catch (error) {
    console.error("取得 Token 失敗:", error.message);
    return null;
  }
};

module.exports = {
  idToken,
};