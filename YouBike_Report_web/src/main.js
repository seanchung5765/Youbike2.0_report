import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import VueSweetalert2 from "vue-sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "bootstrap";
// import './assets/main.css'

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(VueSweetalert2);
app.use(ElementPlus);
app.mount("#app");
