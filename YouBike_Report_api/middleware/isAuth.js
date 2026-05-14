const jwt = require("jsonwebtoken");
const appError = require("./appError");

const isAuth = async (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token || !token.startsWith('Bearer ')) {
    return appError(401, "尚未登入或 Token 格式錯誤", next);
  }

  try {
    const secretKey = process.env["JWT_KEY"];
    const tokenString = token.split(" ")[1];
    
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(tokenString, secretKey, (err, payload) => {
        if (err) return reject(err);
        resolve(payload);
      });
    });
    
    // 將解析出的使用者資訊放入 req 中供後續使用
    req.user = decoded; 
    next();
  } catch (error) {
    return appError(403, "登入驗證失效，請重新登入", next);
  }
};

module.exports = isAuth;