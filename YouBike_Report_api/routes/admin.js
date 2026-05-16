const express = require('express');
const router = express.Router();
// 🌟 改用 Cloud SQL 連線工具
const { useGCPMysql } = require('../service/cloudSql'); 
const isAuth = require('../middleware/isAuth');
const { searchUser, searchfun } = require('../service/ldapAuth');

// 1. GET /users - 取得所有使用者
router.get('/users', isAuth, async (req, res, next) => {
  try {
    const rows = await useGCPMysql(`SELECT * FROM users`);
    res.status(200).json({ message: true, cows: rows });
  } catch (error) { next(error); }
});

// 2. POST /users - 新增使用者
router.post('/users', isAuth, async (req, res, next) => {
  try {
    const { users_id, name, role_id } = req.body;
    const query = `INSERT INTO users (emp_id, name, role_id, is_active) VALUES (?, ?, ?, 1)`;
    await useGCPMysql(query, [users_id, name, role_id]);
    res.status(200).json({ message: true });
  } catch (error) { next(error); }
});

// 3. DELETE /users/:id
router.delete('/users/:id', isAuth, async (req, res, next) => {
  try {
    const id = req.params.id; // 這邊的 id 是工號

    // 1. 先找出這個人在資料庫裡的內部 PK (id)
    const users = await useGCPMysql("SELECT id FROM users WHERE emp_id = ?", [id]);
    
    if (users.length > 0) {
      const user_internal_id = users[0].id;
      // 2. 拔除他在 user_regions 裡面的所有城市權限 (避免外鍵約束報錯)
      await useGCPMysql(`DELETE FROM user_regions WHERE user_id = ?`, [user_internal_id]);
    }

    // 3. 最後安心地把這個人從 users 表中徹底刪除
    await useGCPMysql(`DELETE FROM users WHERE emp_id = ?`, [id]);
    
    res.status(200).json({ message: true });
  } catch (error) { 
    console.error(`刪除使用者 ${req.params.id} 失敗:`, error);
    next(error); 
  }
});

// 5. GET /roles - 取得所有角色
router.get('/roles', isAuth, async (req, res, next) => {
  try {
    // 對齊前端，將 name 轉為 role_name
    const rows = await useGCPMysql(`SELECT id as role_id, name as role_name FROM roles`);
    res.status(200).json({ message: true, data: rows });
  } catch (error) { next(error); }
});

// 6. GET /role/:id - 取得單一帳號詳細角色資訊
router.get('/role/:id', isAuth, async (req, res, next) => {
  try {
    const id = req.params.id; // 工號
    
    // 1. 去 LDAP 找他的名字
    const ldapName = await searchUser(id);
    if (!ldapName) return res.status(404).json({ message: "LDAP 查無此工號" });

    // 2. 去 DB 看他有沒有被設定過角色
    const query = `
      SELECT r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.emp_id = ?
    `;
    const dbRows = await useGCPMysql(query, [id]);

    res.status(200).json({ 
      message: true, 
      data: [{
        users_id: id,
        name: ldapName,
        role_name: dbRows.length > 0 ? dbRows[0].role_name : "尚未設定角色"
      }] 
    });
  } catch (error) { 
    console.error("GET /role/:id 失敗:", error);
    res.status(500).json({ message: false, error: error.message });
  }
});

// 7. PATCH /role/:id - 修改使用者角色
router.patch('/role/:id', isAuth, async (req, res, next) => {
  try {
    const id = req.params.id; 
    const { role } = req.body; 
    
    // 自動去 LDAP 抓取正確姓名
    const ldapName = await searchUser(id);
    if (!ldapName) return res.status(404).json({ message: "LDAP 查無此工號" });

    const operatorId = (req.user && req.user.userId) ? req.user.userId : 'System';
    const safeRole = role !== undefined ? role : null;

    const query = `
      INSERT INTO users (
        emp_id, name, role_id, is_active, created_by, 
        role_updated_by, role_updated_at, 
        updated_by, updated_at
      ) 
      VALUES (?, ?, ?, 1, ?, ?, NOW(), ?, NOW())
      ON DUPLICATE KEY UPDATE 
        name = ?,
        role_id = ?, 
        is_active = 1, 
        role_updated_by = ?, 
        role_updated_at = NOW(),
        updated_by = ?,        -- 🚀 紀錄這筆帳號最後是被誰動的 (不論動什麼)
        updated_at = NOW()
    `;

    const params = [
      id, ldapName, safeRole, operatorId, operatorId, operatorId, // INSERT
      ldapName, safeRole, operatorId, operatorId                  // UPDATE
    ];

    await useGCPMysql(query, params);
    res.status(200).json({ message: true });

  } catch (error) { 
    console.error("PATCH /role/:id 失敗:", error);
    res.status(500).json({ message: false, error: error.message });
  }
});

