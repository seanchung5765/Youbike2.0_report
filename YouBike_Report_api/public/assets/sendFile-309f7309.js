import{A as H}from"./AlertCircle-5f910865.js";import{d1 as G,dA as J,dB as v,dC as C,bD as T,bO as h,bE as $,dD as Q,bF as X,a4 as Y,bH as Z,bI as L,c2 as oo,W as B,bR as eo,r as ro,ah as d,dE as no,aw as to,dd as so,c3 as lo,c9 as io,bS as co,cd as ao,bV as b,o as ho,c as uo,e as o,b as p,w as _,d as x,dx as W,N as k,h as y}from"./index-3459458a.js";import{E as bo,W as fo,I as go,S as vo}from"./Warning-fee88f9e.js";const Co=s=>{const{lineHeight:e,borderRadius:t,fontWeightStrong:i,baseColor:n,dividerColor:c,actionColor:P,textColor1:f,textColor2:a,closeColorHover:g,closeColorPressed:m,closeIconColor:I,closeIconColorHover:w,closeIconColorPressed:l,infoColor:r,successColor:z,warningColor:E,errorColor:S,fontSize:R}=s;return Object.assign(Object.assign({},J),{fontSize:R,lineHeight:e,titleFontWeight:i,borderRadius:t,border:`1px solid ${c}`,color:P,titleTextColor:f,iconColor:a,contentTextColor:a,closeBorderRadius:t,closeColorHover:g,closeColorPressed:m,closeIconColor:I,closeIconColorHover:w,closeIconColorPressed:l,borderInfo:`1px solid ${v(n,C(r,{alpha:.25}))}`,colorInfo:v(n,C(r,{alpha:.08})),titleTextColorInfo:f,iconColorInfo:r,contentTextColorInfo:a,closeColorHoverInfo:g,closeColorPressedInfo:m,closeIconColorInfo:I,closeIconColorHoverInfo:w,closeIconColorPressedInfo:l,borderSuccess:`1px solid ${v(n,C(z,{alpha:.25}))}`,colorSuccess:v(n,C(z,{alpha:.08})),titleTextColorSuccess:f,iconColorSuccess:z,contentTextColorSuccess:a,closeColorHoverSuccess:g,closeColorPressedSuccess:m,closeIconColorSuccess:I,closeIconColorHoverSuccess:w,closeIconColorPressedSuccess:l,borderWarning:`1px solid ${v(n,C(E,{alpha:.33}))}`,colorWarning:v(n,C(E,{alpha:.08})),titleTextColorWarning:f,iconColorWarning:E,contentTextColorWarning:a,closeColorHoverWarning:g,closeColorPressedWarning:m,closeIconColorWarning:I,closeIconColorHoverWarning:w,closeIconColorPressedWarning:l,borderError:`1px solid ${v(n,C(S,{alpha:.25}))}`,colorError:v(n,C(S,{alpha:.08})),titleTextColorError:f,iconColorError:S,contentTextColorError:a,closeColorHoverError:g,closeColorPressedError:m,closeIconColorError:I,closeIconColorHoverError:w,closeIconColorPressedError:l})},mo={name:"Alert",common:G,self:Co},po=mo,_o=T("alert",`
 line-height: var(--n-line-height);
 border-radius: var(--n-border-radius);
 position: relative;
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-color);
 text-align: start;
 word-break: break-word;
`,[h("border",`
 border-radius: inherit;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 transition: border-color .3s var(--n-bezier);
 border: var(--n-border);
 pointer-events: none;
 `),$("closable",[T("alert-body",[h("title",`
 padding-right: 24px;
 `)])]),h("icon",{color:"var(--n-icon-color)"}),T("alert-body",{padding:"var(--n-padding)"},[h("title",{color:"var(--n-title-text-color)"}),h("content",{color:"var(--n-content-text-color)"})]),Q({originalTransition:"transform .3s var(--n-bezier)",enterToProps:{transform:"scale(1)"},leaveToProps:{transform:"scale(0.9)"}}),h("icon",`
 position: absolute;
 left: 0;
 top: 0;
 align-items: center;
 justify-content: center;
 display: flex;
 width: var(--n-icon-size);
 height: var(--n-icon-size);
 font-size: var(--n-icon-size);
 margin: var(--n-icon-margin);
 `),h("close",`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 position: absolute;
 right: 0;
 top: 0;
 margin: var(--n-close-margin);
 `),$("show-icon",[T("alert-body",{paddingLeft:"calc(var(--n-icon-margin-left) + var(--n-icon-size) + var(--n-icon-margin-right))"})]),T("alert-body",`
 border-radius: var(--n-border-radius);
 transition: border-color .3s var(--n-bezier);
 `,[h("title",`
 transition: color .3s var(--n-bezier);
 font-size: 16px;
 line-height: 19px;
 font-weight: var(--n-title-font-weight);
 `,[X("& +",[h("content",{marginTop:"9px"})])]),h("content",{transition:"color .3s var(--n-bezier)",fontSize:"var(--n-font-size)"})]),h("icon",{transition:"color .3s var(--n-bezier)"})]),xo=Object.assign(Object.assign({},L.props),{title:String,showIcon:{type:Boolean,default:!0},type:{type:String,default:"default"},bordered:{type:Boolean,default:!0},closable:Boolean,onClose:Function,onAfterLeave:Function,onAfterHide:Function}),Io=Y({name:"Alert",inheritAttrs:!1,props:xo,setup(s){const{mergedClsPrefixRef:e,mergedBorderedRef:t,inlineThemeDisabled:i,mergedRtlRef:n}=Z(s),c=L("Alert","-alert",_o,po,s,e),P=oo("Alert",n,e),f=B(()=>{const{common:{cubicBezierEaseInOut:l},self:r}=c.value,{fontSize:z,borderRadius:E,titleFontWeight:S,lineHeight:R,iconSize:F,iconMargin:A,iconMarginRtl:N,closeIconSize:j,closeBorderRadius:O,closeSize:V,closeMargin:M,closeMarginRtl:U,padding:D}=r,{type:u}=s,{left:K,right:q}=ao(A);return{"--n-bezier":l,"--n-color":r[b("color",u)],"--n-close-icon-size":j,"--n-close-border-radius":O,"--n-close-color-hover":r[b("closeColorHover",u)],"--n-close-color-pressed":r[b("closeColorPressed",u)],"--n-close-icon-color":r[b("closeIconColor",u)],"--n-close-icon-color-hover":r[b("closeIconColorHover",u)],"--n-close-icon-color-pressed":r[b("closeIconColorPressed",u)],"--n-icon-color":r[b("iconColor",u)],"--n-border":r[b("border",u)],"--n-title-text-color":r[b("titleTextColor",u)],"--n-content-text-color":r[b("contentTextColor",u)],"--n-line-height":R,"--n-border-radius":E,"--n-font-size":z,"--n-title-font-weight":S,"--n-icon-size":F,"--n-icon-margin":A,"--n-icon-margin-rtl":N,"--n-close-size":V,"--n-close-margin":M,"--n-close-margin-rtl":U,"--n-padding":D,"--n-icon-margin-left":K,"--n-icon-margin-right":q}}),a=i?eo("alert",B(()=>s.type[0]),f,s):void 0,g=ro(!0),m=()=>{const{onAfterLeave:l,onAfterHide:r}=s;l&&l(),r&&r()};return{rtlEnabled:P,mergedClsPrefix:e,mergedBordered:t,visible:g,handleCloseClick:()=>{var l;Promise.resolve((l=s.onClose)===null||l===void 0?void 0:l.call(s)).then(r=>{r!==!1&&(g.value=!1)})},handleAfterLeave:()=>{m()},mergedTheme:c,cssVars:i?void 0:f,themeClass:a==null?void 0:a.themeClass,onRender:a==null?void 0:a.onRender}},render(){var s;return(s=this.onRender)===null||s===void 0||s.call(this),d(no,{onAfterLeave:this.handleAfterLeave},{default:()=>{const{mergedClsPrefix:e,$slots:t}=this,i={class:[`${e}-alert`,this.themeClass,this.closable&&`${e}-alert--closable`,this.showIcon&&`${e}-alert--show-icon`,this.rtlEnabled&&`${e}-alert--rtl`],style:this.cssVars,role:"alert"};return this.visible?d("div",Object.assign({},to(this.$attrs,i)),this.closable&&d(so,{clsPrefix:e,class:`${e}-alert__close`,onClick:this.handleCloseClick}),this.bordered&&d("div",{class:`${e}-alert__border`}),this.showIcon&&d("div",{class:`${e}-alert__icon`,"aria-hidden":"true"},lo(t.icon,()=>[d(io,{clsPrefix:e},{default:()=>{switch(this.type){case"success":return d(vo,null);case"info":return d(go,null);case"warning":return d(fo,null);case"error":return d(bo,null);default:return null}}})])),d("div",{class:[`${e}-alert-body`,this.mergedBordered&&`${e}-alert-body--bordered`]},co(t.header,n=>{const c=n||this.title;return c?d("div",{class:`${e}-alert-body__title`},c):null}),t.default&&d("div",{class:`${e}-alert-body__content`},t))):null}})}}),wo={class:"container-fluid"},yo=o("div",{class:"row mx-0 mb-3"},[o("h1",{class:"report-h1 fw-bold"},"簡訊發送")],-1),zo={class:"row fw-bold d-flex"},Eo={class:"col-auto mb-1 d-flex"},So={class:"my-auto"},To=o("span",{style:{"font-weight":"700"}},"請事先下載範例檔案，編輯好資料後直接上傳",-1),Po=o("span",{class:"ms-1 text-info"},"上傳方式",-1),Ro={class:"col-auto mb-1 d-flex"},Ao={class:"my-auto"},Ho=o("span",{style:{"font-weight":"700"}},[y("1. 手機號碼&簡訊內容"),o("br"),y("2. 換行為資料與資料間的分隔符號")],-1),$o=o("span",{class:"ms-1 text-info"},"上傳格式",-1),Bo={class:"row mb-3"},Wo={class:"col-auto mb-1"},ko={class:"row mb-3"},Lo={class:"col"},Fo=o("br",null,null,-1),No=o("br",null,null,-1),jo=o("br",null,null,-1),Oo={class:"row d-flex justify-content-center"},Do={__name:"sendFile",setup(s){function e(){const t=`0912345678&好久不見，你好嗎?
0922104075&I love U
0960778857&忘了您的名字，真不好意思`,i=new Blob([t],{type:"text/plain;charset=utf-8"}),n=URL.createObjectURL(i),c=document.createElement("a");c.href=n,c.download="範例檔(請使用記事本開啟)",document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(n)}return(t,i)=>(ho(),uo("div",wo,[yo,o("div",zo,[o("div",Eo,[o("div",So,[p(x(k),{trigger:"hover"},{trigger:_(()=>[p(x(W),{size:"20",color:"#0DCAF0"},{default:_(()=>[p(x(H))]),_:1})]),default:_(()=>[To]),_:1}),Po])]),o("div",Ro,[o("div",Ao,[p(x(k),{trigger:"hover"},{trigger:_(()=>[p(x(W),{size:"20",color:"#0DCAF0"},{default:_(()=>[p(x(H))]),_:1})]),default:_(()=>[Ho]),_:1}),$o])]),o("div",{class:"col-auto ms-auto"},[o("button",{class:"btn btn-primary fw-bold",onClick:e}," 下載範例檔案 ")])]),o("div",Bo,[o("div",Wo,[o("input",{type:"file",class:"form-control",onChange:i[0]||(i[0]=(...n)=>t.Excelhandler&&t.Excelhandler(...n)),ref:"file"},null,544)])]),o("div",ko,[o("div",Lo,[p(x(Io),{title:"注意事項",type:"info"},{default:_(()=>[y(" 1.注意事項111111 "),Fo,y(" 2.注意事項222222"),No,y(" 3.注意事項333333 "),jo,y(" 4.注意事項444444 ")]),_:1})])]),o("div",Oo,[o("button",{class:"btn btn-danger btn-lg",style:{width:"200px"},onClick:i[1]||(i[1]=(...n)=>t.submit&&t.submit(...n))}," 發送 ")])]))}};export{Do as default};
