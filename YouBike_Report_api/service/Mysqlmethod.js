const mysql = require("mysql2/promise");
require("dotenv").config({ path: "../.env" });

let pool = null;

const createMysqlPool = () => {
  pool = mysql.createPool({
    host: process.env["MYSQL_HOST"],
    user: process.env["MYSQL_USER"],
    password: process.env["MYSQL_PASSWORD"],
    port: process.env["MYSQL_PORT"],
    database: "lotteryDB",
    connectionLimit: 10, // 连接池的连接数限制
  });
};

const useMysql = async (query) => {
  const connection = await pool.getConnection();
  try {
    const [rows, fields] = await connection.execute(query);
    return rows;
  } finally {
    connection.release(); // 释放连接回连接池
  }
};

module.exports = {
  createMysqlPool,
  useMysql,
};
