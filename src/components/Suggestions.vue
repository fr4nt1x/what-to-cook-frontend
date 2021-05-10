<template>
  <div class="hello">
    <h1>{{ msg }}</h1>

    <section v-if="errored">
      <p>
        We're sorry, we're not able to retrieve this information at the moment,
        please try back later
      </p>
    </section>

    <section v-else>
      <div v-if="loading">Loading...</div>
      <div>
        <b-table striped hover :items="info"></b-table>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "WhatToCook",
  props: {
    msg: String,
  },
  data() {
    return {
      info: null,
      loading: true,
      errored: false,
    };
  },
  mounted() {
    axios
      .get("http://localhost:8000/all_meals")
      .then((response) => {
        this.info = response.data.meals;
      })
      .catch((error) => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => (this.loading = false));
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
