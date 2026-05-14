const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const appError = require('../middleware/appError');
const { useGCPMysql } = require('../service/cloudSql'); // 引入 Cloud SQL 服務
const { bindAsync, closeAsync } = require('../service/ldapAuth');
const isAuth = require('../middleware/isAuth');

router.post("/login", async (req, res, next) => {
  const { account, password } = req.body;

  if (!account || !password) {
    return appError(403, "帳號密碼格式錯誤", next);
  }

  try {
    // 1. LDAP 驗證
    try {
      await bindAsync(account, password);
      await closeAsync();
    } catch (error) {
      return appError(403, `帳號密碼錯誤: ${error.message}`, next);
    }

    // 2. 從 Cloud SQL 取得使用者權限資料
    let userPayload = null;
    try {
      const superAdminEnv = process.env.SUPER_ADMIN_EMP_ID;
      let isSuperAdmin = false;
      let userId = null;
      let roleId = null;

      // 是否為 .env 指定的交接管理員 (免建檔直接放行)
      if (account === superAdminEnv) {
        isSuperAdmin = true;
      } else {
        // 查詢資料庫中的真實身分
        const userRows = await useGCPMysql(
          "SELECT id, role_id FROM users WHERE emp_id = ? AND is_active = 1",
          [account]
        );

        if (userRows.length === 0) {
          return appError(403, "此帳號尚未在報表系統中建立權限", next);
        }

        userId = userRows[0].id;
        roleId = userRows[0].role_id;

        // 如果資料庫設定的角色是 1，也視為超級管理員
        if (roleId === 1) {
          isSuperAdmin = true;
        }
      }

      // 超級管理員：賦予全站權限
      if (isSuperAdmin) {
        console.log(`[系統提示] 超級管理員 ${account} 登入，自動授予全站權限！`);
        
        // 直接抓取所有的城市
        const allCities = await useGCPMysql("SELECT id as city_id FROM regions");
        // 直接抓取所有的選單 (排除 route_code 是 NULL 的資料夾)
        const allPages = await useGCPMysql("SELECT id as page_id FROM system_menus WHERE route_code IS NOT NULL");
        
        userPayload = {
          ...allPages,
          city_cows: allCities
        };
      } 
      // 普通使用者：依據關聯表給予權限
      else {
        // 抓取被分配到的城市
        const city_cows = await useGCPMysql(
          "SELECT region_id as city_id FROM user_regions WHERE user_id = ?",
          [userId]
        );

        // 抓取被分配到的選單 (JOIN 排除 route_code 是 NULL 的資料夾)
        const queryPages = `
          SELECT DISTINCT rp.menu_id as page_id 
          FROM role_menu_permissions rp
          JOIN system_menus sm ON rp.menu_id = sm.id
          WHERE rp.role_id = ? AND sm.route_code IS NOT NULL
          ORDER BY rp.menu_id
        `;
        const pageRows = await useGCPMysql(queryPages, [roleId]);

        userPayload = {
          ...pageRows,
          city_cows: city_cows
        };
      }
    } catch (error) {
      console.error("Cloud SQL 讀取失敗:", error);
      return appError(403, "讀取權限資料錯誤", next);
    }

    // 3. 簽發 JWT
    const secretKey = process.env["JWT_KEY"];
    const token = jwt.sign({ ...userPayload, userId: account }, secretKey, {
      expiresIn: "8h",
    });

    // 🌟 4. 新增：記錄最後登入時間 
    try {
      // 使用 MySQL 內建的 NOW() 函數寫入當下時間
      await useGCPMysql(
        "UPDATE users SET last_login_at = NOW() WHERE emp_id = ?",
        [account]
      );
    } catch (dbErr) {
      // 若只是時間更新失敗，不影響使用者的正常登入，所以印出錯誤但不阻擋流程
      console.error(`更新 ${account} 登入時間失敗:`, dbErr);
    }

    // 🌟 5. 最後才統一回傳給前端 (把原本重複的那行刪掉了)
    res.status(200).json({ message: "成功登入", token });

  } catch (error) {
    console.error("登入流程異常:", error);
    return appError(500, "系統錯誤", next);
  }
});

// 取得動態左側選單 API
router.get('/menus', isAuth, async (req, res) => {
  try {
    const empId = req.user.userId; 
    const superAdminEnv = process.env.SUPER_ADMIN_EMP_ID;
    
    let query = "";
    let params = [];

    // 1. 檢查登入者的角色
    const userRows = await useGCPMysql("SELECT role_id FROM users WHERE emp_id = ? AND is_active = 1", [empId]);
    const roleId = userRows.length > 0 ? userRows[0].role_id : null;

    if (empId === superAdminEnv || roleId === 1) {
      // 【超級管理員】直接撈出全站「所有」選單
      query = `
        SELECT id, parent_id, name, route_code, icon_code, sort_order 
        FROM system_menus 
        ORDER BY parent_id ASC, sort_order ASC
      `;
      params = [];
    } else {
      // 【一般模式】過濾他有權限的子頁面，以及對應的父資料夾
      query = `
        SELECT id, parent_id, name, route_code, icon_code, sort_order 
        FROM system_menus 
        WHERE id IN (
          -- 1. 直接有權限的頁面
          SELECT menu_id FROM role_menu_permissions WHERE role_id = ?
        ) OR id IN (
          -- 2. 這些頁面的父目錄 (避免選單斷層)
          SELECT parent_id FROM system_menus WHERE id IN (
            SELECT menu_id FROM role_menu_permissions WHERE role_id = ?
          )
        )
        ORDER BY parent_id ASC, sort_order ASC
      `;
      params = [roleId, roleId];
    }

    const rows = await useGCPMysql(query, params);

    // 2. 將扁平資料轉換為 Vue 要的樹狀結構 (Tree)
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