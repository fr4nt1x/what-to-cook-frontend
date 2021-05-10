<template>
  <div id="app">
    <Suggestions msg="What to cook?" />
  </div>
</template>

<script>
import Suggestions from "./components/Suggestions.vue";

export default {
  name: "App",
  components: {
    Suggestions,
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
