import Vue from "vue";
import App from "./App.vue";
import { BFormTags, BootstrapVue } from "bootstrap-vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCalendarMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import "./css/app.scss";
library.add(faCalendarMinus);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.config.productionTip = false;

import { BTable } from "bootstrap-vue";
import i18n from "./i18n";

Vue.use(BootstrapVue);

Vue.component("b-table", BTable);
Vue.component("b-form-tags", BFormTags);

new Vue({
  i18n,
  render: (h) => h(App),
}).$mount("#app");
