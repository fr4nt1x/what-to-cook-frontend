<template>
  <div id="app">
    <localeChanger></localeChanger>
    <Suggestions :msg="$t('message')" />
  </div>
</template>

<script>
import Suggestions from "./components/Suggestions.vue";
import localeChanger from "./components/localeChanger.vue";

export default {
  name: "App",
  components: {
    Suggestions,
    localeChanger,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
