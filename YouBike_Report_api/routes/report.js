const express = require('express');
const router = express.Router();
const axios = require('axios');
const isAuth = require('../middleware/isAuth');
const { idToken } = require('../service/googleToken');
const { useGCPMysql } = require('../service/cloudSql')

router.get('/gcpfun', isAuth, async (req, res, next) => {
  try {
    const payload = req.query;
    // 這裡的 GCP_URL 會指向那個巨大的 Cloud Run/frontend_bq2 
    const url = process.env.GCP_URL; 
    const gcptoken = await idToken();
    
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    
    res.status(200).json({ message: "成功", data: response.data });
  } catch (error) {
    next(error);
  }
});

router.post('/record-click', async (req, res, next) => {
  const { page_id } = req.body;

  if (!page_id) {
    return res.status(400).json({ success: false, message: "缺少 page_id" });
  }

  try {
    // 🚀 神招：沒有這筆報表就 INSERT 1 次，有這筆報表就讓 count + 1
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