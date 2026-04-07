<template>
  <n-config-provider :theme="theme" style="height: 100vh">
    <n-layout has-sider style="height: 100vh">
      <n-layout-sider
        v-if="route.path != '/login' && route.path != '/YouBike_portal'"
        :default-collapsed="true"
        collapse-mode="transform"
        :native-scrollbar="false"
        :collapsed-width="0"
        :width="240"
        show-trigger="bar"
        bordered
      >
        <n-menu
          :options="menuOptions"
          :collapsed-icon-size="22"
          :value="routeValue"
          class="fw-bold"
        />
        <div class="text-center mb-3">
          <n-switch :rail-style="railStyle" @update:value="handleChange">
            <template #checked> 暗暗模式 </template>
            <template #unchecked> 亮亮模式 </template>
          </n-switch>
        </div>
        <n-dropdown trigger="click" :options="options">
          <div class="text-center">
            <Icon size="30">
              <IosSettings></IosSettings>
            </Icon>
          </div>
        </n-dropdown>
      </n-layout-sider>
      <n-layout-content content-style="padding: 24px;">
        <slot></slot>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { useUserStore } from "@/stores/userdata";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { h, ref, watchEffect, provide } from "vue";
import {
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NIcon,
  NMenu,
  NDropdown,
  NConfigProvider,
  darkTheme,
  NSwitch,
} from "naive-ui";
import { Home, ChatboxEllipsesSharp } from "@vicons/ionicons5";
import { IosSettings } from "@vicons/ionicons4";
import { Book, User, Gift, MailBulk } from "@vicons/fa";
import { Icon } from "@vicons/utils";
import { Report, Account } from "@vicons/carbon";
// MessageRound
//icon 的方法
function renderIcon(icon) {
  return () => h(NIcon, { size: 20 }, { default: () => h(icon) });
}

const router = useRouter();
const route = useRoute();
const store = useUserStore();
const theme = ref(null);
let ischange = ref(0);
provide("ischange", ischange);
const handleChange = () => {
  if (theme.value == null) {
    ischange.value = 1;
    theme.value = darkTheme;
  } else {
    ischange.value = 0;
    theme.value = null;
  }
};

