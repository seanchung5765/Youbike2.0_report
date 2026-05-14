import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/userdata";
import Swal from "sweetalert2";

// 首頁引入 
const FrontPage = () => import("../views/FrontPage.vue");

const routes = [
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
  {
    path: "/ServiceReport",
    name: "ServiceReport",
    redirect: "/ServiceReport/OperationDaily",
    children: [
      {
        path: "OperationDaily",
        name: "OperationDaily",
        component: () => import("../views/report/OperationDaily.vue"),
        meta: { title: "營運管理日報", id: 102, isValidation: true, islogin: true },
      },
      {
        path: "OperationWeekDaily",
        name: "OperationWeekDaily",
        component: () => import("../views/report/OperationWeekDaily.vue"),
        meta: { title: "營運管理週報", id: 103, isValidation: true, islogin: true },
      },
      {
        path: "OperationMonthDaily",
        name: "OperationMonthDaily",
        component: () => import("../views/report/OperationMonthDaily.vue"),
        meta: { title: "營運管理月報", id: 104, isValidation: true, islogin: true },
      },
      {
        path: "OperateReport",
        name: "OperateReport",
        component: () => import("../views/report/OperateReport.vue"),
        meta: { title: "營運日報", id: 1011, isValidation: true, islogin: true },
      },
      {
        path: "OperateMonthReport",
        name: "OperateMonthReport",
        component: () => import("../views/report/OperateMonthReport.vue"),
        meta: { title: "累積業績", id: 1012, isValidation: true, islogin: true },
      },
      {
        path: "SchedulingReport",
        name: "SchedulingReport",
        component: () => import("../views/report/SchedulingReport.vue"),
        meta: { title: "調度日報", id: 113, isValidation: true, islogin: true },
      },
      {
        path: "ArrearsStatistics",
        name: "ArrearsStatistics",
        component: () => import("../views/report/ArrearsStatistics.vue"),
        meta: { title: "欠費統計(金額區分)", id: 1051, isValidation: true, islogin: true },
      },
      {
        path: "ArrearsYearStatistics",
        name: "ArrearsYearStatistics",
        component: () => import("../views/report/ArrearsYearStatistics.vue"),
        meta: { title: "欠費統計(年度區分)", id: 1052, isValidation: true, islogin: true },
      },
      {
        path: "DaydayReport",
        name: "DaydayReport",
        component: () => import("../views/report/DaydayReport.vue"),
        meta: { title: "各專案N天以上卡數達成率", id: 117, isValidation: true, islogin: true },
      },
      {
        path: "DaydayReportnext",
        name: "DaydayReportnext",
        component: () => import("../views/report/DaydayReportnext.vue"),
        meta: { title: "各卡片騎乘天數", id: 118, isValidation: true, islogin: true },
      },
      {
        path: "BetteryCheck",
        name: "BetteryCheck",
        component: () => import("../views/report/BetteryCheck.vue"),
        meta: { title: "2.0E電池狀況查詢", id: 115, isValidation: true, islogin: true },
      },
      {
        path: "RidetimeSearch",
        name: "RidetimeSearch",
        component: () => import("../views/report/RidetimeSearch.vue"),
        meta: { title: "yb2騎乘時間查詢", id: 106, isValidation: true, islogin: true },
      },
      {
        path: "SuportmonthMoney",
        name: "SuportmonthMoney",
        component: () => import("../views/report/SuportmonthMoney.vue"),
        meta: { title: "補助款月報", id: 1211, isValidation: true, islogin: true },
      },
      {
        path: "SuportmonthMoneytpass",
        name: "SuportmonthMoneytpass",
        component: () => import("../views/report/SuportmonthMoneytpass.vue"),
        meta: { title: "TPASS補助款月報", id: 1212, isValidation: true, islogin: true },
      },
      {
        path: "MarkingmonthReport",
        name: "MarkingmonthReport",
        component: () => import("../views/report/MarkingmonthReport.vue"),
        meta: { title: "行銷月報", id: 119, isValidation: true, islogin: true },
      },
      {
        path: "HotODdot",
        name: "HotODdot",
        component: () => import("../views/report/HotODdot.vue"),
        meta: { title: "熱門OD點", id: 1201, isValidation: true, islogin: true },
      },
      {
        path: "ReturncarRanktop",
        name: "ReturncarRanktop",
        component: () => import("../views/report/ReturncarRanktop.vue"),
        meta: { title: "場站排名(前幾名)", id: 1202, isValidation: true, islogin: true },
      },
      {
        path: "ReturncarRankbottom",
        name: "ReturncarRankbottom",
        component: () => import("../views/report/ReturncarRankbottom.vue"),
        meta: { title: "場站排名(倒數)", id: 1203, isValidation: true, islogin: true },
      },
      {
        path: "TwoTaipeireport",
        name: "TwoTaipeireport",
        component: () => import("../views/report/TwoTaipeireport.vue"),
        meta: { title: "見車率統計日報", id: 1071, isValidation: true, islogin: true },
      },
      {
        path: "TopReport",
        name: "TopReport",
        component: () => import("../views/report/TopReport.vue"),
        meta: { title: "TOP 50排名週報", id: 116, isValidation: true, islogin: true },
      },
      {
        path: "PutsearchReportmonth",
        name: "PutsearchReportmonth",
        component: () => import("../views/report/PutsearchReportmonth.vue"),
        meta: { title: "投保率分析月報", id: 1091, isValidation: true, islogin: true },
      },
      {
        path: "PutsearchReportweek",
        name: "PutsearchReportweek",
        component: () => import("../views/report/PutsearchReportweek.vue"),
        meta: { title: "投保率分析週報", id: 1092, isValidation: true, islogin: true },
      },
      {
        path: "PutsearchReportbike",
        name: "PutsearchReportbike",
        component: () => import("../views/report/PutsearchReportbike.vue"),
        meta: { title: "騎乘次數明細比例", id: 1093, isValidation: true, islogin: true },
      },
      {
        path: "PutsearchReportemail",
        name: "PutsearchReportemail",
        component: () => import("../views/report/PutsearchReportemail.vue"),
        meta: { title: "Email投保分類", id: 1094, isValidation: true, islogin: true },
      },
      {
        path: "NewmemberMonthReport",
        name: "NewmemberMonthReport",
        component: () => import("../views/report/NewmemberMonthReport.vue"),
        meta: { title: "每月新增會員投保數", id: 1095, isValidation: true, islogin: true },
      },
      {
        path: "CostumdayReporttotal",
        name: "CostumdayReporttotal",
        component: () => import("../views/report/CostumdayReporttotal.vue"),
        meta: { title: "話務統計表", id: 1232, isValidation: true, islogin: true },
      },
      {
        path: "NocarNOseet",
        name: "NocarNOseet",
        component: () => import("../views/report/NocarNOseet.vue"),
        meta: { title: "無車無位統計", id: 108, isValidation: true, islogin: true },
      },
      {
        path: "CostumdayReporttelnum",
        name: "CostumdayReporttelnum",
        component: () => import("../views/report/CostumdayReporttelnum.vue"),
        meta: { title: "接聽通數統計", id: 1233, isValidation: true, islogin: true },
      },
      {
        path: "CostumdayReportteloutnum",
        name: "CostumdayReportteloutnum",
        component: () => import("../views/report/CostumdayReportteloutnum.vue"),
        meta: { title: "外撥通數統計", id: 1234, isValidation: true, islogin: true },
      },
      {
        path: "CostumdayReporthour",
        name: "CostumdayReporthour",
        component: () => import("../views/report/CostumdayReporthour.vue"),
        meta: { title: "每小時明細表", id: 1235, isValidation: true, islogin: true },
      },
      {
        path: "CostumdayReporttelout",
        name: "CostumdayReporttelout",
        component: () => import("../views/report/CostumdayReporttelout.vue"),
        meta: { title: "電話掛斷統計表", id: 1236, isValidation: true, islogin: true },
      },
      {
        path: "LostcarView",
        name: "LostcarView",
        component: () => import("../views/report/LostcarView.vue"),
        meta: { title: "遺失車報表", id: 125, isValidation: true, islogin: true },
      },
      {
        path: "CostummountReport",
        name: "CostummountReport",
        component: () => import("../views/report/CostummountReport.vue"),
        meta: { title: "客服每月話務報表", id: 124, isValidation: true, islogin: true },
      },
      {
        path: "SchedulingweekReport",
        name: "SchedulingweekReport",
        component: () => import("../views/report/SchedulingweekReport.vue"),
        meta: { title: "調度週報", id: 114, isValidation: true, islogin: true },
      },
      {
        path: "EverydayEdit",
        name: "EverydayEdit",
        component: () => import("../views/report/EverydayEdit.vue"),
        meta: { title: "每日新增&刪減票卡數", id: 110, isValidation: true, islogin: true },
      },
      {
        path: "CostumdayContent",
        name: "CostumdayContent",
        component: () => import("../views/report/CostumdayContent.vue"),
        meta: { title: "客服來電詢問內容", id: 126, isValidation: true, islogin: true },
      },
      {
        path: "CostumDayTel",
        name: "CostumDayTel",
        component: () => import("../views/report/CostumDayTel.vue"),
        meta: { title: "補償券月報", id: 122, isValidation: true, islogin: true },
      },
      {
        path: "IntegrateTable",
        name: "IntegrateTable",
        component: () => import("../views/report/IntegrateTable.vue"),
        meta: { title: "統整表", id: 1231, isValidation: true, islogin: true },
      },
      {
        path: "LookcarReport",
        name: "LookcarReport",
        component: () => import("../views/report/LookcarReport.vue"),
        meta: { title: "見車率統計週報", id: 1072, isValidation: true, islogin: true },
      },
      {
        path: "LookcarReportMonth",
        name: "LookcarReportMonth",
        component: () => import("../views/report/LookcarReportMonth.vue"),
        meta: { title: "見車率統計月報", id: 1073, isValidation: true, islogin: true },
      },
      {
        path: "HourcarStatus",
        name: "HourcarStatus",
        component: () => import("../views/report/HourcarStatus.vue"),
        meta: { title: "每小時車輛狀態", id: 111, isValidation: true, islogin: true },
      },
      {
        path: "PowerBIView",
        name: "PowerBIView",
        component: () => import("../views/report/PowerBIView.vue"),
        meta: { title: "PowerBI", id: 127, isValidation: true, islogin: true },
      },
    ],
  },
  {
    path: "/Admin",
    name: "Admin",
    redirect: "/Admin/users",
    children: [
      {
        path: "users",
        name: "users",
        component: () => import("../views/Admin/UsersView.vue"),
        meta: { title: "使用者角色", id: 201, isValidation: true, islogin: true },
      },
      {
        path: "role",
        name: "role",
        component: () => import("../views/Admin/RoleView.vue"),
        meta: { title: "角色權限", id: 202, isValidation: true, islogin: true },
      },
      {
        path: "RolecityView",
        name: "RolecityView",
        component: () => import("../views/Admin/RolecityView.vue"),
        meta: { title: "使用者可閱縣市", id: 203, isValidation: true, islogin: true },
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
        meta: { title: "活動抽獎", id: 301, isValidation: true, islogin: true },
      },
      /*{
        path: "DaydaylotteryView",
        name: "DaydaylotteryView",
        component: () => import("../views/lottery/DaydaylotteryView.vue"),
        meta: { title: "天天YB抽獎網站", id: 302, isValidation: true, islogin: true },
      },
      {
        path: "BlacklistView",
        name: "BlacklistView",
        component: () => import("../views/lottery/BlacklistView.vue"),
        meta: { title: "黑名單", id: 303, isValidation: true, islogin: true },
      },*/
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotfoundView.vue"),
    meta: { title: "404找不到", isValidation: false, islogin: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const store = useUserStore();

  // 1. 執行初始化並拿回「是否登入」的結果
  const isLogin = store.getdata(); 

  // 2. 檢查是否需要登入 (沒登入就踢回 /login)
  if (to.meta.islogin && !isLogin) {
    return next("/login");
  }

  // 3.  權限控制核心
  if (to.meta.isValidation) {
    
    // 【上帝模式】讀取環境變數，動態判斷超級管理員！
    const superAdminId = import.meta.env.VITE_SUPER_ADMIN_EMP_ID;
    if (store.userId === superAdminId) {
      return next(); 
    }

    // 一般使用者的權限檢查
    const canUsePages = store.userPages || []; 
    const requiredId = Number(to.meta.id);
    const hasAuth = canUsePages.includes(requiredId);

    if (!hasAuth) {
      console.warn(`[權限攔截] 頁面 ID: ${requiredId} 不在您的權限清單 [${canUsePages}] 中`);
      
      Swal.fire({
        icon: "error",
        title: "存取被拒",
        text: "您的帳號尚未開放此功能權限，請聯繫系統管理員。",
        timer: 2000,
        showConfirmButton: false
      });

      // 沒權限踢回上一頁或首頁
      return next(from.path === "/" || from.path === "/login" ? "/" : from.path);
    }
  }

  // 4. 順利通過所有檢查，放行！
  next(); 
});

// 標題設定
router.afterEach((to) => {
  document.title = to.meta.title ? `報表系統 | ${to.meta.title}` : "報表系統";
});

export default router;