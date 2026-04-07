require("dotenv").config({ path: "../.env" });
const express = require("express");
const ldap = require("ldapjs");
const axios = require("axios");
const { bindAsync, closeAsync, searchfun } = require("./ldapcon");
const cron = require("node-cron");

const getldapdata = async () => {
  try {
    const res = await searchfun();
    await closeAsync();
    return res;
  } catch (error) {
    console.log(error);
  }
};

const getgcpdata = async () => {
  try {
    const gcpurl = process.env.GCP_USER_URL;
    const url = `${gcpurl}/users`;
    const res = await axios.get(url);
    const data = res.data.cows;
    let arr = [];
    data.forEach((element) => {
      arr.push(element.users_id);
    });
    return arr;
  } catch (error) {
    console.log(error);
  }
};

const addgcpuserdata = async (gcpdata, ldapdata) => {
  let data = [];
  ldapdata.forEach((item) => {
    //判斷gcp中有沒有ldap裡的id
    if (!gcpdata.includes(item.id)) {
      data.push(item);
    }
  });
  //把她push到gcp
  async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  try {
    for (const item of data) {
      const gcpurl = process.env.GCP_USER_URL;
      const url = `${gcpurl}/users`;
      const payload = {
        users_id: item.id,
        name: item.name,
        role_id: null,
      };
      await axios.post(url, payload);
      // console.log("insert success", payload);
      await delay(500); // 延遲 0.5 秒
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteuserdata = async (gcpdata, ldapdata) => {
  let ldaparr = [];
  let arr = [];
  ldapdata.forEach((item) => {
    ldaparr.push(item.id);
  });
  gcpdata.forEach((item) => {
    if (!ldaparr.includes(item)) {
      arr.push(item);
    }
  });
  async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  try {
    for (const item of arr) {
      const gcpurl = process.env.GCP_USER_URL;
      const url = `${gcpurl}/users/${item}`;
      await axios.delete(url);
      // console.log(`delete data ${item}`);
      await delay(1000); // 延遲 1 秒
    }
  } catch (error) {
    console.log(error);
  }
};

let isUpdating = false;
const editgcpdata = () => {
  //每天一點
  cron.schedule(
    "00 00 01 * * *",
    async () => {
      try {
        if (isUpdating) {
          console.log("進行刪除中別打擾....");
          return;
        }
        isUpdating = true;

        const ldapdata = await getldapdata();
        const gcpdata = await getgcpdata();
        await addgcpuserdata(gcpdata, ldapdata);
        await deleteuserdata(gcpdata, ldapdata);
      } catch (error) {
        console.log("每天一點更新失敗", error);
      } finally {
        isUpdating = false;
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Taipei",
    }
  );
};
// async function fun() {
//   try {
//     console.log("進行刪除中別打擾....");
//     const ldapdata = await getldapdata();
//     const gcpdata = await getgcpdata();
//     await addgcpuserdata(gcpdata, ldapdata);
//     await deleteuserdata(gcpdata, ldapdata);
//     console.log("完成");
//   } catch (error) {
//     console.log(error);
//   }
// }
// fun();
module.exports = { editgcpdata };
