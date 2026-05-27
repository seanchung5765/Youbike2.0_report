import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/userdata";
import Swal from "sweetalert2";
import { recordClick } from "@/api/index";

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
    path: "/service-report",
    name: "ServiceReport",
    redirect: "/service-report/operation-daily",
    children: [
      {
        path: "operation-daily",
        name: "OperationDaily",
        component: () => import("../views/report/OperationDaily.vue"),
        meta: { title: "營運管理日報", id: 102, isValidation: true, islogin: true },
      },
      {
        path: "operation-week-daily",
        name: "OperationWeekDaily",
        component: () => import("../views/report/OperationWeekDaily.vue"),
        meta: { title: "營運管理週報", id: 103, isValidation: true, islogin: true },
      },
      {
        path: "operation-month-daily",
        name: "OperationMonthDaily",
        component: () => import("../views/report/OperationMonthDaily.vue"),
        meta: { title: "營運管理月報", id: 104, isValidation: true, islogin: true },
      },
      {
        path: "operate-report",
        name: "OperateReport",
        component: () => import("../views/report/OperateReport.vue"),
        meta: { title: "營運日報", id: 1011, isValidation: true, islogin: true },
      },
      {
        path: "operate-month-report",
        name: "OperateMonthReport",
        component: () => import("../views/report/OperateMonthReport.vue"),
        meta: { title: "累積業績", id: 1012, isValidation: true, islogin: true },
      },
      {
        path: "block-bind",
        name: "BlockBind",
        component: () => import("../views/report/BlockBind.vue"),
        meta: { title: "擋柱綁車", id: 112, isValidation: true, islogin: true },
      },
      {
        path: "scheduling-report",
        name: "SchedulingReport",
        component: () => import("../views/report/SchedulingReport.vue"),
        meta: { title: "調度日報", id: 113, isValidation: true, islogin: true },
      },
      {
        path: "arrears-statistics",
        name: "ArrearsStatistics",
        component: () => import("../views/report/ArrearsStatistics.vue"),
        meta: { title: "欠費統計(金額區分)", id: 1051, isValidation: true, islogin: true },
      },
      {
        path: "arrears-year-statistics",
        name: "ArrearsYearStatistics",
        component: () => import("../views/report/ArrearsYearStatistics.vue"),
        meta: { title: "欠費統計(年度區分)", id: 1052, isValidation: true, islogin: true },
      },
      {
        path: "dayday-report",
        name: "DaydayReport",
        component: () => import("../views/report/DaydayReport.vue"),
        meta: { title: "各專案N天以上卡數達成率", id: 117, isValidation: true, islogin: true },
      },
      {
        path: "dayday-report-next",
        name: "DaydayReportnext",
        component: () => import("../views/report/DaydayReportnext.vue"),
        meta: { title: "各卡片騎乘天數", id: 118, isValidation: true, islogin: true },
      },
      {
        path: "bettery-check",
        name: "BetteryCheck",
        component: () => import("../views/report/BetteryCheck.vue"),
        meta: { title: "2.0E電池狀況查詢", id: 115, isValidation: true, islogin: true },
      },
      {
        path: "ridetime-search",
        name: "RidetimeSearch",
        component: () => import("../views/report/RidetimeSearch.vue"),
        meta: { title: "yb2騎乘時間查詢", id: 106, isValidation: true, islogin: true },
      },
      {
        path: "suport-month-money",
        name: "SuportmonthMoney",
        component: () => import("../views/report/SuportmonthMoney.vue"),
        meta: { title: "補助款月報", id: 1211, isValidation: true, islogin: true },
      },
      {
        path: "suport-month-money-tpass",
        name: "SuportmonthMoneytpass",
        component: () => import("../views/report/SuportmonthMoneytpass.vue"),
        meta: { title: "TPASS補助款月報", id: 1212, isValidation: true, islogin: true },
      },
      {
        path: "marking-month-report",
        name: "MarkingmonthReport",
        component: () => import("../views/report/MarkingmonthReport.vue"),
        meta: { title: "行銷月報", id: 119, isValidation: true, islogin: true },
      },
      {
        path: "hot-od-dot",
        name: "HotODdot",
        component: () => import("../views/report/HotODdot.vue"),
        meta: { title: "熱門OD點", id: 1201, isValidation: true, islogin: true },
      },
      {
        path: "returncar-rank-bottom",
        name: "ReturncarRankbottom",
        component: () => import("../views/report/ReturncarRankbottom.vue"),
        meta: { title: "場站排名", id: 1203, isValidation: true, islogin: true },
      },
      {
        path: "two-taipei-report",
        name: "TwoTaipeireport",
        component: () => import("../views/report/TwoTaipeireport.vue"),
        meta: { title: "見車率統計日報", id: 1071, isValidation: true, islogin: true },
      },
      {
        path: "top-report",
        name: "TopReport",
        component: () => import("../views/report/TopReport.vue"),
        meta: { title: "TOP 50排名週報", id: 116, isValidation: true, islogin: true },
      },
      {
        path: "putsearch-report-month",
        name: "PutsearchReportmonth",
        component: () => import("../views/report/PutsearchReportmonth.vue"),
        meta: { title: "投保率分析月報", id: 1091, isValidation: true, islogin: true },
      },
      {
        path: "putsearch-report-week",
        name: "PutsearchReportweek",
        component: () => import("../views/report/PutsearchReportweek.vue"),
        meta: { title: "投保率分析週報", id: 1092, isValidation: true, islogin: true },
      },
      {
        path: "putsearch-report-bike",
        name: "PutsearchReportbike",
        component: () => import("../views/report/PutsearchReportbike.vue"),
        meta: { title: "騎乘次數明細比例", id: 1093, isValidation: true, islogin: true },
      },
      {
        path: "putsearch-report-email",
        name: "PutsearchReportemail",
        component: () => import("../views/report/PutsearchReportemail.vue"),
        meta: { title: "Email投保分類", id: 1094, isValidation: true, islogin: true },
      },
      {
        path: "newmember-month-report",
        name: "NewmemberMonthReport",
        component: () => import("../views/report/NewmemberMonthReport.vue"),
        meta: { title: "每月新增會員投保數", id: 1095, isValidation: true, islogin: true },
      },
      {
        path: "costum-day-report-total",
        name: "CostumdayReporttotal",
        component: () => import("../views/report/CostumdayReporttotal.vue"),
        meta: { title: "話務統計表", id: 1232, isValidation: true, islogin: true },
      },
      {
        path: "nocar-no-seet",
        name: "NocarNOseet",
        component: () => import("../views/report/NocarNOseet.vue"),
        meta: { title: "無車無位統計", id: 108, isValidation: true, islogin: true },
      },
      {
        path: "costum-day-report-telnum",
        name: "CostumdayReporttelnum",
        component: () => import("../views/report/CostumdayReporttelnum.vue"),
        meta: { title: "接聽通數統計", id: 1233, isValidation: true, islogin: true },
      },
      {
        path: "costum-day-report-teloutnum",
        name: "CostumdayReportteloutnum",
        component: () => import("../views/report/CostumdayReportteloutnum.vue"),
        meta: { title: "外撥通數統計", id: 1234, isValidation: true, islogin: true },
      },
      {
        path: "costum-day-report-hour",
        name: "CostumdayReporthour",
        component: () => import("../views/report/CostumdayReporthour.vue"),
        meta: { title: "每小時明細表", id: 1235, isValidation: true, islogin: true },
      },
      {
        path: "costum-day-report-telout",
        name: "CostumdayReporttelout",
        component: () => import("../views/report/CostumdayReporttelout.vue"),
        meta: { title: "電話掛斷統計表", id: 1236, isValidation: true, islogin: true },
      },
      {
        path: "lostcar-view",
        name: "LostcarView",
        component: () => import("../views/report/LostcarView.vue"),
        meta: { title: "遺失車報表", id: 125, isValidation: true, islogin: true },
      },
      {
        path: "costum-mount-report",
        name: "CostummountReport",
        component: () => import("../views/report/CostummountReport.vue"),
        meta: { title: "客服每月話務報表", id: 124, isValidation: true, islogin: true },
      },
      {
        path: "scheduling-week-report",
        name: "SchedulingweekReport",
        component: () => import("../views/report/SchedulingweekReport.vue"),
        meta: { title: "調度週報", id: 114, isValidation: true, islogin: true },
      },
      {
        path: "everyday-edit",
        name: "EverydayEdit",
        component: () => import("../views/report/EverydayEdit.vue"),
        meta: { title: "每日新增&刪減票卡數", id: 110, isValidation: true, islogin: true },
      },
      {
        path: "costum-day-content",
        name: "CostumdayContent",
        component: () => import("../views/report/CostumdayContent.vue"),
        meta: { title: "客服來電詢問內容", id: 126, isValidation: true, islogin: true },
      },
      {
        path: "costum-day-tel",
        name: "CostumDayTel",
        component: () => import("../views/report/CostumDayTel.vue"),
        meta: { title: "補償券月報", id: 122, isValidation: true, islogin: true },
      },
      {
        path: "integrate-table",
        name: "IntegrateTable",
        component: () => import("../views/report/IntegrateTable.vue"),
        meta: { title: "統整表", id: 1231, isValidation: true, islogin: true },
      },
      {
        path: "lookcar-report",
        name: "LookcarReport",
        component: () => import("../views/report/LookcarReport.vue"),
        meta: { title: "見車率統計週報", id: 1072, isValidation: true, islogin: true },
      },
      {
        path: "lookcar-report-month",
        name: "LookcarReportMonth",
        component: () => import("../views/report/LookcarReportMonth.vue"),
        meta: { title: "見車率統計月報", id: 1073, isValidation: true, islogin: true },
      },
      {
        path: "hourcar-status",
        name: "HourcarStatus",
        component: () => import("../views/report/HourcarStatus.vue"),
        meta: { title: "每小時車輛狀態", id: 111, isValidation: true, islogin: true },
      },
      {
        path: "power-bi-view",
        name: "PowerBIView",
        component: () => import("../views/report/PowerBIView.vue"),
        meta: { title: "PowerBI", id: 127, isValidation: true, islogin: true },
      },
    ],
  },
  {
    path: "/cs-all",
    name: "CustomerService",
    redirect: "/cs-all/transaction-v1",
    children: [
      {
        path: "transaction-v1",
        name: "TransactionV1",
        component: () => import("../views/customer-service/TransactionV1.vue"), // 請確保你的 Vue 檔名對應一致
        meta: { title: "1.0交易查詢", id: 131, isValidation: true, islogin: true },
      },
      {
        path: "member-v1",
        name: "MemberV1",
        component: () => import("../views/customer-service/MemberV1.vue"),
        meta: { title: "1.0會員查詢", id: 132, isValidation: true, islogin: true },
      },
      {
        path: "card-v1",
        name: "CardV1",
        component: () => import("../views/customer-service/CardV1.vue"),
        meta: { title: "1.0卡片查詢", id: 133, isValidation: true, islogin: true },
      },
    ]
  },
  {
    path: "/admin",
    name: "Admin",
    redirect: "/admin/users",
    children: [
      {
        path: "users-view",
        name: "UsersView",
        component: () => import("../views/Admin/UsersView.vue"),
        meta: { title: "使用者角色", id: 201, isValidation: true, islogin: true },
      },
      {
        path: "role-view",
        name: "RoleView",
        component: () => import("../views/Admin/RoleView.vue"),
        meta: { title: "角色權限", id: 202, isValidation: true, islogin: true },
      },
      {
        path: "role-city-view",
        name: "RolecityView",
        component: () => import("../views/Admin/RolecityView.vue"),
        meta: { title: "使用者可閱縣市", id: 203, isValidation: true, islogin: true },
      },
    ],
  },
  {
    path: "/lottery",
    name: "Lottery",
    children: [
      {
        path: "lottery-view",
        name: "LotteryView",
        component: () => import("../views/lottery/LotteryView.vue"),
        meta: { title: "活動抽獎", id: 301, isValidation: true, islogin: true },
      },
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
   const superAdminId = window.APP_CONFIG?.SUPER_ADMIN_EMP_ID || import.meta.env.VITE_SUPER_ADMIN_EMP_ID;
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
if (to.meta.id) {
    recordClick(to.meta.id);
  }
});

export default router;