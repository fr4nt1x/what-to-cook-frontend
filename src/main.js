import Vue from "vue";
import App from "./App.vue";
import { BFormTags, BootstrapVue } from "bootstrap-vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
Vue.config.productionTip = false;
import { BTable } from "bootstrap-vue";

Vue.use(BootstrapVue);
Vue.component("b-table", BTable);
Vue.component("b-form-tags", BFormTags);

new Vue({
  render: (h) => h(App),
}).$mount("#app");
