require("dotenv").config({ path: "../.env" });
const express = require("express");
const { json } = require("express");
const ldap = require("ldapjs");

let client = null; // 保存连接实例

// 创建 LDAP 连接
function createClient() {
  const newClient = ldap.createClient({
    url: process.env.LDAP_URL,
  });

  // 绑定错误处理
  newClient.on("error", (err) => {
    console.error("LDAP 连接错误:", err);
  });

  return newClient;
}

// 连接
function bindAsync(username, password) {
  return new Promise((resolve, reject) => {
    // if (client && client.connected) {
    //   // 已经建立了有效的连接，无需再次登录
    //   resolve("已經登入");
    // } else {
    // 创建新的连接并登录
    client = createClient();
    client.bind(
      `uid=${username},cn=users,dc=YouBike,dc=tw`,
      password,
      (err) => {
        if (err) {
          reject(`${err.code} - ${err.message}`);
        } else {
          resolve("成功登入");
        }
      }
    );
    // }
  });
}

// 关闭连接
function closeAsync() {
  return new Promise((resolve, reject) => {
    if (client && client.connected) {
      client.unbind((err) => {
        if (err) {
          reject(err);
        } else {
          client = null; // 清空连接实例
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

const base = "cn=users,dc=YouBike,dc=tw";
const searchOptions = {
  scope: "sub",
  attributes: ["gecos"],
};

//搜索
function searchAsync(base, searchOptions) {
  return new Promise((resolve, reject) => {
    const entries = [];
    client.search(base, searchOptions, (err, res) => {
      if (err) {
        reject(err);
      } else {
        //搜尋到東西才會觸發
        res.on("searchEntry", (entry) => {
          entries.push(JSON.stringify(entry.pojo));
        });
        res.on("error", (err) => {
          console.log("error: " + err.message);
          reject(err); // 发生错误时拒绝 Promise
        });
        res.on("end", () => {
          if (entries.length === 0) {
            console.log("未找到任何條目");
          }
          resolve(entries);
        });
      }
    });
  });
}

const remakeData = (searchResult) => {
  const data = [...searchResult];
  let arr = [];

  data.forEach((item) => {
    try {
      const jsonitem = JSON.parse(item);
      const attr = jsonitem.attributes[0];

      // 1. 檢查屬性是否存在且有值
      if (!attr || !attr.values || !attr.values[0]) return;

      const rawValue = attr.values[0];
      const parts = rawValue.split("_");

      // 2. 檢查分割後的長度，避免 null 導致的錯誤
      if (parts.length < 2) return;

      const user_data = {
        id: parts[0],
        name: parts[1],
      };

      // 3. 排除值為 "null" 字串或 undefined 的資料
      if (!user_data.id || user_data.id === "null" || !user_data.name || user_data.name === "null") {
        return;
      }

      // 4. 正規表達式過濾
      if (/^GA\d+$/.test(user_data.id) || 
          (/^G\d+$/.test(user_data.id) && !/^GB\d+$/.test(user_data.id)) ||
          /^GB\d+$/.test(user_data.id)) {
        arr.push(user_data);
      }
    } catch (e) {
      console.error("解析 LDAP 資料錯誤:", e);
    }
  });
  return arr;
};

async function searchfun() {
  try {
    const account = process.env.LDAP_ACC;
    const password = process.env.LDAP_PASSWORD;
    await bindAsync(account, password);
    const searchResult = await searchAsync(
      "cn=users,dc=YouBike,dc=tw",
      searchOptions
    );
    return remakeData(searchResult);
  } catch (error) {
    return error;
  } finally {
    await closeAsync();
  }
}
module.exports = {
  searchfun,
  bindAsync,
  closeAsync,
};
