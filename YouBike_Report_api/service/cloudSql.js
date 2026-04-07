require("dotenv").config({ path: "../.env" });
const express = require("express");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");
const ssl = {
  rejectUnauthorized: false,
  key: fs
    .readFileSync(path.join(__dirname, "../cloudsql/client-key.pem"))
    .toString(),
  cert: fs
    .readFileSync(path.join(__dirname, "../cloudsql/client-cert.pem"))
    .toString(),
  ca: fs
    .readFileSync(path.join(__dirname, "../cloudsql/server-ca.pem"))
    .toString(),
};

let pool = null;
//連接
const createGCPMysqlPool = () => {
  pool = mysql.createPool({
    host: process.env["GCP_MYSQL_HOST"],
    user: process.env["GCP_MYSQL_USER"],
    password: process.env["GCP_MYSQL_PASSWORD"],
    port: process.env["GCP_MYSQL_PORT"],
    ssl,
    database: process.env["GCP_MYSQL_DATABASE"],
  });
};

//使用
const useGCPMysql = async (query) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(query);
    return rows;
  } catch (error) {
    if (
      error.code === "PROTOCOL_CONNECTION_LOST" ||
      error.code === "ECONNREFUSED" ||
      error.code === "Pool is closed"
    ) {
      console.error("Database connection was closed. Reconnecting...");
      createGCPMysqlPool();
      return useGCPMysql(query);
    }
    console.error(error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

//關閉
const closeGCPPool = () => {
  // pool.end();
};

module.exports = {
  createGCPMysqlPool,
  useGCPMysql,
  closeGCPPool,
};
