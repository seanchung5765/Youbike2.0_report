const express = require("express");
const router = express.Router();
const isauth = require("../service/isloginmiddleware");
const appError = require("../service/appError");
// const { createMysqlPool,useMysql, } = require('../service/Mysqlmethod')
const { useGCPMysql } = require("../service/cloudSql");

//查看
router.get("/blacklist", async (req, res, next) => {
  try {
    const data = await useGCPMysql("select * from blacklist");
    res.status(200).json({ data });
  } catch (error) {
    appError(400, "查看錯誤", next);
  }
});

router.put("/blacklist", async (req, res, next) => {
  const data = req.body;

  if (!data) {
    return appError(400, "參數不存在", next);
  }
  try {
    await useGCPMysql(`delete from blacklist`);
    for (let i = 0; i < data.length; i++) {
      await useGCPMysql(
        `insert into blacklist (mobile, cardno) value ('${data[i]["mobile"]}','${data[i]["cardno"]}')`
      );
    }
    res.status(200).json({ message: "更新成功" });
  } catch (error) {
    appError(500, "EXCEL資料錯誤", next);
  }
});

module.exports = router;
