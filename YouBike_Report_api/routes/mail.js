const express = require("express");
const router = express.Router();
const isauth = require("../service/isloginmiddleware");
const appError = require("../service/appError");
const { useGCPMysql } = require("../service/cloudSql");

//查看
router.get("/mailcontent", isauth, async (req, res, next) => {
  try {
    const data = await useGCPMysql("select * from mail_content");
    res.status(200).json({ data });
  } catch (error) {
    return appError(400, "查看錯誤", next);
  }
});

//新增狀態
router.post("/status", isauth, async (req, res, next) => {
  const { time, textareaValue, title, city } = req.body;
  if ((!time, !textareaValue, !title, !city)) {
    return appError(401, "參數錯誤", next);
  }
  try {
    let str = "";
    textareaValue.forEach((element, index) => {
      if (index === textareaValue.length - 1) {
        str += `('${city}' , '${title}', ${time},'${element}')`;
      } else {
        str += `('${city}' , '${title}', ${time},'${element}'),`;
      }
    });
    await useGCPMysql(`INSERT INTO mail_content (city_name,type_name,time,mail)
    VALUES ${str}`);
    res.status(200).json({ message: "api成功" });
  } catch (error) {
    return appError(401, "查看錯誤", next);
  }
});

//編輯狀態
router.put("/status", isauth, async (req, res, next) => {
  const { newObj, oldData } = req.body;
  if (!newObj || !oldData) {
    return appError(401, "參數錯誤", next);
  }

  //先刪除
  try {
    const sql = `DELETE FROM mail_content
    WHERE city_name="${oldData.city}" and time=${oldData.min} and type_name="${oldData.title}"`;
    await useGCPMysql(sql);
  } catch (error) {
    return appError(401, "狀態更新失敗", next);
  }
  try {
    let str = "";

    newObj.email.forEach((element, index) => {
      if (index === newObj.email.length - 1) {
        str += `('${newObj.city}' , '${newObj.title}', ${newObj.min},'${element}')`;
      } else {
        str += `('${newObj.city}' , '${newObj.title}', ${newObj.min},'${element}'),`;
      }
    });

    await useGCPMysql(`INSERT INTO mail_content (city_name,type_name,time,mail)
    VALUES ${str}`);
    res.status(200).json({ message: "狀態更新成功" });
  } catch (error) {
    appError(401, "查看錯誤", next);
  }
});

//
router.delete("/status", isauth, async (req, res, next) => {
  const { type, time, city } = req.query;
  if (!type || !time || !city) {
    console.log(type, time, city);
    return appError(401, "參數錯誤", next);
  }

  try {
    const sql = `DELETE FROM mail_content
    WHERE city_name="${city}" and time=${time} and type_name="${type}"`;
    await useGCPMysql(sql);
    res.status(200).json({ message: "刪除成功" });
  } catch (error) {
    return appError(403, "刪除失敗", next);
  }
});

//只更新於場站告警
router.put("/station/status", isauth, async (req, res, next) => {
  const { mailList, city, type } = req.body;
  if (!mailList || !city) {
    return appError(401, "mailList參數錯誤", next);
  }

  try {
    //刪除
    const deleteSql = `delete from mail_content where city_name="${city}" AND type_name="${type}";`;
    await useGCPMysql(deleteSql);

    //新增多比
    let str = "";
    mailList.forEach((element, index) => {
      if (index === mailList.length - 1) {
        str += `('${city}' , "${type}", 0,'${element}')`;
      } else {
        str += `('${city}' , "${type}", 0,'${element}'),`;
      }
    });
    const insertSql = `INSERT INTO mail_content (city_name,type_name,time,mail) VALUES ${str}`;

    //如果email沒空則不insert
    if (str !== "") {
      await useGCPMysql(insertSql);
    }

    res.status(200).json({ message: "編輯成功" });
  } catch (error) {
    return appError(400, "刪除失敗", next);
  }
});

//
router.put("/listmail", async (req, res, next) => {
  const { carnum, area } = req.body;
  // console.log( req.body);
  if (!carnum || !area) {
    return appError(401, "carnum", next);
  }

  try {
    //刪除
    const deleteSql = `delete from listmail where area='${area}'`;
    await useGCPMysql(deleteSql);
    //新增多比
    let str = "";
    carnum.forEach((element, index) => {
      if (index === carnum.length - 1) {
        str += `('${element}', '${area}')`;
      } else {
        str += `('${element}', '${area}'),`;
      }
    });

    const insertSql = `INSERT INTO listmail (carnum,area) VALUES ${str}`;

    //如果email沒空則不insert
    if (str !== "") {
      // console.log
      await useGCPMysql(insertSql);
    }

    res.status(200).json({ message: "編輯成功" });
  } catch (error) {
    console.log(error);
    return appError(400, "刪除失敗", next);
  }
});

module.exports = router;
