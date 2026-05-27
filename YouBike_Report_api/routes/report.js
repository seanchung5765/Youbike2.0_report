const express = require('express');
const router = express.Router();
const axios = require('axios');
const isAuth = require('../middleware/isAuth');
const { idToken } = require('../service/googleToken');
const { useGCPMysql } = require('../service/cloudSql')

// 💡 這是原本舊的 (完全不影響)
router.get('/gcpfun', isAuth, async (req, res, next) => {
  try {
    const payload = req.query;
    const url = process.env.GCP_URL; 
    const gcptoken = await idToken(); // 不傳參數，它就會自動幫你去生 GCP_URL 的鑰匙
    
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    
    res.status(200).json({ message: "成功", data: response.data });
  } catch (error) {
    next(error);
  }
});

// 🚀 1.0 交易查詢專屬 Proxy 路由 - 相容防錯與後端過濾版
router.post('/v1/transaction', isAuth, async (req, res, next) => {
  try {
    // 拿取前端傳過來的值（兼容各種命名）
    const { 
      phone, mem_id,
      card, card_no,
      station, paystatno 
    } = req.body;

    const final_phone = (phone || mem_id || "").trim();
    const final_card = (card || card_no || "").trim();
    const final_station = (station || paystatno || "").trim();

    const targetUrl = process.env.GCP_URL_V1;
    const gcptoken = await idToken(targetUrl);
    
    if (!gcptoken) {
      return res.status(500).json({ success: false, message: "無法取得 GCP 授權" });
    }
    
    // 🚨 絕招：只傳 mem_id 給 Jack！
    // 這樣他的 Python 就會走 else 的 "1=1" 分支，BigQuery 絕對不會噴 500 錯！
    const requestBody = {
      mem_id: final_phone
    };

    const response = await axios.post(targetUrl, requestBody, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    
    // 拿到該手機號碼底下的「所有」原始交易紀錄
    let rawDataList = response.data || [];

    // 🚀 既然 Jack 的 BigQuery 語法會壞，我們就在 Node.js 這邊幫他做過濾！
    // 這裡的欄位名稱（如 '外觀卡號'、'扣款場站'）要對齊 Jack 經過 df.rename 後輸出的中文 Key
    if (final_card !== "") {
      rawDataList = rawDataList.filter(item => item['外觀卡號'] === final_card);
    }

    if (final_station !== "") {
      rawDataList = rawDataList.filter(item => String(item['扣款場站']) === final_station);
    }
    
    // 把精準過濾完後的資料回傳給前端網頁
    res.status(200).json({ success: true, data: rawDataList });

  } catch (error) {
    if (error.response) {
      console.error("Jack的API報錯啦！狀態碼:", error.response.status);
      console.error("對方給的錯誤訊息:", error.response.data);
    } else {
      console.error("1.0 交易查詢失敗:", error.message);
    }
    res.status(500).json({ success: false, message: "外部 API 查詢失敗" });
  }
});

// 🚀 1.0 會員查詢的專屬 Proxy 路由 - 終極防呆相容版
router.post('/v1/member', isAuth, async (req, res, next) => {
  try {
    // 🚀 防呆修改 1：不管前端是把手機號碼放在 body 還是 query，通通都抓得到！
    const mem_id = req.body.mem_id || req.body.phone || req.query.mem_id || "";
    
    const final_mem_id = String(mem_id).trim();

    if (!final_mem_id) {
      return res.status(400).json({ success: false, message: "後端代理層偵測到缺少手機號碼變數" });
    }

    // 🚀 防呆修改 2：如果你的 .env 沒讀到，我們直接在這裡寫死 Jack 的會員網址當作備援，確保萬無一失！
    const targetUrl = process.env.GCP_URL_MEMBER || "https://yb1-member-421613424541.asia-east1.run.app"; 
    
    // 生成專屬於這個會員網址的 GCP 授權鑰匙
    const gcptoken = await idToken(targetUrl);
    
    if (!gcptoken) {
      return res.status(500).json({ success: false, message: "無法取得 GCP 授權" });
    }
    
    // 用 POST 把資料確實傳給 Jack 的會員 Cloud Run
    const response = await axios.post(targetUrl, { 
      mem_id: final_mem_id 
    }, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    
    // 回傳給你的 Vue 前端
    res.status(200).json({ success: true, data: response.data });

  } catch (error) {
    if (error.response) {
      console.error("Jack的會員API報錯啦！狀態碼:", error.response.status);
      console.error("對方給的錯誤訊息:", error.response.data);
    } else {
      console.error("1.0 會員查詢失敗:", error.message);
    }
    res.status(500).json({ success: false, message: "外部 會員API 查詢失敗" });
  }
});

// 🚀 1.0 卡片查詢的專屬 Proxy 路由 (內建後端安全過濾)
router.post('/v1/cards', isAuth, async (req, res, next) => {
  try {
    const { mem_id, card_no } = req.body; 

    const final_mem_id = (mem_id || "").trim();
    const final_card_no = (card_no || "").trim();

    if (!final_mem_id) {
      return res.status(400).json({ success: false, message: "缺少手機號碼參數" });
    }

    // 💡 記得在你的環境變數 .env 檔加上：GCP_URL_CARDS = "https://yb1-cards-421613424541.asia-east1.run.app"
    const targetUrl = process.env.GCP_URL_CARDS || "https://yb1-cards-421613424541.asia-east1.run.app"; 
    const gcptoken = await idToken(targetUrl);
    
    if (!gcptoken) {
      return res.status(500).json({ success: false, message: "無法取得 GCP 授權" });
    }
    
    // 💡 安全防護：只傳 mem_id 給 Jack，防止他的 Python SQL 因為大小寫報錯 500
    const response = await axios.post(targetUrl, { mem_id: final_mem_id }, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    
    let cardDataList = response.data || [];

    // 🚀 如果前端有輸入卡號，我們直接在 Node.js 這邊做過濾篩選！
    if (final_card_no !== "") {
      // 註：這裡的比對 Key 先預設為常見的 '外觀卡號' 或 '卡號'
      cardDataList = cardDataList.filter(item => 
        item['外觀卡號'] === final_card_no || 
        item['卡號'] === final_card_no ||
        item['CardNo'] === final_card_no
      );
    }
    
    res.status(200).json({ success: true, data: cardDataList });
  } catch (error) {
    if (error.response) {
      console.error("Jack的卡片API報錯啦！狀態碼:", error.response.status);
      console.error("對方給的錯誤訊息:", error.response.data);
    } else {
      console.error("1.0 卡片查詢失敗:", error.message);
    }
    res.status(500).json({ success: false, message: "外部 卡片API 查詢失敗" });
  }
});

// 💡 點擊紀錄 (保持不變)
router.post('/record-click', async (req, res, next) => {
  const { page_id } = req.body;

  if (!page_id) {
    return res.status(400).json({ success: false, message: "缺少 page_id" });
  }

  try {
    await useGCPMysql(
      `INSERT INTO report_clicks (page_id, click_count) 
       VALUES (?, 1) 
       ON DUPLICATE KEY UPDATE click_count = click_count + 1`,
      [page_id]
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("點擊計數更新失敗:", error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;