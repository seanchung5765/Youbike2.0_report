//D:\維護中資料(待上傳git)\YouBike_Report\YouBike_Report_api\routes\report.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const isAuth = require('../middleware/isAuth');
const { idToken } = require('../service/googleToken');
const { useGCPMysql } = require('../service/cloudSql')

// 💡 預設共用的 GCP 報表網址 (Sean 提供的統一網址)
const DEFAULT_GCP_REPORT_URL = process.env.GCP_URL_REPORT_DATA || "https://report-data-421613424541.asia-east1.run.app";

// 💡 這是原本舊的 (完全不影響)
router.get('/gcpfun', isAuth, async (req, res, next) => {
  try {
    const payload = req.query;
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

// 🚀 1.0 交易查詢專屬 Proxy 路由 - 相容防錯與後端過濾版
router.post('/v1/transaction', isAuth, async (req, res, next) => {
  try {
    const { phone, mem_id, card, card_no, station, paystatno } = req.body;

    const final_phone = (phone || mem_id || "").trim();
    const final_card = (card || card_no || "").trim();
    const final_station = (station || paystatno || "").trim();

    const targetUrl = process.env.GCP_URL_V1;
    const gcptoken = await idToken(targetUrl);
    
    if (!gcptoken) {
      return res.status(500).json({ success: false, message: "無法取得 GCP 授權" });
    }
    
    const requestBody = { mem_id: final_phone };

    const response = await axios.post(targetUrl, requestBody, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    
    let rawDataList = response.data || [];

    if (final_card !== "") {
      rawDataList = rawDataList.filter(item => item['外觀卡號'] === final_card);
    }

    if (final_station !== "") {
      rawDataList = rawDataList.filter(item => String(item['扣款場站']) === final_station);
    }
    
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

// 🚀 1.0 交易查詢 - 更新備註專屬 Proxy 路由
router.post('/v1/transaction/remark', isAuth, async (req, res, next) => {
  try {
    const { ID, remark } = req.body;

    if (ID === undefined || ID === null) {
      return res.status(400).json({ success: false, message: "缺少交易 ID" });
    }

    const targetUrl = process.env.GCP_URL_TRANS_REMARK || "https://yb1-trans-update-421613424541.asia-east1.run.app";
    const gcptoken = await idToken(targetUrl);
    
    if (!gcptoken) {
      return res.status(500).json({ success: false, message: "無法取得 GCP 授權" });
    }
    
    const response = await axios.post(targetUrl, { 
      ID: Number(ID), 
      remark: remark || "" 
    }, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    
    res.status(200).json({ success: true, data: response.data });

  } catch (error) {
    if (error.response) {
      console.error("更新備註API報錯啦！狀態碼:", error.response.status);
    } else {
      console.error("更新備註失敗:", error.message);
    }
    res.status(500).json({ success: false, message: "外部 API 更新失敗" });
  }
});

// 🚀 1.0 會員查詢的專屬 Proxy 路由
router.post('/v1/member', isAuth, async (req, res, next) => {
  try {
    const mem_id = req.body.mem_id || req.body.phone || req.query.mem_id || "";
    const final_mem_id = String(mem_id).trim();

    if (!final_mem_id) {
      return res.status(400).json({ success: false, message: "缺少手機號碼" });
    }

    const targetUrl = process.env.GCP_URL_MEMBER || "https://yb1-member-421613424541.asia-east1.run.app"; 
    const gcptoken = await idToken(targetUrl);
    
    if (!gcptoken) {
      return res.status(500).json({ success: false, message: "無法取得 GCP 授權" });
    }
    
    const response = await axios.post(targetUrl, { mem_id: final_mem_id }, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "會員API查詢失敗" });
  }
});

// 🚀 1.0 卡片查詢的專屬 Proxy 路由
router.post('/v1/cards', isAuth, async (req, res, next) => {
  try {
    const { mem_id, card_no } = req.body; 
    const final_mem_id = (mem_id || "").trim();
    const final_card_no = (card_no || "").trim();

    if (!final_mem_id && !final_card_no) {
      return res.status(400).json({ success: false, message: "請提供查詢參數" });
    }

    const targetUrl = process.env.GCP_URL_CARDS || "https://yb1-cards-421613424541.asia-east1.run.app"; 
    const gcptoken = await idToken(targetUrl);
    
    if (!gcptoken) {
      return res.status(500).json({ success: false, message: "無法取得 GCP 授權" });
    }
    
    const response = await axios.post(targetUrl, { 
      mem_id: final_mem_id,
      card_no: final_card_no 
    }, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    
    res.status(200).json({ success: true, data: response.data || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "卡片API查詢失敗" });
  }
});

// 💡 點擊紀錄
router.post('/record-click', async (req, res, next) => {
  const { page_id } = req.body;
  if (!page_id) return res.status(400).json({ success: false, message: "缺少 page_id" });

  try {
    await useGCPMysql(
      `INSERT INTO report_clicks (page_id, click_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE click_count = click_count + 1`,
      [page_id]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ==========================================
// 🚀 以下為對接 Sean 最新提供的三支報表 API
// ==========================================


// 🛡️ 準備一個共用的 Axios 攔截器，專門修復 Python 產生的無效 JSON
const pythonJsonFixer = [function (data) {
  if (typeof data === 'string') {
    try {
      // 🚀 核心防護：把 Python 違規的 NaN 全部洗成 0，讓 JSON.parse 能順利運作
      const cleanData = data.replace(/:\s*NaN/g, ': 0');
      return JSON.parse(cleanData);
    } catch (e) {
      return data; 
    }
  }
  return data;
}];

// 1. 友愛接力場站明細
router.post('/relay-station', isAuth, async (req, res, next) => {
  try {
    const { report_name, city, begin_time, end_time } = req.body;

    // 🚨 加上 report_name 參數檢查
    if (!city || !begin_time || !end_time || !report_name) {
      return res.status(400).json({ success: false, message: "缺少必要查詢參數" });
    }

    const targetUrl = process.env.GCP_URL_REPORT_DATA || "https://report-data-421613424541.asia-east1.run.app";
    const gcptoken = await idToken(targetUrl);
    if (!gcptoken) return res.status(500).json({ success: false, message: "無法取得 GCP 授權" });
    
const response = await axios.post(targetUrl, { 
      report_name: report_name, 
      city: city.trim(),
      begin_time: begin_time,
      end_time: end_time
    },  { 
      headers: { Authorization: `Bearer ${gcptoken}` },
      transformResponse: pythonJsonFixer // 🚀 防護罩保留
    });
    
    res.status(200).json({ success: true, data: response.data || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "友愛接力查詢失敗" });
  }
});

// 2. 見車率統計日報
router.post('/lookcar-report', isAuth, async (req, res, next) => {
  try {
    const { begin_date, end_date, city, status, station } = req.body;

    if (!begin_date || !end_date || !Array.isArray(city) || !Array.isArray(status) || !Array.isArray(station)) {
      return res.status(400).json({ success: false, message: "缺少必要查詢參數或格式錯誤(需為陣列)" });
    }

    const targetUrl = process.env.GCP_URL_REPORT_DATA || "https://report-data-421613424541.asia-east1.run.app";
    const gcptoken = await idToken(targetUrl);
    if (!gcptoken) return res.status(500).json({ success: false, message: "無法取得 GCP 授權" });
    
    const response = await axios.post(targetUrl, { 
      report_name: '見車率統計日報',
      begin_date: begin_date,
      end_date: end_date,
      city: city,
      status: status,
      station: station // 🚀 關鍵：直接傳原始的 station 陣列，不要做任何修改！
    }, { 
      headers: { Authorization: `Bearer ${gcptoken}` },
      transformResponse: pythonJsonFixer // 保留 NaN 防護罩即可
    });
    
    res.status(200).json({ success: true, data: response.data || [] });
  } catch (error) {
    console.error("見車率統計日報API錯誤");
    res.status(500).json({ success: false, message: "見車率統計日報查詢失敗" });
  }
});

// 3. 高雄2.0E可用率
router.post('/kaohsiung-oper-rate', isAuth, async (req, res, next) => {
  try {
    const { table_type, begin_date, end_date } = req.body;

    if (!table_type || !begin_date || !end_date) {
      return res.status(400).json({ success: false, message: "缺少必要查詢參數" });
    }

    const targetUrl = process.env.GCP_URL_REPORT_DATA || "https://report-data-421613424541.asia-east1.run.app";
    const gcptoken = await idToken(targetUrl);
    if (!gcptoken) return res.status(500).json({ success: false, message: "無法取得 GCP 授權" });
    
    const response = await axios.post(targetUrl, { 
      report_name: '高雄2.0E可用率',
      table_type: table_type,
      begin_date: begin_date,
      end_date: end_date
    }, { 
      headers: { Authorization: `Bearer ${gcptoken}` },
      transformResponse: pythonJsonFixer 
    });
    
    res.status(200).json({ success: true, data: response.data || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "高雄2.0E可用率查詢失敗" });
  }
});

module.exports = router;