// 8. GET /userrole - 取得所有使用者與角色列表 (用於管理頁面)
router.get('/userrole', isAuth, async (req, res, next) => {
  try {
    // 1. 只對 LDAP 發起「一次」連線，撈取全公司名單
    const ldapUsers = await searchfun();

    // 2. 從 Cloud SQL 撈出目前有設定角色的員工
    const dbRoles = await useGCPMysql(`
      SELECT u.emp_id, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id
    `);

    // 建立索引，加快比對速度
    const roleMap = new Map();
    dbRoles.forEach(item => {
      if(item.emp_id) roleMap.set(item.emp_id, item.role_name);
    });

    // 3. 將 LDAP 全員名單貼上資料庫的權限標籤
    const finalData = ldapUsers.map(user => ({
      users_id: user.id,   
      name: user.name,     
      role_name: roleMap.get(user.id) || " "
    }));
    
    // 印出總筆數確認
    console.log("最終準備傳送的資料筆數:", finalData.length);

    res.status(200).json({ message: true, data: finalData });
  } catch (error) {
    console.error("GET /userrole LDAP 抓取失敗:", error);
    res.status(500).json({ message: false, error: error.message });
  }
});

// 9. GET /role_pages/:id - 取得特定角色擁有的頁面 ID
router.get('/role_pages/:id', isAuth, async (req, res, next) => {
  try {
    const id = req.params.id; 
    const query = `SELECT menu_id as page_id FROM role_menu_permissions WHERE role_id = ? ORDER BY menu_id`;
    const rows = await useGCPMysql(query, [id]);
    res.status(200).json({ message: true, data: rows });
  } catch (error) { next(error); }
});

// 10. GET /pages - 取得所有系統選單頁面
router.get('/pages', isAuth, async (req, res, next) => {
  try {
    const query = `
      SELECT 
        c.id as page_id, 
        c.name as page_name, 
        p.name as category_name 
      FROM system_menus c
      LEFT JOIN system_menus p ON c.parent_id = p.id
      WHERE c.route_code IS NOT NULL 
        AND c.route_code != '' 
        AND c.parent_id IS NOT NULL 
        AND c.parent_id != 0 
        AND c.route_code NOT LIKE 'folder_%'
        AND c.is_active = 1 
      ORDER BY c.parent_id, c.id
    `;
    const rows = await useGCPMysql(query);
    res.status(200).json({ message: true, data: rows });
  } catch (error) { 
    next(error); 
  }
});

// 11. PUT /role/:roleid - 更新角色擁有的選單權限 (並記錄修改時間)
router.put('/role/:roleid', isAuth, async (req, res, next) => {
  try {
    const role_id = req.params.roleid;
    const payload = req.body; // [{page_id: 102}, ...]
    
    // 🌟 1. 取得當前操作者的工號 (從 JWT 解析出來的)
    const operatorId = (req.user && req.user.userId) ? req.user.userId : 'System';

    // 🌟 2. 更新 roles 表的修改時間與修改人
    // 使用 MySQL 內建的 NOW() 取得當下時間
    await useGCPMysql(
      `UPDATE roles SET updated_at = NOW(), updated_by = ? WHERE id = ?`,
      [operatorId, role_id]
    );

    // 3. 處理權限關聯表 (原本的先刪後增邏輯)
    await useGCPMysql(`DELETE FROM role_menu_permissions WHERE role_id = ?`, [role_id]);
    
    if (payload && payload.length > 0) {
      const values = payload.map(item => [role_id, item.page_id]);
      for (let val of values) {
        await useGCPMysql(`INSERT INTO role_menu_permissions (role_id, menu_id) VALUES (?, ?)`, val);
      }
    }

    res.status(200).json({ message: "修改成功並已紀錄時間" });
  } catch (error) { 
    console.error("更新角色權限失敗:", error);
    next(error); 
  }
});

// 12. DELETE /role/:id - 刪除角色與其權限
router.delete('/role/:id', isAuth, async (req, res, next) => {
  try {
    const id = req.params.id; 

    // 1. 先處理「使用者表」：把原本屬於這個角色的人，角色欄位清空 (設為 NULL)
    // 這樣就不會違反外鍵約束了
    await useGCPMysql(`UPDATE users SET role_id = NULL WHERE role_id = ?`, [id]);

    // 2. 刪除該角色的選單權限關聯
    await useGCPMysql(`DELETE FROM role_menu_permissions WHERE role_id = ?`, [id]);

    // 3. 最後才刪除角色本身
    await useGCPMysql(`DELETE FROM roles WHERE id = ?`, [id]);
    
    res.status(200).json({ message: "角色已成功刪除，相關使用者權限已重置" });
  } catch (error) { 
    console.error("刪除角色失敗:", error);
    next(error); 
  }
});

