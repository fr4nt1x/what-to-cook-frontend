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
      allMeals: [],
      loading: true,
      errored: false,
      tagsToFilter: [],
    };
  },
  computed: {
    allTags: function () {
      var meals = this.allMeals;
      var tags = [];
      for (var i = 0; i < meals.length; i++) {
        if (meals[i].tags.length > 0) {
          tags = tags.concat(meals[i].tags);
        }
      }
      let unique = [...new Set(tags)];
      return unique;
    },
    computedMeals: function () {
      var result = Array();
      var meals = this.allMeals;

      function filterMealsByTag(tag) {
        return meals.filter((meal) => tag in meal.tags);
      }

      function getOldestNMeals(meals, n) {
        var parts;
        var usedMeals = []; //sorted by oldest to newest
        var usedDates = [];
        var currentDate;
        var currentMeal;
        const mealsLength = meals.length;
        if (n > mealsLength) {
          console.warn(
            "Not enough meals for given amount to show, using number of all meals."
          );
          n = mealsLength;
        }

        var usedMealsLength = usedMeals.length;
        for (var i = 0; i < mealsLength; i++) {
          usedMealsLength = usedMeals.length;
          currentMeal = meals[i];
          parts = currentMeal.last_date.split("-");
          currentDate = new Date(parts[0], parts[1] - 1, parts[2]);

          if (usedMealsLength < n) {
            if (usedMealsLength == 0) {
              usedMeals.push(currentMeal);
              usedDates.push(currentDate);
            } else {
              var pushed = false;
              for (var j = 0; j < usedMealsLength; j++) {
                if (usedDates[j] >= currentDate) {
                  //Meal is older than meal j
                  pushed = true;
                  usedMeals.splice(j, 0, currentMeal);
                  usedDates.splice(j, 0, currentDate);
                  break;
                }
              }
              if (!pushed) {
                //Meal is newer than all other meals
                usedMeals.push(currentMeal);
                usedDates.push(currentDate);
              }
            }
          } else {
            for (j = 0; j < usedMealsLength; j++) {
              if (usedDates[j] >= currentDate) {
                //Meal is older than meal j
                usedMeals.splice(j, 0, currentMeal);
                usedDates.splice(j, 0, currentDate);
                usedMeals.pop();
                usedDates.pop();
                break;
              }
            }
          }
        }
        return usedMeals;
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
      const tagsToFilterLength = this.tagsToFilter.length;
      if (tagsToFilterLength > 0) {
        for (var i = 0; i < tagsToFilterLength; i++) {
          currentMeals = filterMealsByTag(this.allTags[i]);
          if (currentMeals.length > 0) {
            result.push(getOldestMeal(currentMeals));
          }
        }
      } else {
        result = getOldestNMeals(meals, 10);
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
