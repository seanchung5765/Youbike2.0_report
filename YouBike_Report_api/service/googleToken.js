//D:\維護中資料(待上傳git)\YouBike_Report\YouBike_Report_api\service\googleToken.js
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const { JWT } = require("google-auth-library");
const axios = require("axios"); // 🚀 引入 axios 來直接呼叫 GCP 內部伺服器

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const tokenCache = {};

const idToken = async (targetAudience = process.env.GCP_URL) => {
  const currentTimestamp = Date.now();
  const twentyFiveMinutesAgo = currentTimestamp - 25 * 60 * 1000;

  if (tokenCache[targetAudience] && tokenCache[targetAudience].exp > twentyFiveMinutesAgo) {
    return tokenCache[targetAudience].token;
  }

  try {
    if (!targetAudience) {
      throw new Error("請先提供目標 URL (Audience)");
    }

    let token = null;

    if (process.env.K_SERVICE || process.env.INSTANCE_UNIX_SOCKET) {
      
      // ☁️ 【雲端模式】終極解法：直接向 Cloud Run 內建的 Metadata 伺服器拿 Token，繞過所有套件 Bug！
      console.log(`☁️ 偵測到 Cloud Run 環境，向 Metadata 伺服器請求 Token...`);
      
      try {
        const metadataResponse = await axios.get(
          `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(targetAudience)}`,
          {
            headers: { 'Metadata-Flavor': 'Google' }
          }
        );
        token = metadataResponse.data; // 這裡拿到的直接就是純淨的 Token 字串
      } catch (metaErr) {
        throw new Error(`Metadata 伺服器連線失敗: ${metaErr.message}`);
      }

    } else {
      
      // 💻 【地端模式】本地開發環境：強制讀取 JSON 金鑰，繞過 VPN
      console.log("💻 偵測到本地環境，使用 JSON 金鑰產生 Token...");
      const keyPath = path.join(__dirname, "../config/upheld-now-268802-baa02244d95f.json");
      
      if (!fs.existsSync(keyPath)) {
        throw new Error(`找不到本機金鑰檔案，請確認路徑: ${keyPath}`);
      }
      
      const keys = require(keyPath);
      const client = new JWT({
        email: keys.client_email,
        key: keys.private_key,
        additionalClaims: { target_audience: targetAudience }
      });
      const credentials = await client.authorize();
      token = credentials.id_token;
    }

    if (!token) {
      throw new Error("授權成功但沒有取得 Token");
    }
    
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