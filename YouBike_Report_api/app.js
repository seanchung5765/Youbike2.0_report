require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { editgcpdata } = require("./service/GetldaptoGCP");
const cors = require("cors");
const history = require("connect-history-api-fallback");
// const { SendMailTatol } = require("./tool/sendEmail");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/isauth");
const toexcelRouter = require("./routes/toexcel");
const smsRouter = require("./routes/sms");
const lotteryRouter = require("./routes/lottery");
const mailRouter = require("./routes/mail");
const dbRouter = require("./routes/db");
const { createGCPMysqlPool } = require("./service/cloudSql");

var app = express();
app.use(cors());
app.use(logger("dev"));
// 允许最大 1MB 的 JSON 请求体
app.use(express.json({ limit: "1mb" }));
// 对 URL-encoded 形式允许最大 1MB，使用 qs 库进行解析
app.use(express.urlencoded({ limit: "1mb", extended: true }));
app.use(cookieParser());
app.use("/db", dbRouter);
app.use("/sms", smsRouter);
app.use(history());

app.use(express.static(path.join(__dirname, "public")));

//每天一點更新從ldap跟新資料到GCP
editgcpdata();
//連接資料庫
createGCPMysqlPool();

app.use("/toexcel", toexcelRouter);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/isauth", authRouter);
app.use("/lottery", lotteryRouter);
app.use("/mail", mailRouter);

app.use((err, req, res, next) => {
  const { message, statusCode, isOperational } = err;
  if (!isOperational) {
    res.status(500).json({
      message: "發生未知錯誤請聯絡管理員",
    });
  }
  res.status(statusCode).json({ message });
});

module.exports = app;
