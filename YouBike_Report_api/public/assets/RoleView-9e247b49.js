import{be as oe,b9 as re,K as W,M as K,O as I,ao as J,T as O,aE as ae,Q as D,a6 as F,bf as le,aF as q,I as c,G as U,H as G,ak as ne,aZ as se,a_ as de,a1 as ce,bg as ie,i as Q,r as z,o as w,c as k,b as P,d as S,L as Z,w as T,bh as ue,e as l,x as pe,f as he,m as N,F as L,b3 as H,l as be,bi as ge,b4 as X,k as E}from"./index-bfe704f8.js";import{N as ve}from"./Modal-4cff424a.js";import{a as me,N as fe}from"./FormItem-7e4ad271.js";import{g as ye}from"./get-slot-1efb97e5.js";import"./Warning-78a4a0d5.js";const _e=()=>oe,we={name:"Space",self:_e},ke=we;let A;const xe=()=>{if(!re)return!0;if(A===void 0){const e=document.createElement("div");e.style.display="flex",e.style.flexDirection="column",e.style.rowGap="1px",e.appendChild(document.createElement("div")),e.appendChild(document.createElement("div")),document.body.appendChild(e);const t=e.scrollHeight===1;return document.body.removeChild(e),A=t}return A},Ce=Object.assign(Object.assign({},I.props),{align:String,justify:{type:String,default:"start"},inline:Boolean,vertical:Boolean,size:{type:[String,Number,Array],default:"medium"},wrapItem:{type:Boolean,default:!0},itemStyle:[String,Object],wrap:{type:Boolean,default:!0},internalUseGap:{type:Boolean,default:void 0}}),$e=W({name:"Space",props:Ce,setup(e){const{mergedClsPrefixRef:t,mergedRtlRef:s}=K(e),o=I("Space","-space",void 0,ke,e,t),x=J("Space",s,t);return{useGap:xe(),rtlEnabled:x,mergedClsPrefix:t,margin:O(()=>{const{size:r}=e;if(Array.isArray(r))return{horizontal:r[0],vertical:r[1]};if(typeof r=="number")return{horizontal:r,vertical:r};const{self:{[F("gap",r)]:f}}=o.value,{row:m,col:y}=le(f);return{horizontal:q(y),vertical:q(m)}})}},render(){const{vertical:e,align:t,inline:s,justify:o,itemStyle:x,margin:r,wrap:f,mergedClsPrefix:m,rtlEnabled:y,useGap:g,wrapItem:i,internalUseGap:v}=this,p=ae(ye(this));if(!p.length)return null;const b=`${r.horizontal}px`,C=`${r.horizontal/2}px`,V=`${r.vertical}px`,B=`${r.vertical/2}px`,a=p.length-1,h=o.startsWith("space-");return D("div",{role:"none",class:[`${m}-space`,y&&`${m}-space--rtl`],style:{display:s?"inline-flex":"flex",flexDirection:e?"column":"row",justifyContent:["start","end"].includes(o)?"flex-"+o:o,flexWrap:!f||e?"nowrap":"wrap",marginTop:g||e?"":`-${B}`,marginBottom:g||e?"":`-${B}`,alignItems:t,gap:g?`${r.vertical}px ${r.horizontal}px`:""}},!i&&(g||v)?p:p.map((n,d)=>D("div",{role:"none",style:[x,{maxWidth:"100%"},g?"":e?{marginBottom:d!==a?V:""}:y?{marginLeft:h?o==="space-between"&&d===a?"":C:d!==a?b:"",marginRight:h?o==="space-between"&&d===0?"":C:"",paddingTop:B,paddingBottom:B}:{marginRight:h?o==="space-between"&&d===a?"":C:d!==a?b:"",marginLeft:h?o==="space-between"&&d===0?"":C:"",paddingTop:B,paddingBottom:B}]},n)))}}),Be=c([U("table",`
 font-size: var(--n-font-size);
 font-variant-numeric: tabular-nums;
 line-height: var(--n-line-height);
 width: 100%;
 border-radius: var(--n-border-radius) var(--n-border-radius) 0 0;
 text-align: left;
 border-collapse: separate;
 border-spacing: 0;
 overflow: hidden;
 background-color: var(--n-td-color);
 border-color: var(--n-merged-border-color);
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 --n-merged-border-color: var(--n-border-color);
 `,[c("th",`
 white-space: nowrap;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 text-align: inherit;
 padding: var(--n-th-padding);
 vertical-align: inherit;
 text-transform: none;
 border: 0px solid var(--n-merged-border-color);
 font-weight: var(--n-th-font-weight);
 color: var(--n-th-text-color);
 background-color: var(--n-th-color);
 border-bottom: 1px solid var(--n-merged-border-color);
 border-right: 1px solid var(--n-merged-border-color);
 `,[c("&:last-child",`
 border-right: 0px solid var(--n-merged-border-color);
 `)]),c("td",`
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 padding: var(--n-td-padding);
 color: var(--n-td-text-color);
 background-color: var(--n-td-color);
 border: 0px solid var(--n-merged-border-color);
 border-right: 1px solid var(--n-merged-border-color);
 border-bottom: 1px solid var(--n-merged-border-color);
 `,[c("&:last-child",`
 border-right: 0px solid var(--n-merged-border-color);
 `)]),G("bordered",`
 border: 1px solid var(--n-merged-border-color);
 border-radius: var(--n-border-radius);
 `,[c("tr",[c("&:last-child",[c("td",`
 border-bottom: 0 solid var(--n-merged-border-color);
 `)])])]),G("single-line",[c("th",`
 border-right: 0px solid var(--n-merged-border-color);
 `),c("td",`
 border-right: 0px solid var(--n-merged-border-color);
 `)]),G("single-column",[c("tr",[c("&:not(:last-child)",[c("td",`
 border-bottom: 0px solid var(--n-merged-border-color);
 `)])])]),G("striped",[c("tr:nth-of-type(even)",[c("td","background-color: var(--n-td-color-striped)")])]),ne("bottom-bordered",[c("tr",[c("&:last-child",[c("td",`
 border-bottom: 0px solid var(--n-merged-border-color);
 `)])])])]),se(U("table",`
 background-color: var(--n-td-color-modal);
 --n-merged-border-color: var(--n-border-color-modal);
 `,[c("th",`
 background-color: var(--n-th-color-modal);
 `),c("td",`
 background-color: var(--n-td-color-modal);
 `)])),de(U("table",`
 background-color: var(--n-td-color-popover);
 --n-merged-border-color: var(--n-border-color-popover);
 `,[c("th",`
 background-color: var(--n-th-color-popover);
 `),c("td",`
 background-color: var(--n-td-color-popover);
 `)]))]),ze=Object.assign(Object.assign({},I.props),{bordered:{type:Boolean,default:!0},bottomBordered:{type:Boolean,default:!0},singleLine:{type:Boolean,default:!0},striped:Boolean,singleColumn:Boolean,size:{type:String,default:"medium"}}),Ee=W({name:"Table",props:ze,setup(e){const{mergedClsPrefixRef:t,inlineThemeDisabled:s,mergedRtlRef:o}=K(e),x=I("Table","-table",Be,ie,e,t),r=J("Table",o,t),f=O(()=>{const{size:y}=e,{self:{borderColor:g,tdColor:i,tdColorModal:v,tdColorPopover:p,thColor:b,thColorModal:C,thColorPopover:V,thTextColor:B,tdTextColor:a,borderRadius:h,thFontWeight:n,lineHeight:d,borderColorModal:_,borderColorPopover:j,tdColorStriped:R,tdColorStripedModal:M,tdColorStripedPopover:$,[F("fontSize",y)]:u,[F("tdPadding",y)]:Y,[F("thPadding",y)]:ee},common:{cubicBezierEaseInOut:te}}=x.value;return{"--n-bezier":te,"--n-td-color":i,"--n-td-color-modal":v,"--n-td-color-popover":p,"--n-td-text-color":a,"--n-border-color":g,"--n-border-color-modal":_,"--n-border-color-popover":j,"--n-border-radius":h,"--n-font-size":u,"--n-th-color":b,"--n-th-color-modal":C,"--n-th-color-popover":V,"--n-th-font-weight":n,"--n-th-text-color":B,"--n-line-height":d,"--n-td-padding":Y,"--n-th-padding":ee,"--n-td-color-striped":R,"--n-td-color-striped-modal":M,"--n-td-color-striped-popover":$}}),m=s?ce("table",O(()=>e.size[0]),f,e):void 0;return{rtlEnabled:r,mergedClsPrefix:t,cssVars:s?void 0:f,themeClass:m==null?void 0:m.themeClass,onRender:m==null?void 0:m.onRender}},render(){var e;const{mergedClsPrefix:t}=this;return(e=this.onRender)===null||e===void 0||e.call(this),D("table",{class:[`${t}-table`,this.themeClass,{[`${t}-table--rtl`]:this.rtlEnabled,[`${t}-table--bottom-bordered`]:this.bottomBordered,[`${t}-table--bordered`]:this.bordered,[`${t}-table--single-line`]:this.singleLine,[`${t}-table--single-column`]:this.singleColumn,[`${t}-table--striped`]:this.striped}],style:this.cssVars},this.$slots)}}),Se={key:0,class:"mt-2"},Pe={key:1,class:"mt-2"},Re={key:2,class:"mt-2"},Me={key:3,class:"mt-2"},Ne={key:4,class:"mt-2"},Te={key:5,class:"mt-2"},Le=["onUpdate:modelValue","disabled","id"],Ve=["for"],je=l("div",null,null,-1),Ge={__name:"RolepageAlert",props:{isopen:{type:Boolean,required:!0},title:{type:String,required:!0},data:{type:Array,required:!0},use:{type:String,required:!0,validator(e){return["look","edit","add",""].includes(e)}},clickid:{type:Number}},emits:["closemodel","getrolelist"],setup(e,{emit:t}){const s=e,o=Q("$swal");async function x(g){o({icon:"error",title:`${g}`,showConfirmButton:!1})}const r=z(!1),f=z(),m=()=>{t("closemodel")},y=async()=>{if(s.use==="look")return m();if(s.use==="edit"){const g=[...s.data],i=[];g.forEach(p=>{p.forEach(b=>{b.isselect&&i.push({page_id:b.page_id,role_id:s.clickid})})}),r.value=!0;const v=`http://127.0.0.1:3000/isauth/role/${s.clickid}`;r.value=!1,t("closemodel"),await E.put(v,i)}else if(s.use==="add"){if(!f.value)return t("closemodel"),x("請填寫角色名稱");const g="http://127.0.0.1:3000/isauth/role",i=[];s.data.forEach(b=>{b.forEach(C=>{C.isselect&&i.push({page_id:C.page_id})})});const p={name:f.value,payload:[...i]};try{r.value=!0,await E.post(g,p),r.value=!1,t("closemodel")}catch{return t("closemodel"),x("新增角色失敗")}return f.value=null,t("getrolelist"),t("closemodel")}};return(g,i)=>(w(),k(L,null,[P(S(Z),{active:r.value,"onUpdate:active":i[0]||(i[0]=v=>r.value=v),"can-cancel":!1,"is-full-page":!0},null,8,["active"]),P(S(ve),{show:s.isopen,"onUpdate:show":i[2]||(i[2]=v=>s.isopen=v),"mask-closable":!1},{default:T(()=>[P(S(ue),{style:{"max-width":"1000px"},preset:"card",title:s.title},{default:T(()=>[l("div",null,[P(S(me),null,{default:T(()=>[s.use=="add"?(w(),pe(S(fe),{key:0,label:"角色名稱",path:"inputValue"},{default:T(()=>[P(S(he),{placeholder:"請輸入",value:f.value,"onUpdate:value":i[1]||(i[1]=v=>f.value=v)},null,8,["value"])]),_:1})):N("",!0),(w(!0),k(L,null,H(s.data,(v,p)=>(w(),k(L,{key:`${p}111`},[p===0?(w(),k("h3",Se,"營運報表")):N("",!0),p===1?(w(),k("h3",Pe,"網站管理")):N("",!0),p===2?(w(),k("h3",Re,"會員資料")):N("",!0),p===3?(w(),k("h3",Me,"抽獎網站")):N("",!0),p===4?(w(),k("h3",Ne,"異常通知")):N("",!0),p===5?(w(),k("h3",Te,"簡訊")):N("",!0),(w(!0),k(L,null,H(v,b=>(w(),k("div",{key:b.page_id,class:"form-check form-check-inline"},[be(l("input",{class:"form-check-input",type:"checkbox","onUpdate:modelValue":C=>b.isselect=C,disabled:s.use==="look",id:b.page_name},null,8,Le),[[ge,b.isselect]]),l("label",{class:"form-check-label",for:b.page_name},X(b.page_name),9,Ve)]))),128))],64))),128)),l("div",{style:{display:"flex","justify-content":"flex-end"},class:"mt-3"},[l("button",{type:"buttno",class:"btn btn-secondary me-3",onClick:m}," 取消 "),l("button",{type:"button",class:"btn btn-success",onClick:y}," 確定 ")])]),_:1})])]),_:1},8,["title"])]),_:1},8,["show"]),je],64))}},Fe={class:"container-fluid px-0"},Ie=l("h1",{class:"report-h1 fw-bold"},"角色權限管理",-1),Ue=l("thead",null,[l("tr",null,[l("th",null,"角色名稱"),l("th",null,"功能"),l("th",null,"功能"),l("th",null,"功能")])],-1),Ae=["onClick"],Oe=["onClick"],De=["onClick"],Qe={__name:"RoleView",setup(e){const t=Q("$swal");async function s(a,h){const n={title:`確定刪除 "${h}" 嗎`,text:"刪除了將不可復原",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"是的",cancelButtonText:"取消"};if((await t(n)).isConfirmed)try{o.value=!0;const _=`http://127.0.0.1:3000/isauth/role/${a}`;await E.delete(_),o.value=!1}catch(_){console.log(_)}}const o=z(!1),x=z(""),r=z(!1),f=z(null),m=z([]),y=z([]),g=async()=>{try{o.value=!0;const a="http://127.0.0.1:3000/isauth/roles",h=await E.get(a);m.value=[...h.data.rows],o.value=!1}catch(a){console.log(a)}};(async function(){await g()})();const i=z(""),v=()=>{r.value=!0},p=async(a,h)=>{try{i.value=h,v();const n=`http://127.0.0.1:3000/isauth/role_pages/${a}`,d="http://127.0.0.1:3000/isauth/pages";o.value=!0;const _=await Promise.all([E.get(n),E.get(d)]);o.value=!1;const j=_[0].data.rows,R=_[1].data.rows,M=[];j.forEach(u=>{M.push(u.page_id)}),R.forEach(u=>{M.includes(u.page_id)?u.isselect=!0:u.isselect=!1});const $=[];R.forEach(u=>{$.length<u.page_type&&$.push([]),$[u.page_type-1].push(u)}),y.value=[...$],x.value="look"}catch(n){console.log(n)}},b=async(a,h)=>{x.value="edit",i.value=h,f.value=a,v();const n=`http://127.0.0.1:3000/isauth/role_pages/${a}`,d="http://127.0.0.1:3000/isauth/pages";o.value=!0;const _=await Promise.all([E.get(n),E.get(d)]);o.value=!1;const j=_[0].data.rows,R=_[1].data.rows,M=[];j.forEach(u=>{M.push(u.page_id)}),R.forEach(u=>{M.includes(u.page_id)?u.isselect=!0:u.isselect=!1});const $=[];R.forEach(u=>{$.length<u.page_type&&$.push([]),$[u.page_type-1].push(u)}),y.value=[...$]},C=async(a,h)=>{await s(a,h),await g()},V=async()=>{try{x.value="add",v();const a="http://127.0.0.1:3000/isauth/pages";o.value=!0;const n=(await Promise.all([await E.get(a)]))[0].data.rows;o.value=!1;const d=[];n.forEach(_=>{d.length<_.page_type&&d.push([]),d[_.page_type-1].push({isselect:!1,..._})}),i.value="新增角色",y.value=[...d]}catch(a){console.log(a)}},B=async()=>{r.value=!1};return(a,h)=>(w(),k(L,null,[l("div",Fe,[P(S(Z),{active:o.value,"onUpdate:active":h[0]||(h[0]=n=>o.value=n),"can-cancel":!1,"is-full-page":!0},null,8,["active"]),l("div",{class:"row mx-0"},[Ie,l("div",{class:"px-0 pb-2 d-flex justify-content-end"},[l("button",{type:"button",class:"btn btn-success",onClick:V}," 新增角色 ")])]),P(S($e),{vertical:""},{default:T(()=>[P(S(Ee),{striped:""},{default:T(()=>[Ue,l("tbody",null,[(w(!0),k(L,null,H(m.value,n=>(w(),k("tr",{key:n.role_id},[l("td",null,X(n.role_name),1),l("td",null,[l("button",{type:"button",class:"btn btn-success",onClick:d=>p(n.role_id,n.role_name)}," 查看 ",8,Ae)]),l("td",null,[l("button",{type:"button",class:"btn btn-primary",onClick:d=>b(n.role_id,n.role_name)}," 編輯 ",8,Oe)]),l("td",null,[l("button",{type:"button",class:"btn btn-danger",onClick:d=>C(n.role_id,n.role_name)}," 刪除 ",8,De)])]))),128))])]),_:1})]),_:1})]),P(Ge,{isopen:r.value,onClosemodel:B,title:i.value,clickid:f.value,data:y.value,use:x.value,onGetrolelist:g},null,8,["isopen","title","clickid","data","use"])],64))}};export{Qe as default};