let menuOptions = [];
function ctrlmenu() {
  try {
    store.getdata();
    //頁面顯示開關
    const isshow = ref({});
    //總共27個網頁開關
    for (let i = 0; i < 62; i++) {
      isshow.value[`id${i + 1}`] = false;
    }

    //如果cookie上有token 上有頁面權限
    if (store.page) {
      store.page.forEach((element) => {
        isshow.value[`id${element}`] = true;
      });
    }
    //菜單傳入的值
    const menu = [
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                path: "/",
              },
            },
            { default: () => "首頁" }
          ),
        key: "/",
        icon: renderIcon(Home),
      },
      {
        label: "營運報表",
        key: "reportall",
        icon: renderIcon(Report),
        children: [
          {
            label: "經營日/月報",
            key: "OperateReportall",
            show: isshow.value.id5 || isshow.value.id6,
            children: [
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/OperateReport",
                      },
                    },
                    { default: () => "經營日報" }
                  ),
                key: "/ServiceReport/OperateReport",
                show: isshow.value.id5,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/OperateMonthReport",
                      },
                    },
                    { default: () => "累積業績" }
                  ),
                key: "/ServiceReport/OperateMonthReport",
                show: isshow.value.id6,
              },
            ],
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/OperationDaily",
                  },
                },
                { default: () => "營運管理日報" }
              ),
            key: "/ServiceReport/OperationDaily",
            show: isshow.value.id1,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/OperationWeekDaily",
                  },
                },
                { default: () => "營運管理週報" }
              ),
            key: "/ServiceReport/OperationWeekDaily",
            show: isshow.value.id2,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/OperationMonthDaily",
                  },
                },
                { default: () => "營運管理月報" }
              ),
            key: "/ServiceReport/OperationMonthDaily",
            show: isshow.value.id3,
          },
          {
            label: "欠費統計",
            key: "ArrearsStatisticsall",
            show: isshow.value.id8 || isshow.value.id9 || isshow.value.id10,
            children: [
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/ArrearsStatistics",
                      },
                    },
                    { default: () => "欠費統計(金額區分)" }
                  ),
                key: "/ServiceReport/ArrearsStatistics",
                show: isshow.value.id8,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/ArrearsYearStatistics",
                      },
                    },
                    { default: () => "欠費統計(年度區分)" }
                  ),
                key: "/ServiceReport/ArrearsYearStatistics",
                show: isshow.value.id9,
              },
            ],
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/RidetimeSearch",
                  },
                },
                { default: () => "yb2騎乘時間查詢" }
              ),
            key: "/ServiceReport/RidetimeSearch",
            show: isshow.value.id13,
          },
          {
            label: "見車率統計",
            key: "LookcarReportAll",
            show: isshow.value.id26 || isshow.value.id51 || isshow.value.id52,
            children: [
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/TwoTaipeireport",
                      },
                    },
                    { default: () => "見車率統計日報" }
                  ),
                key: "/ServiceReport/TwoTaipeireport",
                show: isshow.value.id26,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/LookcarReport",
                      },
                    },
                    { default: () => "見車率統計週報" }
                  ),
                key: "/ServiceReport/LookcarReport",
                show: isshow.value.id51,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/LookcarReportMonth",
                      },
                    },
                    { default: () => "見車率統計月報" }
                  ),
                key: "/ServiceReport/LookcarReportMonth",
                show: isshow.value.id52,
              },
            ],
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/NocarNOseet",
                  },
                },
                { default: () => "無車無位統計" }
              ),
            key: "/ServiceReport/NocarNOseet",
            show: isshow.value.id37,
          },

          {
            label: "投保率分析查詢",
            key: "PutsearchReportall",
            show:
              isshow.value.id32 ||
              isshow.value.id33 ||
              isshow.value.id34 ||
              isshow.value.id35 ||
              isshow.value.id45,
            children: [
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/PutsearchReportmonth",
                      },
                    },
                    { default: () => "投保率分析月報" }
                  ),
                key: "/ServiceReport/PutsearchReportmonth",
                show: isshow.value.id32,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/PutsearchReportweek",
                      },
                    },
                    { default: () => "投保率分析週報" }
                  ),
                key: "/ServiceReport/PutsearchReportweek",
                show: isshow.value.id33,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/PutsearchReportbike",
                      },
                    },
                    { default: () => "騎乘次數明細比例" }
                  ),
                key: "/ServiceReport/PutsearchReportbike",
                show: isshow.value.id34,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/PutsearchReportemail",
                      },
                    },
                    { default: () => "Email投保分類" }
                  ),
                key: "/ServiceReport/PutsearchReportemail",
                show: isshow.value.id35,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/NewmemberMonthReport",
                      },
                    },
                    { default: () => "每月新增會員投保數" }
                  ),
                key: "/ServiceReport/NewmemberMonthReport",
                show: isshow.value.id45,
              },
            ],
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/EverydayEdit",
                  },
                },
                { default: () => "每日新增&刪減票卡數" }
              ),
            key: "/ServiceReport/EverydayEdit",
            show: isshow.value.id47,
          },
          // HourcarStatus
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/HourcarStatus",
                  },
                },
                { default: () => "每小時車輛狀態" }
              ),
            key: "/ServiceReport/HourcarStatus",
            show: isshow.value.id53,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/SchedulingReport",
                  },
                },
                { default: () => "調度日報" }
              ),
            key: "/ServiceReport/SchedulingReport",
            show: isshow.value.id7,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/SchedulingweekReport",
                  },
                },
                { default: () => "調度週報" }
              ),
            key: "/ServiceReport/SchedulingweekReport",
            show: isshow.value.id44,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/BetteryCheck",
                  },
                },
                { default: () => "2.0E電池狀況查詢" }
              ),
            key: "/ServiceReport/BetteryCheck",
            show: isshow.value.id12,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/TopReport",
                  },
                },
                { default: () => "Top50排名週報" }
              ),
            key: "/ServiceReport/TopReport",
            show: isshow.value.id27,
          },
          // {
          //   label: '天天Youbike資料製作',
          //   key: "DaydayReportall",
          //   show:(isshow.value.id10 || isshow.value.id11),
          //   children:[
          //     {
          //       label: () => h(
          //         RouterLink,
          //         {
          //           to: {
          //             path: '/ServiceReport/DaydayReport'
          //           }
          //         },
          //         { default: () => ["各專案N天以上卡", h('br'), "數達成率"] }
          //       ),
          //       key: '/ServiceReport/DaydayReport',
          //       show:isshow.value.id10
          //     },
          //     {
          //       label: () => h(
          //         RouterLink,
          //         {
          //           to: {
          //             path: '/ServiceReport/DaydayReportnext'
          //           }
          //         },
          //         { default: () => "卡片騎乘天數" }
          //       ),
          //       key: '/ServiceReport/DaydayReportnext',
          //       show:isshow.value.id11
          //     }
          //   ]
          // },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/DaydayReport",
                  },
                },
                { default: () => ["各專案N天以上卡", h("br"), "數達成率"] }
              ),
            key: "/ServiceReport/DaydayReport",
            show: isshow.value.id10,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/DaydayReportnext",
                  },
                },
                { default: () => "卡片騎乘天數" }
              ),
            key: "/ServiceReport/DaydayReportnext",
            show: isshow.value.id11,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/MarkingmonthReport",
                  },
                },
                { default: () => "行銷月報" }
              ),
            key: "/ServiceReport/MarkingmonthReport",
            show: isshow.value.id15,
          },
          {
            label: "行銷需求(月)",
            key: "Marketingneedsall",
            show: isshow.value.id16 || isshow.value.id17 || isshow.value.id18,
            children: [
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/HotODdot",
                      },
                    },
                    { default: () => "熱門OD點" }
                  ),
                key: "/ServiceReport/HotODdot",
                show: isshow.value.id16,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/ReturncarRanktop",
                      },
                    },
                    { default: () => ["還車場站排名", h("br"), "(前幾名)"] }
                  ),
                key: "/ServiceReport/ReturncarRanktop",
                show: isshow.value.id17,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/ReturncarRankbottom",
                      },
                    },
                    { default: () => ["還車場站排名", h("br"), "(倒數)"] }
                  ),
                key: "/ServiceReport/ReturncarRankbottom",
                show: isshow.value.id18,
              },
            ],
          },
          {
            label: "補助款月報",
            key: "SuportmonthMoneyall",
            show: isshow.value.id14 || isshow.value.id31,
            children: [
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/SuportmonthMoney",
                      },
                    },
                    { default: () => "補助款月報" }
                  ),
                key: "/ServiceReport/SuportmonthMoney",
                show: isshow.value.id14,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/SuportmonthMoneytpass",
                      },
                    },
                    { default: () => "TPASS補助款月報" }
                  ),
                key: "/ServiceReport/SuportmonthMoneytpass",
                show: isshow.value.id31,
              },
            ],
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/CostumDayTel",
                  },
                },
                { default: () => ["補償券月報"] }
              ),
            key: "/ServiceReport/CostumDayTel",
            show: isshow.value.id49,
          },
          {
            label: "客服每日話務報表",
            key: "CostumdayReportall",
            show:
              isshow.value.id36 ||
              isshow.value.id38 ||
              isshow.value.id39 ||
              isshow.value.id40 ||
              isshow.value.id41 ||
              isshow.value.id50,
            children: [
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/IntegrateTable",
                      },
                    },
                    { default: () => "統整表" }
                  ),
                key: "/ServiceReport/IntegrateTable",
                show: isshow.value.id50,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/CostumdayReporttotal",
                      },
                    },
                    { default: () => "話務統計表" }
                  ),
                key: "/ServiceReport/CostumdayReporttotal",
                show: isshow.value.id36,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/CostumdayReporttelnum",
                      },
                    },
                    { default: () => "接聽通數統計" }
                  ),
                key: "/ServiceReport/CostumdayReporttelnum",
                show: isshow.value.id38,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/CostumdayReportteloutnum",
                      },
                    },
                    { default: () => "外撥通數統計" }
                  ),
                key: "/ServiceReport/CostumdayReportteloutnum",
                show: isshow.value.id39,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/CostumdayReporthour",
                      },
                    },
                    { default: () => "每小時明細表" }
                  ),
                key: "/ServiceReport/CostumdayReporthour",
                show: isshow.value.id40,
              },
              {
                label: () =>
                  h(
                    RouterLink,
                    {
                      to: {
                        path: "/ServiceReport/CostumdayReporttelout",
                      },
                    },
                    { default: () => "電話掛斷通數統計表" }
                  ),
                key: "/ServiceReport/CostumdayReporttelout",
                show: isshow.value.id41,
              },
            ],
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/CostummountReport",
                  },
                },
                { default: () => ["客服每月話務報表"] }
              ),
            key: "/ServiceReport/CostummountReport",
            show: isshow.value.id43,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/LostcarView",
                  },
                },
                { default: () => ["遺失車報表"] }
              ),
            key: "/ServiceReport/LostcarView",
            show: isshow.value.id42,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/CostumdayContent",
                  },
                },
                { default: () => ["客服每日來電詢問內容"] }
              ),
            key: "/ServiceReport/CostumdayContent",
            show: isshow.value.id48,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/ServiceReport/PowerBIView",
                  },
                },
                { default: () => ["PowerBI"] }
              ),
            key: "/ServiceReport/PowerBIView",
            show: isshow.value.id62,
          },
          // PowerBIView
        ],
      },
      {
        label: "網站管理",
        key: "Admin",
        icon: renderIcon(User),
        show: isshow.value.id19 || isshow.value.id20 || isshow.value.id28,
        children: [
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/Admin/users",
                  },
                },
                { default: () => "帳號角色管理" }
              ),
            key: "/Admin/users",
            show: isshow.value.id19,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/Admin/role",
                  },
                },
                { default: () => "角色權限管理" }
              ),
            key: "/Admin/role",
            show: isshow.value.id20,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/Admin/RolecityView",
                  },
                },
                { default: () => "帳號城市權限管理" }
              ),
            key: "/Admin/RolecityView",
            show: isshow.value.id28,
          },
        ],
      },
      {
        label: "會員資料",
        key: "memberdata",
        icon: renderIcon(Account),
        show:
          isshow.value.id4 ||
          isshow.value.id21 ||
          isshow.value.id22 ||
          isshow.value.id23 ||
          isshow.value.id24 ||
          isshow.value.id25,
        children: [
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/Member/EngineView",
                  },
                },
                { default: () => "工程" }
              ),
            key: "/Member/EngineView",
            show: isshow.value.id4,
          },
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/Member/FourGview",
                  },
                },
                { default: () => "1.0 4G場站" }
              ),
            key: "/Member/FourGview",
            show: isshow.value.id21,
          },
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/Member/OfficeInterview",
                  },
                },
                { default: () => "辦公室網路" }
              ),
            key: "/Member/OfficeInterview",
            show: isshow.value.id22,
          },

          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/Member/OfficeTelview",
                  },
                },
                { default: () => "辦公室電話" }
              ),
            key: "/Member/OfficeTelview",
            show: isshow.value.id23,
          },

          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/Member/IpadTotalView",
                  },
                },
                { default: () => "平板統計" }
              ),
            key: "/Member/IpadTotalView",
            show: isshow.value.id24,
          },

          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/Member/UpexcelView",
                  },
                },
                { default: () => "上傳檔案" }
              ),
            key: "/Member/UpexcelView",
            show: isshow.value.id25,
          },
        ],
      },
      {
        label: "抽獎程式",
        key: "lotteryweb",
        icon: renderIcon(Gift),
        show: isshow.value.id29 || isshow.value.id30 || isshow.value.id46,
        children: [
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/lottery/LotteryView",
                  },
                },
                { default: () => "地區活動抽獎網站" }
              ),
            key: "/lottery/LotteryView",
            show: isshow.value.id29,
          },
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/lottery/daydayLotteryView",
                  },
                },
                { default: () => "天天YB抽獎網站" }
              ),
            key: "/lottery/daydayLotteryView",
            show: isshow.value.id30,
          },
          {
            label: () =>
              h(
                RouterLink,
                {
                  to: {
                    path: "/lottery/BlacklistView",
                  },
                },
                { default: () => "黑名單" }
              ),
            key: "/lottery/BlacklistView",
            show: isshow.value.id46,
          },
        ],
      },
      {
        label: "異常通知",
        key: "mailweb",
        icon: renderIcon(MailBulk),
        show: isshow.value.id54 || isshow.value.id56 || isshow.value.id57,
        children: [
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/mailweb/SendmailView",
                  },
                },
                { default: () => "異常通知" }
              ),
            key: "/mailweb/SendmailView",
            show: isshow.value.id54,
          },
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/mailweb/Sendmail3View",
                  },
                },
                { default: () => "電量緊急派工" }
              ),
            key: "/mailweb/Sendmail3View",
            show: isshow.value.id61,
          },
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/mailweb/Sendmail2View",
                  },
                },
                { default: () => "場站告警" }
              ),
            key: "/mailweb/Sendmail2View",
            show: isshow.value.id56,
          },
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/mailweb/ListmailView",
                  },
                },
                { default: () => "場站告警名單" }
              ),
            key: "/mailweb/ListmailView",
            show: isshow.value.id57,
          },
        ],
      },
      {
        label: "簡訊",
        key: "message",
        icon: renderIcon(ChatboxEllipsesSharp),
        show: isshow.value.id55,
        children: [
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/message/sendMessage",
                  },
                },
                { default: () => "簡訊發送" }
              ),
            key: "/message/sendMessage",
            show: isshow.value.id55,
          },
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/message/sendFile",
                  },
                },
                { default: () => "上傳檔案發送" }
              ),
            key: "/message/sendFile",
            show: isshow.value.id58,
          },
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/message/searchData",
                  },
                },
                { default: () => "預約查詢" }
              ),
            key: "/message/searchData",
            show: isshow.value.id59,
          },
          {
            label: () =>
              h(
                RouterLink,

                {
                  to: {
                    path: "/message/CheckMessageView",
                  },
                },
                { default: () => "發送確認" }
              ),
            key: "/message/CheckMessageView",
            show: isshow.value.id60,
          },
        ],
      },
      {
        key: "Version",
        label: "版本v1.0.0",
        icon: renderIcon(Book),
      },
    ];
    menuOptions = [...menu];
  } catch (error) {
    console.log(error);
  }
}
ctrlmenu();

//pinia 上的page有變更才觸發,意思就是當有登入時cookie有傳入token才觸發
watchEffect(() => {
  //監聽role值
  if (store.page) {
    store.getdata();
    ctrlmenu();
  }
});

const options = [
  {
    label: "登出",
    key: "atlantis nahamas, nassau",
    props: {
      onClick: () => {
        document.cookie = "youbike=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/login");
      },
    },
  },
];

const routeValue = ref();
watchEffect(() => {
  routeValue.value = route.path;
});

const railStyle = ({ focused, checked }) => {
  const style = {};
  if (checked) {
    style.background = "#000000";
    if (focused) {
      style.boxShadow = "0 0 0 2px #d0305040";
    }
  } else {
    style.background = "#ff0100";
    if (focused) {
      style.boxShadow = "0 0 0 2px #2080f040";
    }
  }
  return style;
};
</script>

<style>
.n-menu-item-content__icon {
  margin-bottom: 5px;
}
</style>
