const { v4: uuidv4 } = require("uuid");
const express = require("express");
const router = express.Router();
const isauth = require("../service/isloginmiddleware");
const appError = require("../service/appError");
const { useGCPMysql } = require("../service/cloudSql");

function formatDateToMySQL(date) {
  const twoDigits = (num) => (num < 10 ? "0" + num : num);
  let year = date.getFullYear();
  let month = twoDigits(date.getMonth() + 1); // JavaScript中月份是从0开始的
  let day = twoDigits(date.getDate());
  let hours = twoDigits(date.getHours());
  let minutes = twoDigits(date.getMinutes());
  let seconds = twoDigits(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//"簡訊發送"
router.post("/send", isauth, async (req, res, next) => {
  const { phone, message, yb_id, check } = req.body;

  if (!yb_id) {
    appError(400, "缺少yb_id", next);
    return;
  } else if (!phone || phone.length === 0) {
    appError(400, "缺少phone或是長度不能等於0", next);
    return;
  } else if (!message) {
    appError(400, "message不能為空", next);
    return;
  }

  try {
    const now = new Date();
    const mysqlDateTime = formatDateToMySQL(now);

    //這是要給sql的語句
    let str = "";

    //這邊的true需要從簡訊發送裡得知
    phone.forEach((element, index) => {
      const uuid = uuidv4();
      if (index === phone.length - 1) {
        str += `('${uuid}','${element}' , '${mysqlDateTime}', '${message}', 0 ,'${yb_id}')`;
      } else {
        str += `('${uuid}','${element}' , '${mysqlDateTime}', '${message}', 0,'${yb_id}'),`;
      }
    });

    if (check === true) {
      await useGCPMysql(
        `INSERT INTO message_check_logs (id,phone, date, message, status, yb_id) VALUES ${str}`
      );
    } else {
      await useGCPMysql(
        `INSERT INTO message_logs (id,phone, date, message, status, yb_id) VALUES ${str}`
      );
    }

    res.status(200).json({
      message: "儲存及發送成功",
    });
  } catch (error) {
    return appError(400, error.message, next);
  }
});

//"上傳檔案發送"
router.post("/sendMany", isauth, async (req, res, next) => {
  const { data, check } = req.body;

  if (!Array.isArray(data)) {
    appError(400, "參數格式錯誤", next);
    return;
  }

  try {
    const now = new Date();
    const mysqlDateTime = formatDateToMySQL(now);

    //這是要給sql的語句
    let str = "";

    //這邊的true需要從簡訊發送裡得知
    data.forEach((element, index) => {
      const uuid = uuidv4();
      if (index === data.length - 1) {
        str += `('${uuid}','${element.phone}' , '${mysqlDateTime}', '${element.message}', 0 ,'${element.yb_id}')`;
      } else {
        str += `('${uuid}','${element.phone}' , '${mysqlDateTime}', '${element.message}', 0,'${element.yb_id}'),`;
      }
    });

    if (check === true) {
      await useGCPMysql(
        `INSERT INTO message_check_logs (id,phone, date, message, status, yb_id) VALUES ${str}`
      );
    } else {
      await useGCPMysql(
        `INSERT INTO message_logs (id,phone, date, message, status, yb_id) VALUES ${str}`
      );
    }

    res.status(200).json({
      message: "儲存及發送成功",
    });
  } catch (error) {
    return appError(400, error.message, next);
  }
});

router.get("/callback", async (req, res, next) => {
  // msgid=1957148324&dstaddr=0922104075&dlvtime=20240709104214&donetime=20240709104219&statusstr=DELIVRD&statuscode=0&StatusFlag=4
  const { msgid, StatusFlag } = req.query;

  try {
    const sql = `INSERT INTO message_callback_log (msg_id,status) VALUES ('${msgid}',${StatusFlag})`;
    await useGCPMysql(sql);
    const responseContent = `magicid=sms_gateway_rpack\nmsgid=${msgid}\n`;
    res.set("Content-Type", "text/plain");
    res.send(responseContent);
  } catch (error) {
    return appError(400, error.message, next);
  }
});

//查詢簡訊狀態
router.get("/status", isauth, async (req, res, next) => {
  try {
    const { number, start, end } = req.query;

    const sql = `SELECT DATE_FORMAT(date,  '%Y-%m-%d %H:%i:%s') as date , message,status,yb_id,phone  FROM message_logs WHERE date BETWEEN '${start}' AND '${end} 23:59:59' AND phone='${number}'`;
    const result = await useGCPMysql(sql);
    res.status(200).json({
      message: "成功抓取檔案",
      result,
    });
  } catch (error) {
    return appError(400, error.message, next);
  }
});

//這是給發送確認
router.get("/status_check", isauth, async (req, res, next) => {
  try {
    const sql = `select count(*) as total_count, DATE_FORMAT(date,  '%Y-%m-%d %H:%i:%s') as date ,yb_id from message_check_logs group by date,yb_id;`;
    const result = await useGCPMysql(sql);
    res.status(200).json({
      message: "成功抓取檔案",
      result,
    });
  } catch (error) {
    return appError(400, error.message, next);
  }
});

//從確認更新到正式發送頁
router.put("/update_check", isauth, async (req, res, next) => {
  //先抓取check => 把它更新到logs => 刪除check頁
  try {
    const { yb_id, date } = req.body;
    const sql = `select * from  message_check_logs where yb_id='${yb_id}' AND date='${date}'`;
    const result = await useGCPMysql(sql);

    //這是要給sql的語句
    let str = "";
    result.forEach((element, index) => {
      const formattedDate = new Date(element.date)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      if (index === result.length - 1) {
        str += `('${element.id}','${element.phone}' , '${formattedDate}', '${element.message}', ${element.status} ,'${element.yb_id}')`;
      } else {
        str += `('${element.id}','${element.phone}' , '${formattedDate}', '${element.message}', ${element.status},'${element.yb_id}'),`;
      }
    });

    await useGCPMysql(
      `INSERT INTO message_logs (id,phone, date, message, status, yb_id) VALUES ${str}`
    );

    //之後刪掉
    await useGCPMysql(
      `delete  from  message_check_logs where yb_id='${yb_id}' AND date='${date}'`
    );

    res.status(200).json({
      message: "成功抓取檔案",
      result,
    });
  } catch (error) {
    return appError(400, error.message, next);
  }
});

module.exports = router;
