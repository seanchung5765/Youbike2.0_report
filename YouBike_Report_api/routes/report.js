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

// 🚀 新增：1.0 交易查詢的專屬 Proxy 路由
// 🚀 關鍵 1：這裡必須是 router.post
router.post('/v1/transaction', isAuth, async (req, res, next) => {
  try {
    // 🚀 關鍵 2：因為是 POST，所以資料要從 req.body 拿，不是 req.query
    const { mem_id } = req.body; 

    const targetUrl = process.env.GCP_URL_V1;
    const gcptoken = await idToken(targetUrl);
    
    if (!gcptoken) {
      return res.status(500).json({ success: false, message: "無法取得 GCP 授權" });
    }
    
    // 🚀 關鍵 3：用 axios.post 打給 Jack，並把 { mem_id } 放在第二個參數當作 Body
    const response = await axios.post(targetUrl, { mem_id }, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    
    res.status(200).json({ success: true, data: response.data });
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