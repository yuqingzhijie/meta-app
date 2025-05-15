// import "./assets/css/reset.less";
import { createApp } from "vue";
import { setRemUnit } from "./utils/measure";
import App from "./views/PassageList.vue";

setRemUnit();

createApp(App).mount("#app");
