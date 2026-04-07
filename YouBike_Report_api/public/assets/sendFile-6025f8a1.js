import{A as H}from"./AlertCircle-0998ea79.js";import{b6 as X,bV as G,bW as v,bX as C,G as E,X as u,H as $,bY as Q,I as Y,K as Z,M as J,O as L,ao as oo,T as W,a1 as eo,r as ro,Q as d,bZ as no,aA as to,bq as so,ap as lo,aq as io,a3 as ao,b_ as co,a6 as b,o as uo,c as ho,e as o,b as p,w as _,d as x,bR as k,N as B,j as w}from"./index-9c026bac.js";import{E as bo,W as fo,I as go,S as vo}from"./Warning-46e51409.js";const Co=s=>{const{lineHeight:e,borderRadius:t,fontWeightStrong:i,baseColor:n,dividerColor:a,actionColor:P,textColor1:f,textColor2:c,closeColorHover:g,closeColorPressed:m,closeIconColor:I,closeIconColorHover:y,closeIconColorPressed:l,infoColor:r,successColor:z,warningColor:T,errorColor:S,fontSize:R}=s;return Object.assign(Object.assign({},G),{fontSize:R,lineHeight:e,titleFontWeight:i,borderRadius:t,border:`1px solid ${a}`,color:P,titleTextColor:f,iconColor:c,contentTextColor:c,closeBorderRadius:t,closeColorHover:g,closeColorPressed:m,closeIconColor:I,closeIconColorHover:y,closeIconColorPressed:l,borderInfo:`1px solid ${v(n,C(r,{alpha:.25}))}`,colorInfo:v(n,C(r,{alpha:.08})),titleTextColorInfo:f,iconColorInfo:r,contentTextColorInfo:c,closeColorHoverInfo:g,closeColorPressedInfo:m,closeIconColorInfo:I,closeIconColorHoverInfo:y,closeIconColorPressedInfo:l,borderSuccess:`1px solid ${v(n,C(z,{alpha:.25}))}`,colorSuccess:v(n,C(z,{alpha:.08})),titleTextColorSuccess:f,iconColorSuccess:z,contentTextColorSuccess:c,closeColorHoverSuccess:g,closeColorPressedSuccess:m,closeIconColorSuccess:I,closeIconColorHoverSuccess:y,closeIconColorPressedSuccess:l,borderWarning:`1px solid ${v(n,C(T,{alpha:.33}))}`,colorWarning:v(n,C(T,{alpha:.08})),titleTextColorWarning:f,iconColorWarning:T,contentTextColorWarning:c,closeColorHoverWarning:g,closeColorPressedWarning:m,closeIconColorWarning:I,closeIconColorHoverWarning:y,closeIconColorPressedWarning:l,borderError:`1px solid ${v(n,C(S,{alpha:.25}))}`,colorError:v(n,C(S,{alpha:.08})),titleTextColorError:f,iconColorError:S,contentTextColorError:c,closeColorHoverError:g,closeColorPressedError:m,closeIconColorError:I,closeIconColorHoverError:y,closeIconColorPressedError:l})},mo={name:"Alert",common:X,self:Co},po=mo,_o=E("alert",`
 line-height: var(--n-line-height);
 border-radius: var(--n-border-radius);
 position: relative;
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-color);
 text-align: start;
 word-break: break-word;
`,[u("border",`
 border-radius: inherit;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 transition: border-color .3s var(--n-bezier);
 border: var(--n-border);
 pointer-events: none;
 `),$("closable",[E("alert-body",[u("title",`
 padding-right: 24px;
 `)])]),u("icon",{color:"var(--n-icon-color)"}),E("alert-body",{padding:"var(--n-padding)"},[u("title",{color:"var(--n-title-text-color)"}),u("content",{color:"var(--n-content-text-color)"})]),Q({originalTransition:"transform .3s var(--n-bezier)",enterToProps:{transform:"scale(1)"},leaveToProps:{transform:"scale(0.9)"}}),u("icon",`
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
 `),u("close",`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 position: absolute;
 right: 0;
 top: 0;
 margin: var(--n-close-margin);
 `),$("show-icon",[E("alert-body",{paddingLeft:"calc(var(--n-icon-margin-left) + var(--n-icon-size) + var(--n-icon-margin-right))"})]),E("alert-body",`
 border-radius: var(--n-border-radius);
 transition: border-color .3s var(--n-bezier);
 `,[u("title",`
 transition: color .3s var(--n-bezier);
 font-size: 16px;
 line-height: 19px;
 font-weight: var(--n-title-font-weight);
 `,[Y("& +",[u("content",{marginTop:"9px"})])]),u("content",{transition:"color .3s var(--n-bezier)",fontSize:"var(--n-font-size)"})]),u("icon",{transition:"color .3s var(--n-bezier)"})]),xo=Object.assign(Object.assign({},L.props),{title:String,showIcon:{type:Boolean,default:!0},type:{type:String,default:"default"},bordered:{type:Boolean,default:!0},closable:Boolean,onClose:Function,onAfterLeave:Function,onAfterHide:Function}),Io=Z({name:"Alert",inheritAttrs:!1,props:xo,setup(s){const{mergedClsPrefixRef:e,mergedBorderedRef:t,inlineThemeDisabled:i,mergedRtlRef:n}=J(s),a=L("Alert","-alert",_o,po,s,e),P=oo("Alert",n,e),f=W(()=>{const{common:{cubicBezierEaseInOut:l},self:r}=a.value,{fontSize:z,borderRadius:T,titleFontWeight:S,lineHeight:R,iconSize:j,iconMargin:A,iconMarginRtl:F,closeIconSize:N,closeBorderRadius:O,closeSize:V,closeMargin:M,closeMarginRtl:U,padding:D}=r,{type:h}=s,{left:q,right:K}=co(A);return{"--n-bezier":l,"--n-color":r[b("color",h)],"--n-close-icon-size":N,"--n-close-border-radius":O,"--n-close-color-hover":r[b("closeColorHover",h)],"--n-close-color-pressed":r[b("closeColorPressed",h)],"--n-close-icon-color":r[b("closeIconColor",h)],"--n-close-icon-color-hover":r[b("closeIconColorHover",h)],"--n-close-icon-color-pressed":r[b("closeIconColorPressed",h)],"--n-icon-color":r[b("iconColor",h)],"--n-border":r[b("border",h)],"--n-title-text-color":r[b("titleTextColor",h)],"--n-content-text-color":r[b("contentTextColor",h)],"--n-line-height":R,"--n-border-radius":T,"--n-font-size":z,"--n-title-font-weight":S,"--n-icon-size":j,"--n-icon-margin":A,"--n-icon-margin-rtl":F,"--n-close-size":V,"--n-close-margin":M,"--n-close-margin-rtl":U,"--n-padding":D,"--n-icon-margin-left":q,"--n-icon-margin-right":K}}),c=i?eo("alert",W(()=>s.type[0]),f,s):void 0,g=ro(!0),m=()=>{const{onAfterLeave:l,onAfterHide:r}=s;l&&l(),r&&r()};return{rtlEnabled:P,mergedClsPrefix:e,mergedBordered:t,visible:g,handleCloseClick:()=>{var l;Promise.resolve((l=s.onClose)===null||l===void 0?void 0:l.call(s)).then(r=>{r!==!1&&(g.value=!1)})},handleAfterLeave:()=>{m()},mergedTheme:a,cssVars:i?void 0:f,themeClass:c==null?void 0:c.themeClass,onRender:c==null?void 0:c.onRender}},render(){var s;return(s=this.onRender)===null||s===void 0||s.call(this),d(no,{onAfterLeave:this.handleAfterLeave},{default:()=>{const{mergedClsPrefix:e,$slots:t}=this,i={class:[`${e}-alert`,this.themeClass,this.closable&&`${e}-alert--closable`,this.showIcon&&`${e}-alert--show-icon`,this.rtlEnabled&&`${e}-alert--rtl`],style:this.cssVars,role:"alert"};return this.visible?d("div",Object.assign({},to(this.$attrs,i)),this.closable&&d(so,{clsPrefix:e,class:`${e}-alert__close`,onClick:this.handleCloseClick}),this.bordered&&d("div",{class:`${e}-alert__border`}),this.showIcon&&d("div",{class:`${e}-alert__icon`,"aria-hidden":"true"},lo(t.icon,()=>[d(io,{clsPrefix:e},{default:()=>{switch(this.type){case"success":return d(vo,null);case"info":return d(go,null);case"warning":return d(fo,null);case"error":return d(bo,null);default:return null}}})])),d("div",{class:[`${e}-alert-body`,this.mergedBordered&&`${e}-alert-body--bordered`]},ao(t.header,n=>{const a=n||this.title;return a?d("div",{class:`${e}-alert-body__title`},a):null}),t.default&&d("div",{class:`${e}-alert-body__content`},t))):null}})}}),yo={class:"container-fluid"},wo=o("div",{class:"row mx-0 mb-3"},[o("h1",{class:"report-h1 fw-bold"},"簡訊發送")],-1),zo={class:"row fw-bold d-flex"},To={class:"col-auto mb-1 d-flex"},So={class:"my-auto"},Eo=o("span",{style:{"font-weight":"700"}},"請事先下載範例檔案，編輯好資料後直接上傳",-1),Po=o("span",{class:"ms-1 text-info"},"上傳方式",-1),Ro={class:"col-auto mb-1 d-flex"},Ao={class:"my-auto"},Ho=o("span",{style:{"font-weight":"700"}},[w("1. 手機號碼&簡訊內容"),o("br"),w("2. 換行為資料與資料間的分隔符號")],-1),$o=o("span",{class:"ms-1 text-info"},"上傳格式",-1),Wo={class:"row mb-3"},ko={class:"col-auto mb-1"},Bo={class:"row mb-3"},Lo={class:"col"},jo=o("br",null,null,-1),Fo=o("br",null,null,-1),No=o("br",null,null,-1),Oo={class:"row d-flex justify-content-center"},Do={__name:"sendFile",setup(s){function e(){const t=`0912345678&好久不見，你好嗎?
0922104075&I love U
0960778857&忘了您的名字，真不好意思`,i=new Blob([t],{type:"text/plain;charset=utf-8"}),n=URL.createObjectURL(i),a=document.createElement("a");a.href=n,a.download="範例檔(請使用記事本開啟)",document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(n)}return(t,i)=>(uo(),ho("div",yo,[wo,o("div",zo,[o("div",To,[o("div",So,[p(x(B),{trigger:"hover"},{trigger:_(()=>[p(x(k),{size:"20",color:"#0DCAF0"},{default:_(()=>[p(x(H))]),_:1})]),default:_(()=>[Eo]),_:1}),Po])]),o("div",Ro,[o("div",Ao,[p(x(B),{trigger:"hover"},{trigger:_(()=>[p(x(k),{size:"20",color:"#0DCAF0"},{default:_(()=>[p(x(H))]),_:1})]),default:_(()=>[Ho]),_:1}),$o])]),o("div",{class:"col-auto ms-auto"},[o("button",{class:"btn btn-primary fw-bold",onClick:e}," 下載範例檔案 ")])]),o("div",Wo,[o("div",ko,[o("input",{type:"file",class:"form-control",onChange:i[0]||(i[0]=(...n)=>t.Excelhandler&&t.Excelhandler(...n)),ref:"file"},null,544)])]),o("div",Bo,[o("div",Lo,[p(x(Io),{title:"注意事項",type:"info"},{default:_(()=>[w(" 1.注意事項111111 "),jo,w(" 2.注意事項222222"),Fo,w(" 3.注意事項333333 "),No,w(" 4.注意事項444444 ")]),_:1})])]),o("div",Oo,[o("button",{class:"btn btn-danger btn-lg",style:{width:"200px"},onClick:i[1]||(i[1]=(...n)=>t.submit&&t.submit(...n))}," 發送 ")])]))}};export{Do as default};
