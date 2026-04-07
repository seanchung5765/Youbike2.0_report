const express = require("express");
const router = express.Router();
const isauth = require("../service/isloginmiddleware");
const appError = require("../service/appError");
const { useGCPMysql } = require("../service/cloudSql");

//查看
// router.get("/test", async (req, res, next) => {
//   try {
//     // createGCPMysqlPool();
//     // console.log(11);
//     // const data = await useGCPMysql(
//     //   "SELECT DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') as date, sno, status FROM BigData_yb2_current WHERE date >= '2024-04-08' AND sno = '500206022';"
//     // );
//     // const data = await useGCPMysql(
//     //   "SELECT  * FROM BigData_yb2 WHERE date <= '2024-04-09' AND date >= '2024-04-08' AND sno = '500206022';"
//     // );

//     // closeGCPPool();

//     const arr = data.map((element) => ({
//       date: element.date,
//       sno: element.sno,
//       status: JSON.parse(element.status),
//     }));
//     res.status(200).json({ data: arr });
//   } catch (error) {
//     console.log(error);
//     return appError(400, "查看錯誤", next);
//   }
// });

function getNowDay() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
  return formattedDate;
}

//查看
router.get("/catch_4/:city/:status", async (req, res, next) => {
  try {
    const { city, status } = req.params;
    const nowday = getNowDay();
    const sql = `select  DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at, data from station_4_test_catch where updated_at >= '${nowday}'`;
    const ResData = await useGCPMysql(sql);
    const filterRes = ResData.map((items) => {
      const data = items.data
        .filter((item) => item.city === city && item.status == status)
        .map((col) => ({
          tie_bike: col.tie_bike,
          station_count: col.station_count,
        }));

      // console.log(data);
      return {
        updated_at: items.updated_at,
        0: data.filter((o) => o.tie_bike === 0)[0],
        1: data.filter((o) => o.tie_bike === 1)[0],
        2: data.filter((o) => o.tie_bike === 2)[0],
      };
    });
    const json = {
      city,
      status,
      data: filterRes,
    };
    res.status(200).json(json);
  } catch (error) {
    console.log(error);
    return appError(400, "查看錯誤", next);
  }
});

module.exports = router;
