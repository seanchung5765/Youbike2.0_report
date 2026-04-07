var express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const appError = require("../service/appError");
const isauth = require("../service/isloginmiddleware");
const { json } = require("express");
const { idToken } = require("../service/GetgoogleIDtoken");
const { bindAsync, closeAsync } = require("../service/ldapcon");
var router = express.Router();

/* GET home page. */
router.post("/login", async (req, res, next) => {
  let user = null;
  let citys = null;
  const { account, password } = req.body;
  console.log('🔥 /isauth/login 被呼叫2');
  try {
    if (!account || !password) {
      return appError(403, "帳號密碼格式錯誤", next);
    }
    try {
      await bindAsync(account, password);
      await closeAsync();
    } catch (error) {
      return appError(403, `帳號密碼錯誤:` + error, next);
    }
    //把他做成jwt
    let user = null;
    try {
      const gcpurl = process.env["GCP_USER_URL"];
      const url = `${gcpurl}/logindata/${account}`;
      const gcpdata = await axios.get(url);
      user = gcpdata.data.user;
    } catch (error) {
      return appError(403, "取得GCP資料錯誤", next);
    }

    const secretKey = process.env["JWT_KEY"];
    const token = jwt.sign({ ...user, userId: account }, secretKey, {
      expiresIn: "8h",
    });
    res.status(200).json({
      message: "成功登入",
      token,
    });
  } catch (error) {
    return appError(500, "資料庫錯誤", next);
  }
});

// 取得 Tableau Token
router.post("/tableau", async (req, res, next) => {
  try {
    // console.log('tableau token generator 被呼叫');
    const email = req.body.email;
    // const email = "jackalruan@youbike.com.tw";
    const payload = {
      iss: process.env.TABLEAU_CLIENT_ID,
      sub: email,
      aud: 'tableau',
      exp: Math.floor(Date.now() / 1000) + 300, // 5分鐘有效
      jti: Math.random().toString(36).substring(2),
      scp: ['tableau:views:embed']
    };

    const header = {
      alg: 'HS256',
      typ: 'JWT',
      kid: process.env.TABLEAU_SECRET_ID, // Secret ID
      clientId: process.env.TABLEAU_CLIENT_ID // Client ID
    };

    const token = jwt.sign(payload, process.env.TABLEAU_SECRET, { algorithm: 'HS256', header  });
    res.status(200).json({ message: "成功", token });
  } 
  catch (ex) {
    return appError(500, "Tableau Generate Token Failed", next);
  }
});

//取得gcp 報表資料
router.get("/gcpfun", isauth, async (req, res, next) => {
  try {
    const payload = req.query;
    const url = process.env.GCP_URL;
    const gcptoken = await idToken();
    const gcpres = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    const data = gcpres.data;
    res.status(200).json({ message: "成功", data });
  } catch (error) {
    return appError(500, "gcp取得資料失敗", next);
  }
});

//取得所有GCP會員資料
router.get("/userrole", isauth, async (req, res, next) => {
  try {
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/userrole`;
    const gcpdata = await axios.get(url);
    const rows = gcpdata.data.data;
    res.status(200).json({ message: "取得會員角色資料", rows });
  } catch (error) {
    return appError(500, "查看失敗", next);
  }
});

//更新gcp角色權限isauth
router.patch("/role/:id", isauth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const { role } = req.body;
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/role/${id}`;
    const payload = {
      role,
    };
    await axios.patch(url, payload);
    res.status(200).json({ message: "更新成功" });
  } catch (error) {
    return appError(400, "更新失敗", next);
  }
});

//覆蓋GCP單一角色權限
router.put("/role/:roleid", isauth, async (req, res, next) => {
  try {
    const id = req.params.roleid;
    const payload = req.body;
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/role/${id}`;
    await axios.put(url, payload);
    res.status(200).json({ message: "更新成功" });
  } catch (error) {
    return appError(400, "更新失敗", next);
  }
});

// 查看GCP角色表
router.get("/roles", isauth, async (req, res, next) => {
  try {
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/roles`;
    const gcpdata = await axios.get(url);
    const rows = gcpdata.data.data;
    res.status(200).json({ message: "查看角色表成功", rows });
  } catch (error) {
    return appError(400, "查看角色失敗", next);
  }
});

//查看gcp所有報表資料
router.get("/pages", isauth, async (req, res, next) => {
  try {
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/pages`;
    const gcpdata = await axios.get(url);
    const rows = gcpdata.data.data;
    res.status(200).json({ message: "查看成功", rows });
  } catch (error) {
    return appError(400, "查看失敗", next);
  }
});

//查看GCP單一使用者資料
router.get("/role/:id", isauth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/role/${id}`;
    const gcpdata = await axios.get(url);
    const rows = gcpdata.data.data;
    res.status(200).json({ message: "查看單一角色表成功", rows });
  } catch (error) {
    return appError(400, "查看失敗", next);
  }
});

//查看GCP上單一角色權限資料
router.get("/role_pages/:id", isauth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/role_pages/${id}`;
    const gcpdata = await axios.get(url);
    const rows = gcpdata.data.data;
    res.status(200).json({ message: "查看成功", rows });
  } catch (error) {
    return appError(400, "查看失敗", next);
  }
});

//新增gcp角色
router.post("/role", isauth, async (req, res, next) => {
  try {
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/role`;
    await axios.post(url, req.body);
    res.status(200).json({ message: "成功" });
  } catch (error) {
    return appError(400, "新增角色失敗", next);
  }
});

//刪除gcp角色
router.delete("/role/:id", isauth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/role/${id}`;
    await axios.delete(url);
    res.status(200).json({ mseeage: "刪除成功" });
  } catch (error) {
    appError(400, "刪除失敗", next);
  }
});

//查看gcp所有城市
router.get("/citys", isauth, async (req, res, next) => {
  try {
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/citys`;
    const gcpdata = await axios.get(url);
    const rows = gcpdata.data.data;
    res.status(200).json({ message: "查看成功", rows });
  } catch (error) {
    return appError(400, "查看失敗", next);
  }
});

//查看gcp單一角色城市權限
router.get("/usercity/:id", isauth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/usercity/${id}`;
    const gcpdata = await axios.get(url);
    const rows = gcpdata.data.data;
    res.status(200).json({ message: "查看成功", rows });
  } catch (error) {
    return appError(400, "查看角色權限總表失敗", next);
  }
});

//覆蓋gcp單一角色權限
router.put("/role_citys/:roleid", isauth, async (req, res, next) => {
  try {
    const id = req.params.roleid;
    const payload = req.body;
    const gcpurl = process.env["GCP_USER_URL"];
    const url = `${gcpurl}/role_citys/${id}`;
    await axios.put(url, payload);
    res.status(200).json({ message: "修改成功" });
  } catch (error) {
    return appError(400, "更新失敗", next);
  }
});

module.exports = router;
