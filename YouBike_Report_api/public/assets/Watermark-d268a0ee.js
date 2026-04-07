import{b5 as j,b6 as D,I as E,G as O,ak as V,H as d,K as A,M as K,O as W,r as P,b9 as Q,bH as X,an as Y,Q as I,bI as _}from"./index-7ad65401.js";const q=j({name:"Watermark",common:D,self(e){const{fontFamily:s}=e;return{fontFamily:s}}}),J=q,Z=E([O("watermark-container",`
 position: relative;
 `,[V("selectable",`
 user-select: none;
 -webkit-user-select: none;
 `),d("global-rotate",`
 overflow: hidden;
 `),d("fullscreen",`
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
 `,[d("fullscreen",`
 position: fixed;
 `),d("global-rotate",`
 position: absolute;
 height: max(284vh, 284vw);
 width: max(284vh, 284vw);
 `)])]);function ee(e){if(!e)return 1;const s=e.backingStorePixelRatio||e.webkitBackingStorePixelRatio||e.mozBackingStorePixelRatio||e.msBackingStorePixelRatio||e.oBackingStorePixelRatio||e.backingStorePixelRatio||1;return(window.devicePixelRatio||1)/s}const te=Object.assign(Object.assign({},W.props),{debug:Boolean,cross:Boolean,fullscreen:Boolean,width:{type:Number,default:32},height:{type:Number,default:32},zIndex:{type:Number,default:10},xGap:{type:Number,default:0},yGap:{type:Number,default:0},yOffset:{type:Number,default:0},xOffset:{type:Number,default:0},rotate:{type:Number,default:0},image:String,imageOpacity:{type:Number,default:1},imageHeight:Number,imageWidth:Number,content:String,selectable:{type:Boolean,default:!0},fontSize:{type:Number,default:14},fontFamily:String,fontStyle:{type:String,default:"normal"},fontVariant:{type:String,default:""},fontWeight:{type:Number,default:400},fontColor:{type:String,default:"rgba(128, 128, 128, .3)"},fontStretch:{type:String,default:""},lineHeight:{type:Number,default:14},globalRotate:{type:Number,default:0}}),ne=A({name:"Watermark",props:te,setup(e,{slots:s}){const{mergedClsPrefixRef:h}=K(e),B=W("Watermark","-watermark",Z,J,e,h),c=P(""),o=Q?document.createElement("canvas"):null,a=o?o.getContext("2d"):null,b=P(!1);return X(()=>b.value=!0),Y(()=>{if(!o)return;b.value;const t=ee(a),{xGap:i,yGap:f,width:u,height:r,yOffset:m,xOffset:l,rotate:g,image:w,content:y,fontColor:H,fontStyle:z,fontVariant:C,fontStretch:G,fontWeight:F,fontFamily:L,fontSize:M,lineHeight:k,debug:v}=e,T=(i+u)*t,U=(f+r)*t,x=l*t,$=m*t;if(o.width=T,o.height=U,a){a.translate(0,0);const S=u*t,R=r*t;if(v&&(a.strokeStyle="grey",a.strokeRect(0,0,S,R)),a.rotate(g*(Math.PI/180)),w){const n=new Image;n.crossOrigin="anonymous",n.referrerPolicy="no-referrer",n.src=w,n.onload=()=>{a.globalAlpha=e.imageOpacity;const{imageWidth:p,imageHeight:N}=e;a.drawImage(n,x,$,(e.imageWidth||(N?n.width*N/n.height:n.width))*t,(e.imageHeight||(p?n.height*p/n.width:n.height))*t),c.value=o.toDataURL()}}else y&&(v&&(a.strokeStyle="green",a.strokeRect(0,0,S,R)),a.font=`${z} ${C} ${F} ${G} ${M*t}px/${k*t}px ${L||B.value.self.fontFamily}`,a.fillStyle=H,a.fillText(y,x,$+k*t),c.value=o.toDataURL())}else _("watermark","Canvas is not supported in the browser.")}),()=>{var t;const{globalRotate:i,fullscreen:f,zIndex:u}=e,r=h.value,m=i!==0&&f,l="max(142vh, 142vw)",g=I("div",{class:[`${r}-watermark`,i!==0&&`${r}-watermark--global-rotate`,f&&`${r}-watermark--fullscreen`],style:{transform:i?`translateX(-50%) translateY(-50%) rotate(${i}deg)`:void 0,zIndex:m?void 0:u,backgroundSize:`${e.xGap+e.width}px`,backgroundPosition:i===0?e.cross?`${e.width/2}px ${e.height/2}px, 0 0`:"":e.cross?`calc(${l} + ${e.width/2}px) calc(${l} + ${e.height/2}px), ${l} ${l}`:l,backgroundImage:e.cross?`url(${c.value}), url(${c.value})`:`url(${c.value})`}});return e.fullscreen&&!i?g:I("div",{class:[`${r}-watermark-container`,i!==0&&`${r}-watermark-container--global-rotate`,f&&`${r}-watermark-container--fullscreen`,e.selectable&&`${r}-watermark-container--selectable`],style:{zIndex:m?u:void 0}},(t=s.default)===null||t===void 0?void 0:t.call(s),g)}}});export{ne as N};
