import{d0 as M,d1 as U,bF as j,bD as O,bX as V,bE as g,a4 as X,bH as A,bI as B,r as P,d3 as Y,ds as _,bs as q,ah as W,dt as J}from"./index-3459458a.js";const K=M({name:"Watermark",common:U,self(e){const{fontFamily:s}=e;return{fontFamily:s}}}),Q=K,Z=j([O("watermark-container",`
 position: relative;
 `,[V("selectable",`
 user-select: none;
 -webkit-user-select: none;
 `),g("global-rotate",`
 overflow: hidden;
 `),g("fullscreen",`
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 pointer-events: none;
 position: fixed;
 `)]),O("watermark",`
 position: absolute;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 pointer-events: none;
 background-repeat: repeat;
 `,[g("fullscreen",`
 position: fixed;
 `),g("global-rotate",`
 position: absolute;
 height: max(284vh, 284vw);
 width: max(284vh, 284vw);
 `)])]);function ee(e){if(!e)return 1;const s=e.backingStorePixelRatio||e.webkitBackingStorePixelRatio||e.mozBackingStorePixelRatio||e.msBackingStorePixelRatio||e.oBackingStorePixelRatio||e.backingStorePixelRatio||1;return(window.devicePixelRatio||1)/s}const te=Object.assign(Object.assign({},B.props),{debug:Boolean,cross:Boolean,fullscreen:Boolean,width:{type:Number,default:32},height:{type:Number,default:32},zIndex:{type:Number,default:10},xGap:{type:Number,default:0},yGap:{type:Number,default:0},yOffset:{type:Number,default:0},xOffset:{type:Number,default:0},rotate:{type:Number,default:0},image:String,imageOpacity:{type:Number,default:1},imageHeight:Number,imageWidth:Number,content:String,selectable:{type:Boolean,default:!0},fontSize:{type:Number,default:14},fontFamily:String,fontStyle:{type:String,default:"normal"},fontVariant:{type:String,default:""},fontWeight:{type:Number,default:400},fontColor:{type:String,default:"rgba(128, 128, 128, .3)"},fontStretch:{type:String,default:""},lineHeight:{type:Number,default:14},globalRotate:{type:Number,default:0}}),ne=X({name:"Watermark",props:te,setup(e,{slots:s}){const{mergedClsPrefixRef:h}=A(e),I=B("Watermark","-watermark",Z,Q,e,h),c=P(""),o=Y?document.createElement("canvas"):null,a=o?o.getContext("2d"):null,b=P(!1);return _(()=>b.value=!0),q(()=>{if(!o)return;b.value;const t=ee(a),{xGap:i,yGap:f,width:u,height:r,yOffset:d,xOffset:l,rotate:m,image:w,content:y,fontColor:z,fontStyle:C,fontVariant:H,fontStretch:F,fontWeight:G,fontFamily:L,fontSize:T,lineHeight:k,debug:v}=e,D=(i+u)*t,E=(f+r)*t,x=l*t,$=d*t;if(o.width=D,o.height=E,a){a.translate(0,0);const S=u*t,R=r*t;if(v&&(a.strokeStyle="grey",a.strokeRect(0,0,S,R)),a.rotate(m*(Math.PI/180)),w){const n=new Image;n.crossOrigin="anonymous",n.referrerPolicy="no-referrer",n.src=w,n.onload=()=>{a.globalAlpha=e.imageOpacity;const{imageWidth:p,imageHeight:N}=e;a.drawImage(n,x,$,(e.imageWidth||(N?n.width*N/n.height:n.width))*t,(e.imageHeight||(p?n.height*p/n.width:n.height))*t),c.value=o.toDataURL()}}else y&&(v&&(a.strokeStyle="green",a.strokeRect(0,0,S,R)),a.font=`${C} ${H} ${G} ${F} ${T*t}px/${k*t}px ${L||I.value.self.fontFamily}`,a.fillStyle=z,a.fillText(y,x,$+k*t),c.value=o.toDataURL())}else J("watermark","Canvas is not supported in the browser.")}),()=>{var t;const{globalRotate:i,fullscreen:f,zIndex:u}=e,r=h.value,d=i!==0&&f,l="max(142vh, 142vw)",m=W("div",{class:[`${r}-watermark`,i!==0&&`${r}-watermark--global-rotate`,f&&`${r}-watermark--fullscreen`],style:{transform:i?`translateX(-50%) translateY(-50%) rotate(${i}deg)`:void 0,zIndex:d?void 0:u,backgroundSize:`${e.xGap+e.width}px`,backgroundPosition:i===0?e.cross?`${e.width/2}px ${e.height/2}px, 0 0`:"":e.cross?`calc(${l} + ${e.width/2}px) calc(${l} + ${e.height/2}px), ${l} ${l}`:l,backgroundImage:e.cross?`url(${c.value}), url(${c.value})`:`url(${c.value})`}});return e.fullscreen&&!i?m:W("div",{class:[`${r}-watermark-container`,i!==0&&`${r}-watermark-container--global-rotate`,f&&`${r}-watermark-container--fullscreen`,e.selectable&&`${r}-watermark-container--selectable`],style:{zIndex:d?u:void 0}},(t=s.default)===null||t===void 0?void 0:t.call(s),m)}}});export{ne as N};
