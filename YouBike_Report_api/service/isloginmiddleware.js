require("dotenv").config({ path: "../.env" });
const secretKey = process.env["JWT_KEY"];
const jwt = require("jsonwebtoken");
const appError = require("../service/appError");
const isauth = async (req, res, next) => {
  const token = req.headers.authorization;
  // console.log(token);
  if (!token) {
    return appError(401, "token不存在", next);
  }
  try {
    const secretKey = process.env["JWT_KEY"];
    const decoded = await new Promise((resolve, _reject) => {
      jwt.verify(token.split(" ")[1], secretKey, (err, payload) => {
        if (err) {
          return appError(403, "驗證失敗", next);
        } else {
          resolve(payload);
        }
      });
    });
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isauth;

const obj = {
  id: "1111", //pk
  phone: "091111111",
  date: `2024-06-18 HH:mm:ss`,
  message: "這是訊息...",
  status: true, //成功失敗
  yB_id: "GB3192",
};
