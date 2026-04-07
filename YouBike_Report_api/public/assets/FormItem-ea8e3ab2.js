import{i as O,C as ye,z as ie,D as Se,G as S,H as y,I as V,J as re,K as le,M as oe,O as Y,r as W,P as G,Q as h,R as se,S as X,T as g,U,V as de,W as $e,X as H,Y as D,Z,$ as Pe,a0 as _e,a1 as Ie,a2 as ze,a3 as Me,a4 as Ce,a5 as ee,a6 as I}from"./index-986760c3.js";function Le(t,e,l){var n;const c=O(t,null);if(c===null)return;const o=(n=ye())===null||n===void 0?void 0:n.proxy;ie(l,s),s(l.value),Se(()=>{s(void 0,l.value)});function s(i,a){const d=c[e];a!==void 0&&b(d,a),i!==void 0&&f(d,i)}function b(i,a){i[a]||(i[a]=[]),i[a].splice(i[a].findIndex(d=>d===o),1)}function f(i,a){i[a]||(i[a]=[]),~i[a].findIndex(d=>d===o)||i[a].push(o)}}const Ae=S("form",[y("inline",`
 width: 100%;
 display: inline-flex;
 align-items: flex-start;
 align-content: space-around;
 `,[S("form-item",{width:"auto",marginRight:"18px"},[V("&:last-child",{marginRight:0})])])]),E=re("n-form"),fe=re("n-form-item-insts");var qe=globalThis&&globalThis.__awaiter||function(t,e,l,n){function c(o){return o instanceof l?o:new l(function(s){s(o)})}return new(l||(l=Promise))(function(o,s){function b(a){try{i(n.next(a))}catch(d){s(d)}}function f(a){try{i(n.throw(a))}catch(d){s(d)}}function i(a){a.done?o(a.value):c(a.value).then(b,f)}i((n=n.apply(t,e||[])).next())})};const je=Object.assign(Object.assign({},Y.props),{inline:Boolean,labelWidth:[Number,String],labelAlign:String,labelPlacement:{type:String,default:"top"},model:{type:Object,default:()=>{}},rules:Object,disabled:Boolean,size:String,showRequireMark:{type:Boolean,default:void 0},requireMarkPlacement:String,showFeedback:{type:Boolean,default:!0},onSubmit:{type:Function,default:t=>t.preventDefault()},showLabel:{type:Boolean,default:void 0},validateMessages:Object}),He=le({name:"Form",props:je,setup(t){const{mergedClsPrefixRef:e}=oe(t);Y("Form","-form",Ae,se,t,e);const l={},n=W(void 0),c=f=>{const i=n.value;(i===void 0||f>=i)&&(n.value=f)};function o(f,i=()=>!0){return qe(this,void 0,void 0,function*(){return yield new Promise((a,d)=>{const x=[];for(const r of X(l)){const v=l[r];for(const _ of v)_.path&&x.push(_.internalValidate(null,i))}Promise.all(x).then(r=>{if(r.some(v=>!v.valid)){const v=r.filter(_=>_.errors).map(_=>_.errors);f&&f(v),d(v)}else f&&f(),a()})})})}function s(){for(const f of X(l)){const i=l[f];for(const a of i)a.restoreValidation()}}return G(E,{props:t,maxChildLabelWidthRef:n,deriveMaxChildLabelWidth:c}),G(fe,{formItems:l}),Object.assign({validate:o,restoreValidation:s},{mergedClsPrefix:e})},render(){const{mergedClsPrefix:t}=this;return h("form",{class:[`${t}-form`,this.inline&&`${t}-form--inline`],onSubmit:this.onSubmit},this.$slots)}});function Fe(t){const e=O(E,null);return{mergedSize:g(()=>t.size!==void 0?t.size:(e==null?void 0:e.props.size)!==void 0?e.props.size:"medium")}}function Ve(t){const e=O(E,null),l=g(()=>{const{labelPlacement:r}=t;return r!==void 0?r:e!=null&&e.props.labelPlacement?e.props.labelPlacement:"top"}),n=g(()=>l.value==="left"&&(t.labelWidth==="auto"||(e==null?void 0:e.props.labelWidth)==="auto")),c=g(()=>{if(l.value==="top")return;const{labelWidth:r}=t;if(r!==void 0&&r!=="auto")return U(r);if(n.value){const v=e==null?void 0:e.maxChildLabelWidthRef.value;return v!==void 0?U(v):void 0}if((e==null?void 0:e.props.labelWidth)!==void 0)return U(e.props.labelWidth)}),o=g(()=>{const{labelAlign:r}=t;if(r)return r;if(e!=null&&e.props.labelAlign)return e.props.labelAlign}),s=g(()=>{var r;return[(r=t.labelProps)===null||r===void 0?void 0:r.style,t.labelStyle,{width:c.value}]}),b=g(()=>{const{showRequireMark:r}=t;return r!==void 0?r:e==null?void 0:e.props.showRequireMark}),f=g(()=>{const{requireMarkPlacement:r}=t;return r!==void 0?r:(e==null?void 0:e.props.requireMarkPlacement)||"right"}),i=W(!1),a=g(()=>{const{validationStatus:r}=t;if(r!==void 0)return r;if(i.value)return"error"}),d=g(()=>{const{showFeedback:r}=t;return r!==void 0?r:(e==null?void 0:e.props.showFeedback)!==void 0?e.props.showFeedback:!0}),x=g(()=>{const{showLabel:r}=t;return r!==void 0?r:(e==null?void 0:e.props.showLabel)!==void 0?e.props.showLabel:!0});return{validationErrored:i,mergedLabelStyle:s,mergedLabelPlacement:l,mergedLabelAlign:o,mergedShowRequireMark:b,mergedRequireMarkPlacement:f,mergedValidationStatus:a,mergedShowFeedback:d,mergedShowLabel:x,isAutoLabelWidth:n}}function We(t){const e=O(E,null),l=g(()=>{const{rulePath:s}=t;if(s!==void 0)return s;const{path:b}=t;if(b!==void 0)return b}),n=g(()=>{const s=[],{rule:b}=t;if(b!==void 0&&(Array.isArray(b)?s.push(...b):s.push(b)),e){const{rules:f}=e.props,{value:i}=l;if(f!==void 0&&i!==void 0){const a=de(f,i);a!==void 0&&(Array.isArray(a)?s.push(...a):s.push(a))}}return s}),c=g(()=>n.value.some(s=>s.required)),o=g(()=>c.value||t.required);return{mergedRules:n,mergedRequired:o}}const{cubicBezierEaseInOut:te}=$e;function Oe({name:t="fade-down",fromOffset:e="-4px",enterDuration:l=".3s",leaveDuration:n=".3s",enterCubicBezier:c=te,leaveCubicBezier:o=te}={}){return[V(`&.${t}-transition-enter-from, &.${t}-transition-leave-to`,{opacity:0,transform:`translateY(${e})`}),V(`&.${t}-transition-enter-to, &.${t}-transition-leave-from`,{opacity:1,transform:"translateY(0)"}),V(`&.${t}-transition-leave-active`,{transition:`opacity ${n} ${o}, transform ${n} ${o}`}),V(`&.${t}-transition-enter-active`,{transition:`opacity ${l} ${c}, transform ${l} ${c}`})]}const Ee=S("form-item",`
 display: grid;
 line-height: var(--n-line-height);
`,[S("form-item-label",`
 grid-area: label;
 align-items: center;
 line-height: 1.25;
 text-align: var(--n-label-text-align);
 font-size: var(--n-label-font-size);
 min-height: var(--n-label-height);
 padding: var(--n-label-padding);
 color: var(--n-label-text-color);
 transition: color .3s var(--n-bezier);
 box-sizing: border-box;
 font-weight: var(--n-label-font-weight);
 `,[H("asterisk",`
 white-space: nowrap;
 user-select: none;
 -webkit-user-select: none;
 color: var(--n-asterisk-color);
 transition: color .3s var(--n-bezier);
 `),H("asterisk-placeholder",`
 grid-area: mark;
 user-select: none;
 -webkit-user-select: none;
 visibility: hidden; 
 `)]),S("form-item-blank",`
 grid-area: blank;
 min-height: var(--n-blank-height);
 `),y("auto-label-width",[S("form-item-label","white-space: nowrap;")]),y("left-labelled",`
 grid-template-areas:
 "label blank"
 "label feedback";
 grid-template-columns: auto minmax(0, 1fr);
 grid-template-rows: auto 1fr;
 align-items: start;
 `,[S("form-item-label",`
 display: grid;
 grid-template-columns: 1fr auto;
 min-height: var(--n-blank-height);
 height: auto;
 box-sizing: border-box;
 flex-shrink: 0;
 flex-grow: 0;
 `,[y("reverse-columns-space",`
 grid-template-columns: auto 1fr;
 `),y("left-mark",`
 grid-template-areas:
 "mark text"
 ". text";
 `),y("right-mark",`
 grid-template-areas: 
 "text mark"
 "text .";
 `),y("right-hanging-mark",`
 grid-template-areas: 
 "text mark"
 "text .";
 `),H("text",`
 grid-area: text; 
 `),H("asterisk",`
 grid-area: mark; 
 align-self: end;
 `)])]),y("top-labelled",`
 grid-template-areas:
 "label"
 "blank"
 "feedback";
 grid-template-rows: minmax(var(--n-label-height), auto) 1fr;
 grid-template-columns: minmax(0, 100%);
 `,[y("no-label",`
 grid-template-areas:
 "blank"
 "feedback";
 grid-template-rows: 1fr;
 `),S("form-item-label",`
 display: flex;
 align-items: flex-start;
 justify-content: var(--n-label-text-align);
 `)]),S("form-item-blank",`
 box-sizing: border-box;
 display: flex;
 align-items: center;
 position: relative;
 `),S("form-item-feedback-wrapper",`
 grid-area: feedback;
 box-sizing: border-box;
 min-height: var(--n-feedback-height);
 font-size: var(--n-feedback-font-size);
 line-height: 1.25;
 transform-origin: top left;
 `,[V("&:not(:empty)",`
 padding: var(--n-feedback-padding);
 `),S("form-item-feedback",{transition:"color .3s var(--n-bezier)",color:"var(--n-feedback-text-color)"},[y("warning",{color:"var(--n-feedback-text-color-warning)"}),y("error",{color:"var(--n-feedback-text-color-error)"}),Oe({fromOffset:"-3px",enterDuration:".3s",leaveDuration:".2s"})])])]);var ne=globalThis&&globalThis.__awaiter||function(t,e,l,n){function c(o){return o instanceof l?o:new l(function(s){s(o)})}return new(l||(l=Promise))(function(o,s){function b(a){try{i(n.next(a))}catch(d){s(d)}}function f(a){try{i(n.throw(a))}catch(d){s(d)}}function i(a){a.done?o(a.value):c(a.value).then(b,f)}i((n=n.apply(t,e||[])).next())})};const Te=Object.assign(Object.assign({},Y.props),{label:String,labelWidth:[Number,String],labelStyle:[String,Object],labelAlign:String,labelPlacement:String,path:String,first:Boolean,rulePath:String,required:Boolean,showRequireMark:{type:Boolean,default:void 0},requireMarkPlacement:String,showFeedback:{type:Boolean,default:void 0},rule:[Object,Array],size:String,ignorePathChange:Boolean,validationStatus:String,feedback:String,showLabel:{type:Boolean,default:void 0},labelProps:Object});function ae(t,e){return(...l)=>{try{const n=t(...l);return!e&&(typeof n=="boolean"||n instanceof Error||Array.isArray(n))||n!=null&&n.then?n:(n===void 0||ee("form-item/validate",`You return a ${typeof n} typed value in the validator method, which is not recommended. Please use `+(e?"`Promise`":"`boolean`, `Error` or `Promise`")+" typed value instead."),!0)}catch(n){ee("form-item/validate","An error is catched in the validation, so the validation won't be done. Your callback in `validate` method of `n-form` or `n-form-item` won't be called in this validation."),console.error(n);return}}}const De=le({name:"FormItem",props:Te,setup(t){Le(fe,"formItems",D(t,"path"));const{mergedClsPrefixRef:e,inlineThemeDisabled:l}=oe(t),n=O(E,null),c=Fe(t),o=Ve(t),{validationErrored:s}=o,{mergedRequired:b,mergedRules:f}=We(t),{mergedSize:i}=c,{mergedLabelPlacement:a,mergedLabelAlign:d,mergedRequireMarkPlacement:x}=o,r=W([]),v=W(Z()),_=n?D(n.props,"disabled"):W(!1),ue=Y("Form","-form-item",Ee,se,t,e);ie(D(t,"path"),()=>{t.ignorePathChange||T()});function T(){r.value=[],s.value=!1,t.feedback&&(v.value=Z())}function ce(){C("blur")}function me(){C("change")}function be(){C("focus")}function ge(){C("input")}function he(u,R){return ne(this,void 0,void 0,function*(){let w,p,z,A;return typeof u=="string"?(w=u,p=R):u!==null&&typeof u=="object"&&(w=u.trigger,p=u.callback,z=u.shouldRuleBeApplied,A=u.options),yield new Promise((q,j)=>{C(w,z,A).then(({valid:F,errors:M})=>{F?(p&&p(),q()):(p&&p(M),j(M))})})})}const C=(u=null,R=()=>!0,w={suppressWarning:!0})=>ne(this,void 0,void 0,function*(){const{path:p}=t;w?w.first||(w.first=t.first):w={};const{value:z}=f,A=n?de(n.props.model,p||""):void 0,q={},j={},F=(u?z.filter($=>Array.isArray($.trigger)?$.trigger.includes(u):$.trigger===u):z).filter(R).map(($,P)=>{const m=Object.assign({},$);if(m.validator&&(m.validator=ae(m.validator,!1)),m.asyncValidator&&(m.asyncValidator=ae(m.asyncValidator,!0)),m.renderMessage){const k=`__renderMessage__${P}`;j[k]=m.message,m.message=k,q[k]=m.renderMessage}return m});if(!F.length)return{valid:!0};const M=p??"__n_no_path__",B=new Ce({[M]:F}),{validateMessages:N}=(n==null?void 0:n.props)||{};return N&&B.messages(N),yield new Promise($=>{B.validate({[M]:A},w,P=>{P!=null&&P.length?(r.value=P.map(m=>{const k=(m==null?void 0:m.message)||"";return{key:k,render:()=>k.startsWith("__renderMessage__")?q[k]():k}}),P.forEach(m=>{var k;!((k=m.message)===null||k===void 0)&&k.startsWith("__renderMessage__")&&(m.message=j[m.message])}),s.value=!0,$({valid:!1,errors:P})):(T(),$({valid:!0}))})})});G(Pe,{path:D(t,"path"),disabled:_,mergedSize:c.mergedSize,mergedValidationStatus:o.mergedValidationStatus,restoreValidation:T,handleContentBlur:ce,handleContentChange:me,handleContentFocus:be,handleContentInput:ge});const ve={validate:he,restoreValidation:T,internalValidate:C},J=W(null);_e(()=>{if(!o.isAutoLabelWidth.value)return;const u=J.value;if(u!==null){const R=u.style.whiteSpace;u.style.whiteSpace="nowrap",u.style.width="",n==null||n.deriveMaxChildLabelWidth(Number(getComputedStyle(u).width.slice(0,-2))),u.style.whiteSpace=R}});const Q=g(()=>{var u;const{value:R}=i,{value:w}=a,p=w==="top"?"vertical":"horizontal",{common:{cubicBezierEaseInOut:z},self:{labelTextColor:A,asteriskColor:q,lineHeight:j,feedbackTextColor:F,feedbackTextColorWarning:M,feedbackTextColorError:B,feedbackPadding:N,labelFontWeight:$,[I("labelHeight",R)]:P,[I("blankHeight",R)]:m,[I("feedbackFontSize",R)]:k,[I("feedbackHeight",R)]:ke,[I("labelPadding",p)]:we,[I("labelTextAlign",p)]:xe,[I(I("labelFontSize",w),R)]:Re}}=ue.value;let K=(u=d.value)!==null&&u!==void 0?u:xe;return w==="top"&&(K=K==="right"?"flex-end":"flex-start"),{"--n-bezier":z,"--n-line-height":j,"--n-blank-height":m,"--n-label-font-size":Re,"--n-label-text-align":K,"--n-label-height":P,"--n-label-padding":we,"--n-label-font-weight":$,"--n-asterisk-color":q,"--n-label-text-color":A,"--n-feedback-padding":N,"--n-feedback-font-size":k,"--n-feedback-height":ke,"--n-feedback-text-color":F,"--n-feedback-text-color-warning":M,"--n-feedback-text-color-error":B}}),L=l?Ie("form-item",g(()=>{var u;return`${i.value[0]}${a.value[0]}${((u=d.value)===null||u===void 0?void 0:u[0])||""}`}),Q,t):void 0,pe=g(()=>a.value==="left"&&x.value==="left"&&d.value==="left");return Object.assign(Object.assign(Object.assign(Object.assign({labelElementRef:J,mergedClsPrefix:e,mergedRequired:b,feedbackId:v,renderExplains:r,reverseColSpace:pe},o),c),ve),{cssVars:l?void 0:Q,themeClass:L==null?void 0:L.themeClass,onRender:L==null?void 0:L.onRender})},render(){const{$slots:t,mergedClsPrefix:e,mergedShowLabel:l,mergedShowRequireMark:n,mergedRequireMarkPlacement:c,onRender:o}=this,s=n!==void 0?n:this.mergedRequired;o==null||o();const b=()=>{const f=this.$slots.label?this.$slots.label():this.label;if(!f)return null;const i=h("span",{class:`${e}-form-item-label__text`},f),a=s?h("span",{class:`${e}-form-item-label__asterisk`},c!=="left"?" *":"* "):c==="right-hanging"&&h("span",{class:`${e}-form-item-label__asterisk-placeholder`}," *"),{labelProps:d}=this;return h("label",Object.assign({},d,{class:[d==null?void 0:d.class,`${e}-form-item-label`,`${e}-form-item-label--${c}-mark`,this.reverseColSpace&&`${e}-form-item-label--reverse-columns-space`],style:this.mergedLabelStyle,ref:"labelElementRef"}),c==="left"?[a,i]:[i,a])};return h("div",{class:[`${e}-form-item`,this.themeClass,`${e}-form-item--${this.mergedSize}-size`,`${e}-form-item--${this.mergedLabelPlacement}-labelled`,this.isAutoLabelWidth&&`${e}-form-item--auto-label-width`,!l&&`${e}-form-item--no-label`],style:this.cssVars},l&&b(),h("div",{class:[`${e}-form-item-blank`,this.mergedValidationStatus&&`${e}-form-item-blank--${this.mergedValidationStatus}`]},t),this.mergedShowFeedback?h("div",{key:this.feedbackId,class:`${e}-form-item-feedback-wrapper`},h(ze,{name:"fade-down-transition",mode:"out-in"},{default:()=>{const{mergedValidationStatus:f}=this;return Me(t.feedback,i=>{var a;const{feedback:d}=this,x=i||d?h("div",{key:"__feedback__",class:`${e}-form-item-feedback__line`},i||d):this.renderExplains.length?(a=this.renderExplains)===null||a===void 0?void 0:a.map(({key:r,render:v})=>h("div",{key:r,class:`${e}-form-item-feedback__line`},v())):null;return x?f==="warning"?h("div",{key:"controlled-warning",class:`${e}-form-item-feedback ${e}-form-item-feedback--warning`},x):f==="error"?h("div",{key:"controlled-error",class:`${e}-form-item-feedback ${e}-form-item-feedback--error`},x):f==="success"?h("div",{key:"controlled-success",class:`${e}-form-item-feedback ${e}-form-item-feedback--success`},x):h("div",{key:"controlled-default",class:`${e}-form-item-feedback`},x):null})}})):null)}});export{De as N,He as a};
