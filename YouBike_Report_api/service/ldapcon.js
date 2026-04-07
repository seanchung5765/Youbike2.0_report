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
  const resdata = [];

  const newdata = data.map((item) => {
    const jsonitem = JSON.parse(item);
    return jsonitem.attributes[0];
  });
  let arr = [];
  newdata.forEach((item, index) => {
    if (!item) {
      return;
    }
    const user_data = {
      name: item.values[0].split("_")[1],
      id: item.values[0].split("_")[0],
    };
    //GA開頭PUSH
    if (/^GA\d+$/.test(user_data.id)) {
      arr.push(user_data);
    }
    //G開頭PUSH
    if (/^G\d+$/.test(user_data.id) && !/^GB\d+$/.test(user_data.id)) {
      arr.push(user_data);
    }
    //GB開頭PUSH
    if (/^GB\d+$/.test(user_data.id)) {
      arr.push(user_data);
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
