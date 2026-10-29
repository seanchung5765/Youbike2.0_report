//D:\維護中資料(待上傳git)\YouBike_Report\YouBike_Report_api\service\cloudSql.js
require("dotenv").config({ path: "../.env" });
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");

let pool = null;

// 建立連線池 (不對外匯出，當作內部私有函式)
const createGCPMysqlPool = () => {
  const dbConfig = {
    user: process.env.GCP_MYSQL_USER,
    password: process.env.GCP_MYSQL_PASSWORD,
    database: process.env.GCP_MYSQL_DATABASE,
  };

  if (process.env.INSTANCE_UNIX_SOCKET) {
    // 【雲端模式】Cloud Run 直接走內部 Socket
    dbConfig.socketPath = process.env.INSTANCE_UNIX_SOCKET;
    console.log("偵測到 Cloud Run 環境，使用 Unix Socket 連線 Cloud SQL");
  } else {
    // 【地端模式】透過本機 Cloud SQL Proxy 連線，無需在 Node.js 端設定 SSL (Proxy 會自動加密)
    dbConfig.host = process.env.GCP_MYSQL_HOST;
    dbConfig.port = process.env.GCP_MYSQL_PORT;
    console.log("偵測到本地環境，使用 TCP 透過 Proxy 連線 Cloud SQL");
  }

  pool = mysql.createPool(dbConfig);
};

// 🌟 核心：對外開放的查詢小幫手
const useGCPMysql = async (query, params = []) => {
  if (!pool) createGCPMysqlPool();

  let connection;
  try {
    connection = await pool.getConnection();
    
    // 🌟 關鍵優化：改用 query，這樣遇到 WHERE id IN (?) 才能正確把陣列展開
    const [rows] = await connection.query(query, params);
    return rows;
    
  } catch (error) {
    // 精簡錯誤判斷寫法
    if (["PROTOCOL_CONNECTION_LOST", "ECONNREFUSED", "Pool is closed"].includes(error.code)) {
      console.error("資料庫斷線，嘗試重新連線...");
      createGCPMysqlPool();
      return useGCPMysql(query, params);
    }
    console.error("SQL 執行錯誤:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// 關閉連線池
const closeGCPPool = () => {
  if (pool) pool.end();
};

module.exports = {
  useGCPMysql,
  closeGCPPool,
};