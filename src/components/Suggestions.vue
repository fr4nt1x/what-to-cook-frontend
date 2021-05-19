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
        <b-table striped hover :items="computedMeals"></b-table>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Suggestions",
  props: {
    msg: String,
  },
  data() {
    return {
      allMeals: null,
      loading: true,
      errored: false,
    };
  },
  computed: {
    computedMeals: function () {
      var result = Array();
      var meals = this.allMeals;
      function filterMeals(difficulty) {
        console.log(meals.filter((meal) => meal.difficulty === difficulty));
        return meals.filter((meal) => meal.difficulty === difficulty);
      }

      function getOldestMeal(meals) {
        var parts;
        var usedMeal = null;
        var usedDate = null;
        var currentDate;
        for (var i = 0; i < meals.length; i++) {
          parts = meals[i].last_date.split("-");
          currentDate = new Date(parts[0], parts[1] - 1, parts[2]);

          if (i == 0) {
            usedMeal = meals[0];
            usedDate = currentDate;
          } else if (usedDate > currentDate) {
            usedMeal = meals[i];
            usedDate = currentDate;
          }
        }
        return usedMeal;
      }

      var currentMeals;
      const maxDifficulty = 4;
      for (var i = 1; i <= maxDifficulty; i++) {
        currentMeals = filterMeals(i);
        if (currentMeals.length > 0) {
          result.push(getOldestMeal(currentMeals));
        }
      }

      return result;
    },
  },
  mounted() {
    axios
      .get("http://localhost:8000/all_meals")
      .then((response) => {
        this.allMeals = response.data.meals;
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
