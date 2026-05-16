const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const appError = require('../middleware/appError');
const { useGCPMysql } = require('../service/cloudSql'); // 引入 Cloud SQL 服務
const { bindAsync, closeAsync } = require('../service/ldapAuth');
const isAuth = require('../middleware/isAuth');

router.post("/login", async (req, res, next) => {
  const { account, password } = req.body;

  // 1. 修正：更直覺的防呆提示
  if (!account || !password) {
    return appError(400, "帳號與密碼不能為空", next);
  }

  try {
    // 1. LDAP 驗證
    try {
      await bindAsync(account, password);
      await closeAsync();
    } catch (error) {
      // 2. 修正：避免伺服器斷線時誤導使用者
      return appError(401, `登入失敗，請確認帳密是否正確 (${error.message})`, next);
    }

    // 2. 從 Cloud SQL 取得使用者權限資料
    let userPayload = null;
    try {
      const superAdminEnv = process.env.SUPER_ADMIN_EMP_ID;
      let isSuperAdmin = false;
      let userId = null;
      let roleId = null;

      if (account === superAdminEnv) {
        isSuperAdmin = true;
      } else {
        const userRows = await useGCPMysql(
          "SELECT id, role_id FROM users WHERE emp_id = ? AND is_active = 1",
          [account]
        );

        if (userRows.length === 0) {
          // 這個提示很正常，代表員工在職但尚未被開通報表系統權限
          return appError(403, "此帳號尚未在報表系統中開通權限，請聯繫管理員", next);
        }

        userId = userRows[0].id;
        roleId = userRows[0].role_id;
        if (roleId === 1) isSuperAdmin = true;
      }

      // 3. 修正 💣 炸彈：將權限資料用明確的 key (pages) 包裝，而不是展開陣列
      if (isSuperAdmin) {
        console.log(`[系統提示] 超級管理員 ${account} 登入，自動授予全站權限！`);
        const allCities = await useGCPMysql("SELECT id as city_id FROM regions");
        const allPages = await useGCPMysql("SELECT id as page_id FROM system_menus WHERE route_code IS NOT NULL");
        
        userPayload = {
          pages: allPages,       // ✅ 正確寫法
          city_cows: allCities   // ✅ 正確寫法
        };
      } else {
        const city_cows = await useGCPMysql(
          "SELECT region_id as city_id FROM user_regions WHERE user_id = ?",
          [userId]
        );
        const queryPages = `
          SELECT DISTINCT rp.menu_id as page_id 
          FROM role_menu_permissions rp
          JOIN system_menus sm ON rp.menu_id = sm.id
          WHERE rp.role_id = ? AND sm.route_code IS NOT NULL
          ORDER BY rp.menu_id
        `;
        const pageRows = await useGCPMysql(queryPages, [roleId]);

        userPayload = {
          pages: pageRows,       // ✅ 正確寫法
          city_cows: city_cows   // ✅ 正確寫法
        };
      }
    } catch (error) {
      console.error("Cloud SQL 讀取失敗:", error);
      // 4. 修正：資料庫出錯應該是 500 伺服器錯誤
      return appError(500, "資料庫讀取權限發生異常，請稍後再試", next);
    }

    // 3. 簽發 JWT
    const secretKey = process.env["JWT_KEY"];
    const token = jwt.sign({ ...userPayload, userId: account }, secretKey, {
      expiresIn: "8h",
    });

    // 4. 記錄最後登入時間
    try {
      await useGCPMysql(
        "UPDATE users SET last_login_at = NOW() WHERE emp_id = ?",
        [account]
      );
    } catch (dbErr) {
      console.error(`更新 ${account} 登入時間失敗:`, dbErr);
    }

    res.status(200).json({ message: "成功登入", token });

  } catch (error) {
    console.error("登入流程異常:", error);
    return appError(500, "系統發生未知的錯誤", next);
  }
});

// 取得動態左側選單 API
router.get('/menus', isAuth, async (req, res) => {
  try {
    const empId = req.user.userId; 
    const superAdminEnv = process.env.SUPER_ADMIN_EMP_ID;
    
    let query = "";
    let params = [];

    const userRows = await useGCPMysql("SELECT role_id FROM users WHERE emp_id = ? AND is_active = 1", [empId]);
    const roleId = userRows.length > 0 ? userRows[0].role_id : null;

    if (empId === superAdminEnv || roleId === 1) {
      // 【超級管理員】
      query = `
        SELECT id, parent_id, name, route_code, icon_code, sort_order 
        FROM system_menus 
        WHERE is_active = 1  -- 🚀 新增：超級管理員也只看啟用的選單
        ORDER BY parent_id ASC, sort_order ASC
      `;
      params = [];
    } else {
      // 【一般模式】
      query = `
        SELECT id, parent_id, name, route_code, icon_code, sort_order 
        FROM system_menus 
        WHERE is_active = 1  -- 🚀 新增：先過濾出啟用的選單，再去比對權限
          AND (
            id IN (
              SELECT menu_id FROM role_menu_permissions WHERE role_id = ?
            ) OR id IN (
              SELECT parent_id FROM system_menus WHERE id IN (
                SELECT menu_id FROM role_menu_permissions WHERE role_id = ?
              )
            ) OR id IN (
              SELECT parent_id FROM system_menus WHERE id IN (
                SELECT parent_id FROM system_menus WHERE id IN (
                  SELECT menu_id FROM role_menu_permissions WHERE role_id = ?
                )
              )
            )
          )
        ORDER BY parent_id ASC, sort_order ASC
      `;
      params = [roleId, roleId, roleId];
    }

    // ... 下方將扁平資料轉 Tree 的邏輯保持不變 ...

    const rows = await useGCPMysql(query, params);

    // 將扁平資料轉換為 Vue 樹狀結構
    const menuMap = {};
    const tree = [];
    
    rows.forEach(menu => {
      menuMap[menu.id] = { ...menu, children: [] };
    });

    rows.forEach(menu => {
      if (menu.parent_id && menuMap[menu.parent_id]) {
        menuMap[menu.parent_id].children.push(menuMap[menu.id]);
      } else {
        tree.push(menuMap[menu.id]);
      }
    });

    res.json({ success: true, data: tree });
  } catch (error) {
    console.error("取得選單失敗:", error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

module.exports = router;