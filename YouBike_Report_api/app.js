require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 基礎設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 路由模組
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const stationRouter = require('./routes/station');
const reportRouter = require('./routes/report');

// 路由分發
app.use('/auth', authRouter);       // 負責 /login
app.use('/admin', adminRouter);     // 負責權限管理 (roles, users, citys)
app.use('/station', stationRouter); // 負責場站狀態 (catch_4)
app.use('/report', reportRouter);   // 負責大數據報表


// 啟動排程任務
// const { editgcpdata } = require('./service/ldapSync');
// editgcpdata();

// 錯誤處理中介軟體
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || '伺服器發生錯誤',
  });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`[YouBike Report API] 伺服器成功啟動在 Port: ${port}`);
});

module.exports = app;