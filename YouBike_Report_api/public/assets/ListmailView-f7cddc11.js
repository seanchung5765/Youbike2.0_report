import{G as S,ak as $,X as f,H as d,K as T,M as F,O as N,T as O,a1 as E,Q as g,F as U,bU as H,i as M,u as I,r as y,o as R,c as z,e as t,b as h,w as _,d as p,l as G,v as K,b3 as Q,k as W,bR as B,N as D,b4 as X,j as m}from"./index-cbe31fc3.js";import{A as L}from"./AlertCircle-97cd9029.js";const q=S("divider",`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[$("vertical",`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[$("no-title",`
 display: flex;
 align-items: center;
 `)]),f("title",`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),d("title-position-left",[f("line",[d("left",{width:"28px"})])]),d("title-position-right",[f("line",[d("right",{width:"28px"})])]),d("dashed",[f("line",`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),d("vertical",`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),f("line",`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),$("dashed",[f("line",{backgroundColor:"var(--n-color)"})]),d("dashed",[f("line",{borderColor:"var(--n-color)"})]),d("vertical",{backgroundColor:"var(--n-color)"})]),J=Object.assign(Object.assign({},N.props),{titlePlacement:{type:String,default:"center"},dashed:Boolean,vertical:Boolean}),Y=T({name:"Divider",props:J,setup(r){const{mergedClsPrefixRef:a,inlineThemeDisabled:b}=F(r),s=N("Divider","-divider",q,H,r,a),c=O(()=>{const{common:{cubicBezierEaseInOut:e},self:{color:C,textColor:x,fontWeight:u}}=s.value;return{"--n-bezier":e,"--n-color":C,"--n-text-color":x,"--n-font-weight":u}}),o=b?E("divider",void 0,c,r):void 0;return{mergedClsPrefix:a,cssVars:b?void 0:c,themeClass:o==null?void 0:o.themeClass,onRender:o==null?void 0:o.onRender}},render(){var r;const{$slots:a,titlePlacement:b,vertical:s,dashed:c,cssVars:o,mergedClsPrefix:e}=this;return(r=this.onRender)===null||r===void 0||r.call(this),g("div",{role:"separator",class:[`${e}-divider`,this.themeClass,{[`${e}-divider--vertical`]:s,[`${e}-divider--no-title`]:!a.default,[`${e}-divider--dashed`]:c,[`${e}-divider--title-position-${b}`]:a.default&&b}],style:o},s?null:g("div",{class:`${e}-divider__line ${e}-divider__line--left`}),!s&&a.default?g(U,null,g("div",{class:`${e}-divider__title`},this.$slots),g("div",{class:`${e}-divider__line ${e}-divider__line--right`})):null)}}),Z={class:"container-fluid"},ee=t("div",{class:"row mx-0 mb-3"},[t("h1",{class:"report-h1 fw-bold"},"簡訊發送")],-1),te={class:"row fw-bold d-flex"},se={class:"col-auto mb-1 d-flex"},ie={class:"my-auto"},le=t("span",{style:{"font-weight":"700"}},[m("１.請先下載範例檔案"),t("br"),m(" ２.編輯好資料後按選擇檔案"),t("br"),m(" ３.選擇區域"),t("br"),m(" ４.按儲存 ")],-1),oe=t("span",{class:"ms-1 text-info"},"上傳方式",-1),ne={class:"col-auto mb-1 d-flex"},ae={class:"my-auto"},re=t("span",{style:{"font-weight":"700"}},[m("每一筆資料為"),t("span",{style:{color:"red"}},"換行"),m("跟"),t("span",{style:{color:"red"}},","),m("區分")],-1),ce=t("span",{class:"ms-1 text-info"},"上傳格式",-1),de={class:"row mb-3"},ue={class:"col-auto mb-1"},ve=t("option",{disabled:"",value:"請選擇區域"},"請選擇區域",-1),fe=["value"],he={class:"col-auto mb-1"},_e={__name:"ListmailView",setup(r){const a=M("$swal"),s=I().citys;async function c(n){a({icon:"error",title:`${n}`,showConfirmButton:!1})}async function o(n){a({icon:"success",title:`${n}`,showConfirmButton:!1})}const e=y([]);function C(){s.includes(2)&&e.value.push("台北市"),s.includes(3)&&e.value.push("新北市"),s.includes(4)&&e.value.push("桃園市"),s.includes(5)&&e.value.push("新竹市"),s.includes(6)&&e.value.push("新竹縣"),s.includes(20)&&e.value.push("竹科"),s.includes(7)&&e.value.push("苗栗縣"),s.includes(8)&&e.value.push("台中市"),s.includes(12)&&e.value.push("嘉義市"),s.includes(13)&&e.value.push("嘉義縣"),s.includes(14)&&e.value.push("台南市"),s.includes(15)&&e.value.push("高雄市"),s.includes(16)&&e.value.push("屏東縣")}const x=y([]),u=y("請選擇區域"),w=y(null),V=n=>{const i=n.target.files[0];if(i.type!=="text/plain"){c("上傳格式必須為txt"),w.value.value=null;return}if(i){const l=new FileReader;l.onload=function(v){const P=v.target.result.split(`
`);x.value=P.map(k=>k.replace(",","")).filter(k=>k!=="")},l.readAsText(i)}};function j(){const n=`500119008,
500101187,
500101213,
500111086,`,i=new Blob([n],{type:"text/plain;charset=utf-8"}),l=URL.createObjectURL(i),v=document.createElement("a");v.href=l,v.download="範例檔",document.body.appendChild(v),v.click(),document.body.removeChild(v),URL.revokeObjectURL(l)}const A=async()=>{const n=x.value;if(u.value==="請選擇區域"){c("請選擇區域");return}else if(w.value.value===""){c("請選擇檔案");return}try{const i="https://report.youbike.com.tw/mail/listmail";(await W.put(i,{carnum:n,area:u.value})).data.message==="編輯成功"&&o("編輯成功")}catch(i){console.log(i)}finally{u.value="請選擇區域",w.value.value=null}};return C(),(n,i)=>(R(),z("div",Z,[ee,t("div",te,[t("div",se,[t("div",ie,[h(p(D),{trigger:"hover"},{trigger:_(()=>[h(p(B),{size:"20",color:"#0DCAF0"},{default:_(()=>[h(p(L))]),_:1})]),default:_(()=>[le]),_:1}),oe])]),t("div",ne,[t("div",ae,[h(p(D),{trigger:"hover"},{trigger:_(()=>[h(p(B),{size:"20",color:"#0DCAF0"},{default:_(()=>[h(p(L))]),_:1})]),default:_(()=>[re]),_:1}),ce])]),t("div",{class:"col-auto ms-auto"},[t("button",{class:"btn btn-primary fw-bold",onClick:j}," 下載範例檔案 ")])]),t("div",de,[t("div",ue,[G(t("select",{class:"form-select","aria-label":"Default select example","onUpdate:modelValue":i[0]||(i[0]=l=>u.value=l)},[ve,(R(!0),z(U,null,Q(e.value,l=>(R(),z("option",{value:l,key:l},X(l),9,fe))),128))],512),[[K,u.value]])]),t("div",he,[t("input",{type:"file",class:"form-control",onChange:V,ref_key:"file",ref:w},null,544)])]),h(p(Y)),t("div",{class:"row d-flex justify-content-center"},[t("button",{class:"btn btn-danger btn-lg",style:{width:"200px"},onClick:A}," 儲存 ")])]))}};export{_e as default};
