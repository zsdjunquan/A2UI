import { createApp } from "vue";
import App from "./App.vue";
import "ant-design-vue/dist/reset.css";
import "element-plus/dist/index.css";
import "./style.css";

// 应用入口：挂载 Vue 根组件，并全局引入 Ant Design Vue / Element Plus 的基础样式。
createApp(App).mount("#app");
