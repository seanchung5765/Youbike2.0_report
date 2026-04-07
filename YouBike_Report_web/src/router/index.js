import { createRouter, createWebHistory } from "vue-router";
import FrontPage from "../views/FrontPage.vue";
import jwt_decode from "jwt-decode";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "FrontPage",
      component: FrontPage,
      meta: { title: "首頁", isValidation: false, islogin: true },
    },
    {
      path: "/login",
      name: "LoginPage",
      component: () => import("../views/LoginView.vue"),
      meta: { title: "登入", isValidation: false, islogin: false },
    },
    // {
    //   path: "/YouBike_portal",
    //   name: "YouBike_portal",
    //   component: () => import("../views/YouBike_portal.vue"),
    //   meta: { title: "YouBike入口網站", isValidation: false, islogin: true },
    // },
    {
      path: "/ServiceReport",
      name: "ServiceReport",
      children: [
        {
          path: "OperationDaily",
          name: "OperationDaily",
          component: () => import("../views/report/OperationDaily.vue"),
          meta: {
            title: "營運管理日報",
            id: 1,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "OperationWeekDaily",
          name: "OperationWeekDaily",
          component: () => import("../views/report/OperationWeekDaily.vue"),
          meta: {
            title: "營運管理週報",
            id: 2,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "OperationMonthDaily",
          name: "OperationMonthDaily",
          component: () => import("../views/report/OperationMonthDaily.vue"),
          meta: {
            title: "營運管理月報",
            id: 3,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "OperateReport",
          name: "OperateReport",
          component: () => import("../views/report/OperateReport.vue"),
          meta: { title: "營運日報", id: 5, isValidation: true, islogin: true },
        },
        {
          path: "OperateMonthReport",
          name: "OperateMonthReport",
          component: () => import("../views/report/OperateMonthReport.vue"),
          meta: { title: "累積業績", id: 6, isValidation: true, islogin: true },
        },
        {
          path: "SchedulingReport",
          name: "SchedulingReport",
          component: () => import("../views/report/SchedulingReport.vue"),
          meta: { title: "調度日報", id: 7, isValidation: true, islogin: true },
        },
        {
          path: "ArrearsStatistics",
          name: "ArrearsStatistics",
          component: () => import("../views/report/ArrearsStatistics.vue"),
          meta: {
            title: "欠費統計(金額區分)",
            id: 8,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "ArrearsYearStatistics",
          name: "ArrearsYearStatistics",
          component: () => import("../views/report/ArrearsYearStatistics.vue"),
          meta: {
            title: "欠費統計(年度區分)",
            id: 6,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "DaydayReport",
          name: "DaydayReport",
          component: () => import("../views/report/DaydayReport.vue"),
          meta: {
            title: "各專案N天以上卡數達成率",
            id: 10,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "DaydayReportnext",
          name: "DaydayReportnext",
          component: () => import("../views/report/DaydayReportnext.vue"),
          meta: {
            title: "各卡片騎乘天數",
            id: 11,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "BetteryCheck",
          name: "BetteryCheck",
          component: () => import("../views/report/BetteryCheck.vue"),
          meta: {
            title: "2.0E電池狀況查詢",
            id: 12,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "RidetimeSearch",
          name: "RidetimeSearch",
          component: () => import("../views/report/RidetimeSearch.vue"),
          meta: {
            title: "yb2騎乘時間查詢",
            id: 13,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "SuportmonthMoney",
          name: "SuportmonthMoney",
          component: () => import("../views/report/SuportmonthMoney.vue"),
          meta: {
            title: "補助款月報",
            id: 14,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "SuportmonthMoneytpass",
          name: "SuportmonthMoneytpass",
          component: () => import("../views/report/SuportmonthMoneytpass.vue"),
          meta: {
            title: "TPASS補助款月報",
            id: 31,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "MarkingmonthReport",
          name: "MarkingmonthReport",
          component: () => import("../views/report/MarkingmonthReport.vue"),
          meta: {
            title: "行銷月報",
            id: 15,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "HotODdot",
          name: "HotODdot",
          component: () => import("../views/report/HotODdot.vue"),
          meta: {
            title: "平日、假日熱門的OD點",
            id: 16,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "ReturncarRanktop",
          name: "ReturncarRanktop",
          component: () => import("../views/report/ReturncarRanktop.vue"),
          meta: {
            title: "借/還車場站排名(前幾名)",
            id: 17,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "ReturncarRankbottom",
          name: "ReturncarRankbottom",
          component: () => import("../views/report/ReturncarRankbottom.vue"),
          meta: {
            title: "借/還車場站排名(倒數)",
            id: 18,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "TwoTaipeireport",
          name: "TwoTaipeireport",
          component: () => import("../views/report/TwoTaipeireport.vue"),
          meta: {
            title: "見車率統計日報",
            id: 26,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "TopReport",
          name: "TopReport",
          component: () => import("../views/report/TopReport.vue"),
          meta: {
            title: "TOP 50排名週報",
            id: 27,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "PutsearchReportmonth",
          name: "PutsearchReportmonth",
          component: () => import("../views/report/PutsearchReportmonth.vue"),
          meta: {
            title: "投保率分析月報",
            id: 32,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "PutsearchReportweek",
          name: "PutsearchReportweek",
          component: () => import("../views/report/PutsearchReportweek.vue"),
          meta: {
            title: "投保率分析週報",
            id: 33,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "PutsearchReportbike",
          name: "PutsearchReportbike",
          component: () => import("../views/report/PutsearchReportbike.vue"),
          meta: {
            title: "騎乘次數明細比例",
            id: 34,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "PutsearchReportemail",
          name: "PutsearchReportemail",
          component: () => import("../views/report/PutsearchReportemail.vue"),
          meta: {
            title: "騎乘次數明細比例",
            id: 35,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "CostumdayReporttotal",
          name: "CostumdayReporttotal",
          component: () => import("../views/report/CostumdayReporttotal.vue"),
          meta: {
            title: "話務統計表",
            id: 36,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "NocarNOseet",
          name: "NocarNOseet",
          component: () => import("../views/report/NocarNOseet.vue"),
          meta: {
            title: "無車無位統計",
            id: 37,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "CostumdayReporttelnum",
          name: "CostumdayReporttelnum",
          component: () => import("../views/report/CostumdayReporttelnum.vue"),
          meta: {
            title: "接聽通數統計",
            id: 38,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "CostumdayReportteloutnum",
          name: "CostumdayReportteloutnum",
          component: () =>
            import("../views/report/CostumdayReportteloutnum.vue"),
          meta: {
            title: "外撥通數統計",
            id: 39,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "CostumdayReporthour",
          name: "CostumdayReporthour",
          component: () => import("../views/report/CostumdayReporthour.vue"),
          meta: {
            title: "每小時明細表",
            id: 40,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "CostumdayReporttelout",
          name: "CostumdayReporttelout",
          component: () => import("../views/report/CostumdayReporttelout.vue"),
          meta: {
            title: "電話掛斷通數統計表",
            id: 41,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "LostcarView",
          name: "LostcarView",
          component: () => import("../views/report/LostcarView.vue"),
          meta: {
            title: "遺失車報表",
            id: 42,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "CostummountReport",
          name: "CostummountReport",
          component: () => import("../views/report/CostummountReport.vue"),
          meta: {
            title: "客服每月話務報表",
            id: 43,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "SchedulingweekReport",
          name: "SchedulingweekReport",
          component: () => import("../views/report/SchedulingweekReport.vue"),
          meta: {
            title: "調度週報",
            id: 44,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "NewmemberMonthReport",
          name: "NewmemberMonthReport",
          component: () => import("../views/report/NewmemberMonthReport.vue"),
          meta: {
            title: "每月新增會員投保數",
            id: 45,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "EverydayEdit",
          name: "EverydayEdit",
          component: () => import("../views/report/EverydayEdit.vue"),
          meta: {
            title: "每日新增&刪減票卡數",
            id: 47,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "CostumdayContent",
          name: "CostumdayContent",
          component: () => import("../views/report/CostumdayContent.vue"),
          meta: {
            title: "客服每日來電詢問內容",
            id: 48,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "CostumDayTel",
          name: "CostumDayTel",
          component: () => import("../views/report/CostumDayTel.vue"),
          meta: {
            title: "補償券月報",
            id: 49,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "IntegrateTable",
          name: "IntegrateTable",
          component: () => import("../views/report/IntegrateTable.vue"),
          meta: {
            title: "統整表",
            id: 50,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "LookcarReport",
          name: "LookcarReport",
          component: () => import("../views/report/LookcarReport.vue"),
          meta: {
            title: "見車率統計週報",
            id: 51,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "LookcarReportMonth",
          name: "LookcarReportMonth",
          component: () => import("../views/report/LookcarReportMonth.vue"),
          meta: {
            title: "見車率統計月報",
            id: 52,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "HourcarStatus",
          name: "HourcarStatus",
          component: () => import("../views/report/HourcarStatus.vue"),
          meta: {
            title: "每小時車輛狀態",
            id: 53,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "PowerBIView",
          name: "PowerBIView",
          component: () => import("../views/report/PowerBIView.vue"),
          meta: {
            title: "PowerBI",
            id: 62,
            isValidation: true,
            islogin: true,
          },
        },
      ],
    },
    {
      path: "/Admin",
      name: "Admin",
      children: [
        {
          path: "users",
          name: "users",
          component: () => import("../views/Admin/UsersView.vue"),
          meta: {
            title: "管理者資料",
            id: 19,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "role",
          name: "role",
          component: () => import("../views/Admin/RoleView.vue"),
          meta: {
            title: "角色資料",
            id: 20,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "RolecityView",
          name: "RolecityView",
          component: () => import("../views/Admin/RolecityView.vue"),
          meta: {
            title: "帳號城市權限管理",
            id: 28,
            isValidation: true,
            islogin: true,
          },
        },
      ],
    },
    {
      path: "/Member",
      name: "Member",
      children: [
        {
          path: "engineview",
          name: "engineview",
          component: () => import("../views/member/EngineView.vue"),
          meta: { title: "工程", id: 4, isValidation: true, islogin: true },
        },
        {
          path: "FourGview",
          name: "FourGview",
          component: () => import("../views/member/FourGview.vue"),
          meta: {
            title: "1.0 4G場站",
            id: 21,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "OfficeInterview",
          name: "OfficeInterview",
          component: () => import("../views/member/OfficeInterview.vue"),
          meta: {
            title: "辦公室網路",
            id: 22,
            isValidation: true,
            islogin: true,
          },
        },

        {
          path: "OfficeTelview",
          name: "OfficeTelview",
          component: () => import("../views/member/OfficeTelview.vue"),
          meta: {
            title: "辦公室電話",
            id: 23,
            isValidation: true,
            islogin: true,
          },
        },

        {
          path: "IpadTotalView",
          name: "IpadTotalView",
          component: () => import("../views/member/IpadTotalView.vue"),
          meta: {
            title: "平板統計",
            id: 24,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "UpexcelView",
          name: "UpexcelView",
          component: () => import("../views/member/UpexcelView.vue"),
          meta: {
            title: "上傳檔案",
            id: 25,
            isValidation: true,
            islogin: true,
          },
        },
      ],
    },
    {
      path: "/Lottery",
      name: "Lottery",
      children: [
        {
          path: "LotteryView",
          name: "LotteryView",
          component: () => import("../views/lottery/LotteryView.vue"),
          meta: {
            title: "地區活動抽獎網站",
            id: 29,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "DaydaylotteryView",
          name: "DaydaylotteryView",
          component: () => import("../views/lottery/DaydaylotteryView.vue"),
          meta: {
            title: "天天YB抽獎網站",
            id: 30,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "BlacklistView",
          name: "BlacklistView",
          component: () => import("../views/lottery/BlacklistView.vue"),
          meta: { title: "黑名單", id: 46, isValidation: true, islogin: true },
        },
      ],
    },
    {
      path: "/mailweb",
      name: "mailweb",
      children: [
        {
          path: "SendmailView",
          name: "SendmailView",
          component: () => import("../views/mailweb/SendmailView.vue"),
          meta: {
            title: "異常通知",
            id: 54,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "Sendmail2View",
          name: "Sendmail2View",
          component: () => import("../views/mailweb/Sendmail2View.vue"),
          meta: {
            title: "場站告警",
            id: 56,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "ListmailView",
          name: "ListmailView",
          component: () => import("../views/mailweb/ListmailView.vue"),
          meta: {
            title: "場站告警名單",
            id: 57,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "Sendmail3View",
          name: "Sendmail3View",
          component: () => import("../views/mailweb/Sendmail3View.vue"),
          meta: {
            title: "電量緊急派工",
            id: 61,
            isValidation: true,
            islogin: true,
          },
        },
        // Sendmail3View
      ],
    },

    ///這邊的id需要修正
    {
      path: "/message",
      name: "message",
      children: [
        {
          path: "sendMessage",
          name: "sendMessage",
          component: () => import("../views/message/sendMessage.vue"),
          meta: {
            title: "簡訊發送",
            id: 55,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "sendFile",
          name: "sendFile",
          component: () => import("../views/message/sendFile.vue"),
          meta: {
            title: "上傳檔案",
            id: 58,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "searchData",
          name: "searchData",
          component: () => import("../views/message/searchData.vue"),
          meta: {
            title: "預約查詢",
            id: 59,
            isValidation: true,
            islogin: true,
          },
        },
        {
          path: "CheckMessageView",
          name: "CheckMessageView",
          component: () => import("../views/message/CheckMessageView.vue"),
          meta: {
            title: "發送確認",
            id: 60,
            isValidation: true,
            islogin: true,
          },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/NotfoundView.vue"),
      meta: { title: "404找不到", isValidation: false, islogin: false },
    },
  ],
});

//判斷是否有token
const JWTisok = () => {
  let istokenlife = false;
  const cookies = document.cookie.split(";");
  cookies.forEach((item) => {
    if (item.split("=")[0].trim() === "youbike") {
      istokenlife = true;
    }
  });
  return istokenlife;
};

const getisValidationpage = () => {
  const cookies = document.cookie.split(";");
  let istokenlife = false;
  let token = null;
  cookies.forEach((item) => {
    if (item.split("=")[0].trim() === "youbike") {
      istokenlife = true;
      token = item.split("=")[1];
    }
  });

  if (!istokenlife) {
    return [];
  }
  const decodedToken = jwt_decode(token);
  const arr = [];
  for (const key in decodedToken) {
    if (decodedToken[key]["page_id"]) {
      arr.push(decodedToken[key]["page_id"]);
    }
  }

  return arr;
};

router.beforeEach((to, form, next) => {
  // console.log(to, form);
  //如果去的不是首頁,但沒有token,而且需要登入,就轉到login
  if (to.fullPath != "/login" && !JWTisok() && to.meta.islogin === true) {
    router.push("/login");
  } else if (
    to.fullPath == "/ServiceReport" ||
    to.fullPath == "/Admin" ||
    to.fullPath == "/Member" ||
    to.fullPath == "/lottery"
  ) {
    next(form.path);
  } else {
    const canusepage = getisValidationpage();
    //如果頁面需要驗證,並且權限表上沒有該id,就導到之前的page
    if (to.meta.isValidation && !canusepage.includes(to.meta.id)) {
      next(form.path);
    } else {
      next();
    }
  }
});

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title || "報表系統";
  }
});

export default router;
