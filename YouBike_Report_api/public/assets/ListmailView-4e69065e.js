import{G as N,ak as y,X as h,H as r,K as j,M as A,O as z,T as L,a1 as P,Q as g,F as T,bU as V,i as D,r as C,o as F,c as O,e,b as f,w as p,d as v,k as U,bR as k,N as $,j as b}from"./index-57300d61.js";import{A as R}from"./AlertCircle-086c67b9.js";const E=N("divider",`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[y("vertical",`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[y("no-title",`
 display: flex;
 align-items: center;
 `)]),h("title",`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),r("title-position-left",[h("line",[r("left",{width:"28px"})])]),r("title-position-right",[h("line",[r("right",{width:"28px"})])]),r("dashed",[h("line",`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),r("vertical",`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),h("line",`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),y("dashed",[h("line",{backgroundColor:"var(--n-color)"})]),r("dashed",[h("line",{borderColor:"var(--n-color)"})]),r("vertical",{backgroundColor:"var(--n-color)"})]),H=Object.assign(Object.assign({},z.props),{titlePlacement:{type:String,default:"center"},dashed:Boolean,vertical:Boolean}),S=j({name:"Divider",props:H,setup(l){const{mergedClsPrefixRef:n,inlineThemeDisabled:a}=A(l),d=z("Divider","-divider",E,V,l,n),c=L(()=>{const{common:{cubicBezierEaseInOut:t},self:{color:_,textColor:x,fontWeight:s}}=d.value;return{"--n-bezier":t,"--n-color":_,"--n-text-color":x,"--n-font-weight":s}}),o=a?P("divider",void 0,c,l):void 0;return{mergedClsPrefix:n,cssVars:a?void 0:c,themeClass:o==null?void 0:o.themeClass,onRender:o==null?void 0:o.onRender}},render(){var l;const{$slots:n,titlePlacement:a,vertical:d,dashed:c,cssVars:o,mergedClsPrefix:t}=this;return(l=this.onRender)===null||l===void 0||l.call(this),g("div",{role:"separator",class:[`${t}-divider`,this.themeClass,{[`${t}-divider--vertical`]:d,[`${t}-divider--no-title`]:!n.default,[`${t}-divider--dashed`]:c,[`${t}-divider--title-position-${a}`]:n.default&&a}],style:o},d?null:g("div",{class:`${t}-divider__line ${t}-divider__line--left`}),!d&&n.default?g(T,null,g("div",{class:`${t}-divider__title`},this.$slots),g("div",{class:`${t}-divider__line ${t}-divider__line--right`})):null)}}),M={class:"container-fluid"},I=e("div",{class:"row mx-0 mb-3"},[e("h1",{class:"report-h1 fw-bold"},"簡訊發送")],-1),G={class:"row fw-bold d-flex"},K={class:"col-auto mb-1 d-flex"},Q={class:"my-auto"},W=e("span",{style:{"font-weight":"700"}},[b("1.請先下載範例檔案"),e("br"),b(" 2.編輯好資料後按選擇檔案"),e("br"),b("3.按儲存")],-1),X=e("span",{class:"ms-1 text-info"},"上傳方式",-1),q={class:"col-auto mb-1 d-flex"},J={class:"my-auto"},Y=e("span",{style:{"font-weight":"700"}},[b("每一筆資料為"),e("span",{style:{color:"red"}},"換行"),b("跟"),e("span",{style:{color:"red"}},","),b("區分")],-1),Z=e("span",{class:"ms-1 text-info"},"上傳格式",-1),ee={class:"row mb-3"},te={class:"col-auto mb-1"},ne={__name:"ListmailView",setup(l){const n=D("$swal");async function a(s){n({icon:"error",title:`${s}`,showConfirmButton:!1})}async function d(s){n({icon:"success",title:`${s}`,showConfirmButton:!1})}const c=C([]),o=C(null),t=s=>{const i=s.target.files[0];if(i.type!=="text/plain"){a("上傳格式必須為txt"),o.value.value=null;return}if(i){const m=new FileReader;m.onload=function(u){const B=u.target.result.split(`
`);c.value=B.map(w=>w.replace(",","")).filter(w=>w!=="")},m.readAsText(i)}};function _(){const s=`500119008,
500101187,
500101213,
500111086,`,i=new Blob([s],{type:"text/plain;charset=utf-8"}),m=URL.createObjectURL(i),u=document.createElement("a");u.href=m,u.download="範例檔",document.body.appendChild(u),u.click(),document.body.removeChild(u),URL.revokeObjectURL(m)}const x=async()=>{const s=c.value;try{const i="https://report.youbike.com.tw/mail/listmail";(await U.put(i,{carnum:s})).data.message==="編輯成功"&&(o.value.value=null,d("編輯成功"))}catch(i){console.log(i)}};return(s,i)=>(F(),O("div",M,[I,e("div",G,[e("div",K,[e("div",Q,[f(v($),{trigger:"hover"},{trigger:p(()=>[f(v(k),{size:"20",color:"#0DCAF0"},{default:p(()=>[f(v(R))]),_:1})]),default:p(()=>[W]),_:1}),X])]),e("div",q,[e("div",J,[f(v($),{trigger:"hover"},{trigger:p(()=>[f(v(k),{size:"20",color:"#0DCAF0"},{default:p(()=>[f(v(R))]),_:1})]),default:p(()=>[Y]),_:1}),Z])]),e("div",{class:"col-auto ms-auto"},[e("button",{class:"btn btn-primary fw-bold",onClick:_}," 下載範例檔案 ")])]),e("div",ee,[e("div",te,[e("input",{type:"file",class:"form-control",onChange:t,ref_key:"file",ref:o},null,544)])]),f(v(S)),e("div",{class:"row d-flex justify-content-center"},[e("button",{class:"btn btn-danger btn-lg",style:{width:"200px"},onClick:x}," 儲存 ")])]))}};export{ne as default};
