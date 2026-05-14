const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const { useGCPMysql } = require("../service/cloudSql");

function getNowDay() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

router.get("/catch_4/:city/:status", isAuth, async (req, res, next) => {
  try {
    const { city, status } = req.params;
    const nowday = getNowDay();
    
    const sql = `SELECT DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at, data 
                 FROM station_4_test_catch 
                 WHERE updated_at >= '${nowday}'`;
                 
    const ResData = await useGCPMysql(sql);

    const filterRes = ResData.map((items) => {
      const rawData = Array.isArray(items.data) ? items.data : (JSON.parse(items.data) || []);
      const filteredData = rawData
        .filter((item) => item.city === city && String(item.status) === String(status))
        .map((col) => ({ tie_bike: col.tie_bike, station_count: col.station_count }));

      const findTieBike = (val) => filteredData.find((o) => o.tie_bike === val) || { tie_bike: val, station_count: 0 };

      return {
        updated_at: items.updated_at,
        0: findTieBike(0),
        1: findTieBike(1),
        2: findTieBike(2),
      };
    });

    res.status(200).json({ city, status, data: filterRes });
  } catch (error) {
    next(error);
  }
});

router.get('/cities', isAuth, async (req, res) => {
  try {
    // 🌟 究極進化版 SQL：使用 LEFT JOIN 關聯 report_groups 表格，直接帶出群組名稱
    const query = `
      SELECT 
        r.id, 
        r.name, 
        r.codes, 
        r.report_group_id, 
        g.name AS report_group_name 
      FROM regions r 
      LEFT JOIN report_groups g ON r.report_group_id = g.id 
      WHERE r.status = 'active'
      ORDER BY r.id ASC
    `;
    const rows = await useGCPMysql(query);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("取得縣市字典失敗:", error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

module.exports = router;