// 13. POST /role - 新增角色與其權限
router.post('/role', isAuth, async (req, res, next) => {
  try {
    const { name, payload } = req.body;
    const operatorId = (req.user && req.user.userId) ? req.user.userId : 'System';

    // 新增時寫入誰建立的
    const result = await useGCPMysql(
      `INSERT INTO roles (name, created_by, updated_by) VALUES (?, ?, ?)`, 
      [name, operatorId, operatorId]
    );
    
    const newRoleId = result.insertId; 
    
    if (payload && payload.length > 0) {
      const values = payload.map(item => [newRoleId, item.page_id]);
      for (let val of values) {
        await useGCPMysql(`INSERT INTO role_menu_permissions (role_id, menu_id) VALUES (?, ?)`, val);
      }
    }
    res.status(200).json({ message: true });
  } catch (error) { 
    next(error); 
  }
});
// 14. GET /usercity/:id - 取得使用者可看的城市
router.get('/usercity/:id', isAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT ur.region_id as city_id 
      FROM user_regions ur
      JOIN users u ON ur.user_id = u.id
      WHERE u.emp_id = ?`;
    const rows = await useGCPMysql(query, [id]);
    res.status(200).json({ message: true, data: rows });
  } catch (error) { next(error); }
});

// 15. GET /citys - 取得所有地區
router.get('/citys', isAuth, async (req, res, next) => {
  try {
    // 🌟 這裡加上 codes 欄位
    const query = `SELECT id as city_id, name as city_name, codes, status FROM regions ORDER BY id`;
    const rows = await useGCPMysql(query);
    res.status(200).json({ message: true, data: rows });
  } catch (error) { next(error); }
});

// 16. PUT /role_citys/:empid - 更新使用者擁有的城市權限
router.put('/role_citys/:empid', isAuth, async (req, res, next) => {
  try {
    const emp_id = req.params.empid; 
    const payload = req.body; 
    
    const ldapName = await searchUser(emp_id);
    const finalName = ldapName || emp_id;

    const operatorId = (req.user && req.user.userId) ? req.user.userId : 'System';

    // 🚀 同時更新 region 專屬欄位與通用 updated 欄位
    await useGCPMysql(
      `INSERT INTO users (
         emp_id, name, is_active, created_by, 
         region_updated_by, region_updated_at, 
         updated_by, updated_at
       ) 
       VALUES (?, ?, 1, ?, ?, NOW(), ?, NOW()) 
       ON DUPLICATE KEY UPDATE 
         name = ?,
         is_active = 1, 
         region_updated_by = ?, 
         region_updated_at = NOW(),
         updated_by = ?,      -- 🚀 紀錄這筆帳號最後是被誰動的
         updated_at = NOW()`,
      [
        emp_id, finalName, operatorId, operatorId, operatorId, // INSERT
        finalName, operatorId, operatorId                      // UPDATE
      ] 
    );

    const users = await useGCPMysql("SELECT id FROM users WHERE emp_id = ?", [emp_id]);
    const user_internal_id = users[0].id;

    await useGCPMysql(`DELETE FROM user_regions WHERE user_id = ?`, [user_internal_id]);
    
    if (payload && payload.length > 0) {
      for (let item of payload) {
        await useGCPMysql(`INSERT INTO user_regions (user_id, region_id) VALUES (?, ?)`, [user_internal_id, item.city_id]);
      }
    }
    
    res.status(200).json({ message: "地區權限更新成功，已同步更新稽核紀錄" });
  } catch (error) { 
    console.error("更新地區權限失敗:", error);
    next(error); 
  }
});

// 17. GET /usercity_all - 🌟 新增：取得所有使用者的地區權限清單
router.get('/usercity_all', isAuth, async (req, res, next) => {
  try {
    const query = `
      SELECT u.emp_id as users_id, ur.region_id as city_id
      FROM user_regions ur
      JOIN users u ON ur.user_id = u.id
    `;
    const rows = await useGCPMysql(query);
    res.status(200).json({ message: true, data: rows });
  } catch (error) { next(error); }
});

// 18. GET /report_groups - 取得報表群組 (供統整表系統別下拉選單使用)
router.get('/report_groups', isAuth, async (req, res, next) => {
  try {
    const query = `SELECT id, name, status FROM report_groups ORDER BY id`;
    const rows = await useGCPMysql(query);
    res.status(200).json({ message: true, data: rows });
  } catch (error) { 
    console.error("GET /report_groups 失敗:", error);
    next(error); 
  }
});



module.exports = router;