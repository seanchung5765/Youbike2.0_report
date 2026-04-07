import{G as N,ak as C,X as h,H as d,K as V,M as j,O as B,T as A,a1 as L,Q as b,F as P,bU as T,i as U,r as k,o as F,c as O,e,b as f,w as _,d as m,l as E,v as S,k as H,bR as $,N as R,j as p}from"./index-9c026bac.js";import{A as z}from"./AlertCircle-0998ea79.js";const M=N("divider",`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[C("vertical",`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[C("no-title",`
 display: flex;
 align-items: center;
 `)]),h("title",`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),d("title-position-left",[h("line",[d("left",{width:"28px"})])]),d("title-position-right",[h("line",[d("right",{width:"28px"})])]),d("dashed",[h("line",`
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
 `),h("line",`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),C("dashed",[h("line",{backgroundColor:"var(--n-color)"})]),d("dashed",[h("line",{borderColor:"var(--n-color)"})]),d("vertical",{backgroundColor:"var(--n-color)"})]),I=Object.assign(Object.assign({},B.props),{titlePlacement:{type:String,default:"center"},dashed:Boolean,vertical:Boolean}),G=V({name:"Divider",props:I,setup(a){const{mergedClsPrefixRef:l,inlineThemeDisabled:n}=j(a),c=B("Divider","-divider",M,T,a,l),u=A(()=>{const{common:{cubicBezierEaseInOut:t},self:{color:g,textColor:x,fontWeight:w}}=c.value;return{"--n-bezier":t,"--n-color":g,"--n-text-color":x,"--n-font-weight":w}}),o=n?L("divider",void 0,u,a):void 0;return{mergedClsPrefix:l,cssVars:n?void 0:u,themeClass:o==null?void 0:o.themeClass,onRender:o==null?void 0:o.onRender}},render(){var a;const{$slots:l,titlePlacement:n,vertical:c,dashed:u,cssVars:o,mergedClsPrefix:t}=this;return(a=this.onRender)===null||a===void 0||a.call(this),b("div",{role:"separator",class:[`${t}-divider`,this.themeClass,{[`${t}-divider--vertical`]:c,[`${t}-divider--no-title`]:!l.default,[`${t}-divider--dashed`]:u,[`${t}-divider--title-position-${n}`]:l.default&&n}],style:o},c?null:b("div",{class:`${t}-divider__line ${t}-divider__line--left`}),!c&&l.default?b(P,null,b("div",{class:`${t}-divider__title`},this.$slots),b("div",{class:`${t}-divider__line ${t}-divider__line--right`})):null)}}),K={class:"container-fluid"},Q=e("div",{class:"row mx-0 mb-3"},[e("h1",{class:"report-h1 fw-bold"},"簡訊發送")],-1),W={class:"row fw-bold d-flex"},X={class:"col-auto mb-1 d-flex"},q={class:"my-auto"},J=e("span",{style:{"font-weight":"700"}},[p("１.請先下載範例檔案"),e("br"),p(" ２.編輯好資料後按選擇檔案"),e("br"),p(" ３.選擇區域"),e("br"),p(" ４.按儲存 ")],-1),Y=e("span",{class:"ms-1 text-info"},"上傳方式",-1),Z={class:"col-auto mb-1 d-flex"},ee={class:"my-auto"},te=e("span",{style:{"font-weight":"700"}},[p("每一筆資料為"),e("span",{style:{color:"red"}},"換行"),p("跟"),e("span",{style:{color:"red"}},","),p("區分")],-1),oe=e("span",{class:"ms-1 text-info"},"上傳格式",-1),se={class:"row mb-3"},ie={class:"col-auto mb-1"},le=e("option",{disabled:"",value:"請選擇區域"},"請選擇區域",-1),ne=e("option",{value:"北區"},"北區",-1),ae=e("option",{value:"中區"},"中區",-1),re=e("option",{value:"南區"},"南區",-1),de=[le,ne,ae,re],ce={class:"col-auto mb-1"},fe={__name:"ListmailView",setup(a){const l=U("$swal");async function n(i){l({icon:"error",title:`${i}`,showConfirmButton:!1})}async function c(i){l({icon:"success",title:`${i}`,showConfirmButton:!1})}const u=k([]),o=k("請選擇區域"),t=k(null),g=i=>{const s=i.target.files[0];if(s.type!=="text/plain"){n("上傳格式必須為txt"),t.value.value=null;return}if(s){const r=new FileReader;r.onload=function(v){const D=v.target.result.split(`
`);u.value=D.map(y=>y.replace(",","")).filter(y=>y!=="")},r.readAsText(s)}};function x(){const i=`500119008,
500101187,
500101213,
500111086,`,s=new Blob([i],{type:"text/plain;charset=utf-8"}),r=URL.createObjectURL(s),v=document.createElement("a");v.href=r,v.download="範例檔",document.body.appendChild(v),v.click(),document.body.removeChild(v),URL.revokeObjectURL(r)}const w=async()=>{const i=u.value;if(o.value==="請選擇區域"){n("請選擇區域");return}else if(t.value.value===""){n("請選擇檔案");return}try{const s="https://report.youbike.com.tw/mail/listmail";(await H.put(s,{carnum:i,area:o.value})).data.message==="編輯成功"&&c("編輯成功")}catch(s){console.log(s)}finally{o.value="請選擇區域",t.value.value=null}};return(i,s)=>(F(),O("div",K,[Q,e("div",W,[e("div",X,[e("div",q,[f(m(R),{trigger:"hover"},{trigger:_(()=>[f(m($),{size:"20",color:"#0DCAF0"},{default:_(()=>[f(m(z))]),_:1})]),default:_(()=>[J]),_:1}),Y])]),e("div",Z,[e("div",ee,[f(m(R),{trigger:"hover"},{trigger:_(()=>[f(m($),{size:"20",color:"#0DCAF0"},{default:_(()=>[f(m(z))]),_:1})]),default:_(()=>[te]),_:1}),oe])]),e("div",{class:"col-auto ms-auto"},[e("button",{class:"btn btn-primary fw-bold",onClick:x}," 下載範例檔案 ")])]),e("div",se,[e("div",ie,[E(e("select",{class:"form-select","aria-label":"Default select example","onUpdate:modelValue":s[0]||(s[0]=r=>o.value=r)},de,512),[[S,o.value]])]),e("div",ce,[e("input",{type:"file",class:"form-control",onChange:g,ref_key:"file",ref:t},null,544)])]),f(m(G)),e("div",{class:"row d-flex justify-content-center"},[e("button",{class:"btn btn-danger btn-lg",style:{width:"200px"},onClick:w}," 儲存 ")])]))}};export{fe as default};
