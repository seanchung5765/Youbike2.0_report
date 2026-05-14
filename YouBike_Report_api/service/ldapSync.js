require("dotenv").config({ path: "../.env" });
const axios = require("axios");
const { closeAsync, searchfun } = require("./ldapcon");
const cron = require("node-cron");

const GCP_BASE_URL = process.env.GCP_USER_URL;

/**
 * 取得 LDAP 資料
 */
const getldapdata = async () => {
  try {
    const res = await searchfun();
    await closeAsync();
    return res;
  } catch (error) {
    console.error("[LDAP] 抓取失敗:", error.message);
    return [];
  }
};

/**
 * 取得 GCP 使用者 ID 列表
 */
const getgcpdata = async () => {
  try {
    const res = await axios.get(`${GCP_BASE_URL}/users`);
    const data = res.data.rows || res.data.cows || []; 
    return data.map(element => element.users_id);
  } catch (error) {
    console.error("[GCP] 抓取失敗:", error.message);
    return [];
  }
};

/**
 * 新增使用者到 GCP
 */
const addgcpuserdata = async (gcpdata, ldapdata) => {
  const gcpSet = new Set(gcpdata);
  const pendingAdds = ldapdata.filter(item => !gcpSet.has(item.id));

  if (pendingAdds.length === 0) return;

  console.log(`[新增] 準備處理 ${pendingAdds.length} 筆資料...`);

  let successCount = 0;
  for (const item of pendingAdds) {
    try {
      await axios.post(`${GCP_BASE_URL}/users`, {
        users_id: item.id,
        name: item.name,
        role_id: null,
      });
      successCount++;
    } catch (error) {
      console.error(`[新增失敗] 工號 ${item.id}:`, error.response?.data || error.message);
    }
  }
  console.log(`[新增] 成功同步 ${successCount}/${pendingAdds.length} 筆資料。`);
};

/**
 * 從 GCP 刪除 LDAP 已不存在的使用者 (改為安全循序處理)
 */
const deleteuserdata = async (gcpdata, ldapdata) => {
  const ldapSet = new Set(ldapdata.map(item => item.id));
  const pendingDeletes = gcpdata.filter(id => !ldapSet.has(id));

  if (pendingDeletes.length === 0) return;

  console.log(`[刪除] 準備處理 ${pendingDeletes.length} 筆資料...`);

  let successCount = 0;
  for (const id of pendingDeletes) {
    try {
      await axios.delete(`${GCP_BASE_URL}/users/${id}`);
      successCount++;
    } catch (error) {
      console.error(`[刪除失敗] 工號 ${id}:`, error.response?.data || error.message);
    }
  }
  console.log(`[刪除] 成功移除 ${successCount}/${pendingDeletes.length} 筆資料。`);
};

let isUpdating = false;

/**
 * 每日排程任務
 */
const editgcpdata = () => {
  cron.schedule(
    "00 00 01 * * *",
    async () => {
      if (isUpdating) {
        console.warn("[排程] 上次任務尚未結束，跳過本次執行。");
        return;
      }

      try {
        isUpdating = true;
        console.log(`[排程] 開始同步任務: ${new Date().toLocaleString()}`);

        const [ldapdata, gcpdata] = await Promise.all([
          getldapdata(),
          getgcpdata()
        ]);

        if (!ldapdata.length && !gcpdata.length) {
          console.warn("[排程] 無法取得資料，取消同步。");
          return;
        }

        await addgcpuserdata(gcpdata, ldapdata);
        await deleteuserdata(gcpdata, ldapdata);

        console.log("[排程] 每日同步作業完成。");
      } catch (error) {
        console.error("[排程] 每日更新失敗:", error);
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

module.exports = { editgcpdata };