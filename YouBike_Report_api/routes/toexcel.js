var express = require("express");
var router = express.Router();
const axios = require("axios");
const appError = require("../service/appError");

/* 辦公室電話 */
router.put("/officetel", async (req, res, next) => {
  const { data } = req.body;

  if (!data) {
    return appError(400, "參數不存在", next);
  }
  try {
    const url = process.env["GCP_EXCEL_URL"];
    const newdata = [];
    data.forEach((element) => {
      newdata.push({
        item1: element.item0,
        item2: element.item1,
      });
    });
    const payload = {
      type: "office_tel",
      data: newdata,
    };
    const excelres = await axios.put(url, payload);
    res.status(200).json({ massage: "更新成功" });
  } catch (error) {
    appError(500, "EXCEL資料錯誤", next);
  }
});

router.get("/officetel", async (req, res, next) => {
  try {
    const url = process.env["GCP_EXCEL_URL"];
    const payload = {
      type: "office_tel",
    };
    const excelres = await axios.post(url, payload);
    res.status(200).json({
      massage: "成功",
      rows: excelres.data.rows,
    });
  } catch (error) {
    appError(400, "查看錯誤", next);
  }
});

// 工程
router.get("/engine", async (req, res, next) => {
  try {
    const url = process.env["GCP_EXCEL_URL"];
    const payload = {
      type: "engine_table",
    };
    const excelres = await axios.post(url, payload);
    res.status(200).json({
      massage: "成功",
      rows: excelres.data.rows,
    });
  } catch (error) {
    appError(400, "查看錯誤", next);
  }
});

router.put("/engine", async (req, res, next) => {
  const { data } = req.body;
  if (!data) {
    return appError(400, "參數不存在", next);
  }
  try {
    const url = process.env["GCP_EXCEL_URL"];
    const newdata = [];
    data.forEach((element) => {
      newdata.push({
        item1: element.item0,
        item2: element.item1,
        item3: element.item2,
        item4: element.item3,
        item5: element.item4,
        item6: element.item5,
        item7: element.item6,
        item8: element.item7,
        item9: element.item8,
        item10: element.item9,
        item11: element.item10,
        item12: element.item11,
        item13: element.item12,
        item14: element.item13,
        item15: element.item14,
      });
    });
    const payload = {
      type: "engine_table",
      data: newdata,
    };
    const excelres = await axios.put(url, payload);
    res.status(200).json({ massage: "更新成功" });
  } catch (error) {
    console.log(error);
    appError(500, "EXCEL資料錯誤", next);
  }
});

// 4G場站
router.get("/FourG", async (req, res, next) => {
  try {
    const url = process.env["GCP_EXCEL_URL"];
    const payload = {
      type: "FourG_table",
    };
    const excelres = await axios.post(url, payload);
    res.status(200).json({
      massage: "成功",
      rows: excelres.data.rows,
    });
  } catch (error) {
    appError(400, "查看錯誤", next);
  }
});

router.put("/FourG", async (req, res, next) => {
  const { data } = req.body;
  if (!data) {
    return appError(400, "參數不存在", next);
  }
  try {
    const url = process.env["GCP_EXCEL_URL"];
    const newdata = [];
    data.forEach((element) => {
      newdata.push({
        item1: element.item0,
        item2: element.item1,
        item3: element.item2,
        item4: element.item3,
        item5: element.item4,
        item6: element.item5,
        item7: element.item6,
        item8: element.item7,
        item9: element.item8,
        item10: element.item9,
      });
    });
    const payload = {
      type: "FourG_table",
      data: newdata,
    };
    const excelres = await axios.put(url, payload);
    res.status(200).json({ massage: "更新成功" });
  } catch (error) {
    appError(500, "EXCEL資料錯誤", next);
  }
});

/* 辦公室網路 */
router.put("/officeinternet", async (req, res, next) => {
  const { data } = req.body;
  if (!data) {
    return appError(400, "參數不存在", next);
  }
  try {
    const url = process.env["GCP_EXCEL_URL"];
    const newdata = [];
    data.forEach((element) => {
      newdata.push({
        item1: element.item0,
        item2: element.item1,
      });
    });
    const payload = {
      type: "office_internet",
      data: newdata,
    };
    const excelres = await axios.put(url, payload);
    res.status(200).json({ massage: "更新成功" });
  } catch (error) {
    appError(500, "EXCEL資料錯誤", next);
  }
});

router.get("/officeinternet", async (req, res, next) => {
  try {
    const url = process.env["GCP_EXCEL_URL"];
    const payload = {
      type: "office_internet",
    };
    const excelres = await axios.post(url, payload);
    res.status(200).json({
      massage: "成功",
      rows: excelres.data.rows,
    });
  } catch (error) {
    appError(400, "查看錯誤", next);
  }
});

/* 平板統計 */
router.put("/IpadTotal", async (req, res, next) => {
  const { data } = req.body;
  if (!data) {
    return appError(400, "參數不存在", next);
  }
  try {
    const url = process.env["GCP_EXCEL_URL"];
    const newdata = [];
    data.forEach((element) => {
      newdata.push({
        item1: element.item0,
        item2: element.item1,
        item3: element.item2,
        item4: element.item3,
      });
    });
    const payload = {
      type: "IpadTotal_table",
      data: newdata,
    };
    const excelres = await axios.put(url, payload);
    res.status(200).json({ massage: "更新成功" });
  } catch (error) {
    appError(500, "EXCEL資料錯誤", next);
  }
});
router.get("/IpadTotal", async (req, res, next) => {
  try {
    const url = process.env["GCP_EXCEL_URL"];
    const payload = {
      type: "IpadTotal_table",
    };
    const excelres = await axios.post(url, payload);
    res.status(200).json({
      massage: "成功",
      rows: excelres.data.rows,
    });
  } catch (error) {
    appError(400, "查看錯誤", next);
  }
});

module.exports = router;
