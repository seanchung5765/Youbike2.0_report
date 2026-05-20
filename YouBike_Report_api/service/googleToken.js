require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const { GoogleAuth } = require("google-auth-library");

// 延遲時間
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🚀 核心升級：改用「物件」來暫存不同網址 (Audience) 的專屬 Token
const tokenCache = {};

// 把目標網址當成參數傳進來 (如果不傳，就預設吃原本環境變數裡的 GCP_URL)
const idToken = async (targetAudience = process.env.GCP_URL) => {
  const currentTimestamp = Date.now();
  // 緩存機制：設定為 25 分鐘提早更新，避免剛好卡在 30 分鐘邊界失效
  const twentyFiveMinutesAgo = currentTimestamp - 25 * 60 * 1000;

  // 檢查這個專屬網址是否有有效緩存
  if (tokenCache[targetAudience] && tokenCache[targetAudience].exp > twentyFiveMinutesAgo) {
    return tokenCache[targetAudience].token;
  }

  try {
    if (!targetAudience) {
      throw new Error("請先提供目標 URL (Audience)");
    }

    // 鎖定本地開發用的實體 JSON 檔案路徑
    const keyPath = path.join(__dirname, "../config/upheld-now-268802-d8afa282b657.json");
    let authOptions = {};

    // 環境自動判斷核心
    if (fs.existsSync(keyPath)) {
      authOptions = { keyFilename: keyPath };
    } 

    // 初始化 GoogleAuth，自動處理複雜的 JWT 簽發與 Token 交換
    const auth = new GoogleAuth(authOptions);
    const client = await auth.getIdTokenClient(targetAudience); // 🚀 依照不同網址去要對應的鑰匙
    const headers = await client.getRequestHeaders();

    // 取出 Bearer 後面的 Token 字串
    const token = headers.Authorization.split(" ")[1];
    
    // 🚀 將生好的鑰匙跟時間，存進對應網址的緩存裡
    tokenCache[targetAudience] = {
      token: token,
      exp: currentTimestamp
    };
    
    await delay(500);
    return token;
  } catch (error) {
    console.error(`取得 ${targetAudience} 的 Token 失敗:`, error.message);
    return null;
  }
};

module.exports = {
  idToken,
};