require("dotenv").config({ path: "../.env" });
const nodemailer = require("nodemailer");
const axios = require("axios");
const schedule = require("node-schedule");
const {
  createGCPMysqlPool,
  useGCPMysql,
  closeGCPPool,
} = require("../service/cloudSql");
const { idToken } = require("../service/GetgoogleIDtoken");

//寄信
async function sendMail(to, subject, text) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    // console.log("寄送成功");
  } catch (error) {
    console.log("寄送失敗", error);
  }
}

//抓場站人員
async function getUserData() {
  try {
    createGCPMysqlPool();
    const userData = await useGCPMysql("select * from mail_content");
    const editdata = editUserData(userData);
    return editdata;
  } catch (error) {
    console.log(error);
  } finally {
    closeGCPPool();
  }
}

//整理收件人資料
function editUserData(userdata) {
  const groupedData = {};

  userdata.forEach((element) => {
    const city = element["city_name"];
    const type = element["type_name"];
    const time = element["time"];
    const email = element["mail"];

    if (!groupedData[type]) {
      groupedData[type] = {};
    }

    if (!groupedData[type][city]) {
      groupedData[type][city] = [];
    }

    let found = false;

    groupedData[type][city].forEach((item) => {
      if (item.time === time) {
        item.email.push(email);
        found = true;
      }
    });

    if (!found) {
      groupedData[type][city].push({
        time,
        email: [email],
      });
    }
  });

  return groupedData;
}

//抓場站資料 status放哪一個狀態,column放異常秒數
async function get_Bike_Status(token, status, column) {
  try {
    const url = process.env.GCP_URL;
    const params = {
      dataset_id: "yb2",
      table_id: "bike_status_email",
      status,
    };
    const headers = {
      headers: { Authorization: `bearer ${token}` },
    };
    const gcpres = await axios.post(url, params, headers);
    console.log(gcpres);
    const editdata = editBike_StatusData(gcpres.data, column);
    return editdata;
  } catch (error) {
    console.log(error.message);
  }
}

//整理場站資料 statusdata放欄位,type放異常秒數
function editBike_StatusData(statusdata, type) {
  // console.log(statusdata, type);
  const categorizedData = {};

  statusdata.forEach((element) => {
    const { city, asset_no, [type]: cumulativeTime } = element;

    if (!categorizedData[city]) {
      categorizedData[city] = [];
    }

    categorizedData[city].push({ asset_no: asset_no, [type]: cumulativeTime });
  });

  return categorizedData;
}

//取得某個城市大於某個秒數的車號
function get_Final_Sno(data, city, sec, column, datetype, status) {
  let delay = null;
  if (datetype === "秒") {
    delay = 1;
  } else if (datetype === "分") {
    delay = 60;
  } else if (datetype === "小時") {
    delay = 60 * 60;
  } else if (datetype === "天") {
    delay = 60 * 60 * 24;
  }

  //回傳車號字串
  let str = "";
  //總共幾台車
  let counts = 0;

  const time = sec;

  // console.log(data);
  // console.log(city[""]);

  if (data && data.hasOwnProperty(city)) {
    let index = 0;
    data[city].forEach((item) => {
      if (item[column] / delay >= time) {
        index++;
        counts++;
        str += `${item.asset_no}, `;
        if (index % 10 === 0 && index !== 0) {
          str += "\n";
        }
      }
    });

    str += "\n\n此封信為系統自動發送";
  }

  return {
    city,
    status,
    city,
    datetype,
    time,
    counts,
    str,
  };
}

async function sendEmail(token, userData, status, statusENG, datetype, column) {
  const arr = [];

  const Status_Res = await get_Bike_Status(token, statusENG, column);
  const promises = [];
  for (city in userData[status]) {
    if (userData[status].hasOwnProperty(city)) {
      for (const item of userData[status][city]) {
        const res = get_Final_Sno(
          Status_Res,
          city,
          item.time,
          column,
          datetype,
          status
        );

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: item.email,
          subject: `異常通知 ${res.city} ${res.status} ${res.time}${res.datetype}以上(包含)`,
          text: `異常總數:${res.counts}\n車號:\n${res.str}`,
        };
        arr.push(mailOptions);
      }
    }
  }
  // 批量并行发送邮件
  arr.forEach((mailOptions) => {
    promises.push(
      sendMail(mailOptions.to, mailOptions.subject, mailOptions.text)
    );
  });

  try {
    await Promise.all(promises);
  } catch (error) {
    console.log(error);
  }
}

let token = null;
//低電量
async function SendMailTatol() {
  const userData = await getUserData();

  const rule = new schedule.RecurrenceRule();
  rule.minute = [0, 15, 30, 45, 53]; // 每個0分30分執行
  schedule.scheduleJob(rule, async () => {
    token = await idToken();
    //斷線狀態
    await sendEmail(
      token,
      userData,
      "斷線狀態",
      "loss_time",
      "分",
      "cumulative_time_lt"
    );

    //低電量
    await sendEmail(
      token,
      userData,
      "低電量狀態",
      "low_battery",
      "分",
      "cumulative_time_lb"
    );
  });

  //每天早上九點
  const rule2 = new schedule.RecurrenceRule();
  rule2.hour = 9;
  rule2.minute = 0;
  rule2.second = 0;
  schedule.scheduleJob(rule2, async () => {
    //未保養
    await sendEmail(
      token,
      userData,
      "未保養狀態",
      "not_maintained",
      "天",
      "cumulative_time_nm"
    );
  });

  //低電量 ,斷線狀態 每小時的0分30分發一次
  //未保養每天9點
}

// SendMailTatol();
// module.exports = { SendMailTatol };
