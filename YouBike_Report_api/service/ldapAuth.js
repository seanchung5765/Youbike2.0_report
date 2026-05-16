require("dotenv").config();
const ldap = require("ldapjs");

const {
  LDAP_URL,
  LDAP_DN,
  LDAP_PASSWORD,
  LDAP_BASE_DN,
  LDAP_USER_ATTR
} = process.env;

const bindAsync = (username, password) => {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: LDAP_URL });

    client.on("error", (err) => {
      console.error("LDAP 連線異常:", err.message);
    });

    const bindDN = username.includes("=") ? username : `uid=${username},cn=users,${LDAP_BASE_DN}`;

    client.bind(bindDN, password, (err) => {
      if (err) {
        if (typeof client.destroy === 'function') client.destroy();
        return reject(new Error(`${err.message}`));
      }
      resolve(client);
    });
  });
};

/**
 * 安全關閉並銷毀連線
 */
const closeAsync = (client) => {
  return new Promise((resolve) => {
    if (!client) return resolve(); // 只要有 client 就強制關閉
    
    try {
      client.unbind((err) => {
        if (err) console.error("LDAP 登出異常:", err.message);
        if (typeof client.destroy === 'function') client.destroy(); // 徹底釋放
        resolve();
      });
    } catch (e) {
      if (typeof client.destroy === 'function') client.destroy();
      resolve();
    }
  });
};

const searchfun = async () => {
  let client = null;
  try {
    client = await bindAsync(LDAP_DN, LDAP_PASSWORD);

    return await new Promise((resolve, reject) => {
      const results = [];
      const baseDN = `cn=users,${LDAP_BASE_DN}`;
      
      // 加上 paged 控制，每次跟伺服器拿 500 筆，避免被當成攻擊而卡死
      const options = { 
        scope: "sub", 
        attributes: [LDAP_USER_ATTR, 'displayName', 'cn'],
        paged: {
          pageSize: 500,
          pagePause: false
        }
      };

      // 設定 15 秒超時機制。時間到就強制交卷，不讓前端無窮盡轉圈
      const timeoutId = setTimeout(() => {
        console.log(`[LDAP 警告] 抓取超時，強制回傳目前收編的 ${results.length} 筆資料`);
        resolve(results); 
      }, 15000);

      client.search(baseDN, options, (err, res) => {
        if (err) {
          clearTimeout(timeoutId);
          return reject(err);
        }

        res.on("searchEntry", (entry) => {
          try {
            const obj = entry.pojo || entry.object || entry;
            if (!obj || !obj.attributes) return;

            const getAttr = (type) => {
              const attr = obj.attributes.find(a => a.type === type);
              return attr && attr.values && attr.values.length > 0 ? attr.values[0] : null;
            };

            const rawValue = getAttr(LDAP_USER_ATTR);
            if (!rawValue) return;

            let id = rawValue;
            let name = getAttr('displayName') || getAttr('cn') || "未命名";

            if (rawValue.includes("_")) {
              const parts = rawValue.split("_");
              id = parts[0];
              if (parts[1]) name = parts[1];
            }

            if (/^G[AB]?\d+$/i.test(id)) {
              results.push({ id: id.toUpperCase(), name });
            }
          } catch (e) {
            // 防呆：單筆解析失敗不影響大局
          }
        });

        res.on("error", (err) => {
          clearTimeout(timeoutId);
          console.error("LDAP 搜尋途中發生中斷:", err.message);
          resolve(results); // 不要報錯，把已經抓到的先回傳給前端
        });

        res.on("end", () => {
          clearTimeout(timeoutId);
          resolve(results);
        });
      });
    });
  } catch (error) {
    console.error("LDAP 搜尋作業失敗:", error.message);
    return [];
  } finally {
    await closeAsync(client);
  }
};

const searchUser = async (empId) => {
  let client = null;
  try {
    client = await bindAsync(LDAP_DN, LDAP_PASSWORD);

    return await new Promise((resolve, reject) => {
      const baseDN = `cn=users,${LDAP_BASE_DN}`;
      const options = { 
        scope: "sub", 
        filter: `(${LDAP_USER_ATTR}=${empId}*)`, 
        attributes: [LDAP_USER_ATTR, 'displayName', 'cn'] 
      };

      client.search(baseDN, options, (err, res) => {
        if (err) return reject(err);

        let foundName = null;

        res.on("searchEntry", (entry) => {
          const obj = entry.pojo || entry.object || entry;
          if (!obj || !obj.attributes) return;
          
          const getAttr = (type) => {
            const attr = obj.attributes.find(a => a.type === type);
            return attr && attr.values && attr.values.length > 0 ? attr.values[0] : null;
          };

          const rawValue = getAttr(LDAP_USER_ATTR);
          if (!rawValue) return;
          
          foundName = getAttr('displayName') || getAttr('cn') || "未命名";

          if (rawValue.includes("_")) {
            foundName = rawValue.split("_")[1] || foundName;
          }
        });

        res.on("error", reject);
        res.on("end", () => resolve(foundName));
      });
    });
  } catch (error) {
    console.error(`LDAP 查詢工號 ${empId} 失敗:`, error.message);
    return null;
  } finally {
    await closeAsync(client);
  }
};

module.exports = {
  searchfun,
  bindAsync,
  closeAsync,
  searchUser
};