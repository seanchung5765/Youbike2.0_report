require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const axios = require("axios");

//延遲時間
function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(); // 這裡添加 resolve，表示 Promise 已解決
    }, ms)
  );
}

let exp = 0;
let token = null;
const idToken = async () => {
  const currentTimestamp = Date.now();
  const thirtyMinutesAgoTimestamp = currentTimestamp - 30 * 60 * 1000; // 30分钟 * 60秒 * 1000毫秒
  // console.log(currentTimestamp, thirtyMinutesAgoTimestamp);
  if (exp === 0 || thirtyMinutesAgoTimestamp > exp) {
    token = await generateIdToken();
    exp = currentTimestamp;
    // console.log("第一次取得 token 或者 30分鐘已到, 開始取得 token...");
    await delay(500);
  }
  // console.log("token 還不用更新，時間還沒超過 30 分");

  return token;
};

//取得token
async function generateIdToken() {
  // 讀取 JSON 文件
  const serviceAccountKey = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../config/upheld-now-268802-d8afa282b657.json")
    )
  );
  // 定義 JWT 的 payload
  const payload = {
    alg: "RS256",
    typ: "JWT",
    iss: serviceAccountKey.client_email,
    sub: serviceAccountKey.client_email,
    aud: "https://www.googleapis.com/oauth2/v4/token",
    target_audience: process.env.GCP_URL,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };
  // 簽發 JWT
  const jwtToken = jwt.sign(payload, serviceAccountKey.private_key, {
    algorithm: "RS256",
  });

  const url = "https://www.googleapis.com/oauth2/v4/token";
  const headers = {
    Authorization: `Bearer ${jwtToken}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const data = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`;
  try {
    const response = await axios.post(url, data, { headers, timeout: 20000 });
    // console.log("成功取得token");
    return response.data.id_token;
  } catch (error) {
    console.log("取得token失敗", error);
    return null;
  }
}

module.exports = {
  idToken,
};
//由 Google 签名的 ID 令牌会在最初生成请求的 1 小时内过期。
// 使用您的 JWT 執行請求
//這個方法
// https://cloud.google.com/functions/docs/securing/authenticating?hl=zh-cn#exchanging_a_self-signed_jwt_for_a_google-signed_id_token
