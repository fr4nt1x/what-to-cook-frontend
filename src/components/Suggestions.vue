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
      <b-container>
        <b-row no-gutters cols="7">
          <b-col v-for="date in currentDatesShown.slice(0, 7)" :key="date">
            <b-card :sub-title="date"
              ><b-list-group>
                <b-list-group-item
                  v-for="meal_index in currentDateToMeals[date]"
                  :key="meal_index"
                  >{{ allMeals[meal_index]["name"] }}</b-list-group-item
                ></b-list-group
              ></b-card
            >
          </b-col>
        </b-row>
        <b-row no-gutters cols="7">
          <b-col v-for="date in currentDatesShown.slice(7, 14)" :key="date">
            <b-card :sub-title="date"
              ><b-list-group>
                <b-list-group-item
                  v-for="meal_index in currentDateToMeals[date]"
                  :key="meal_index"
                  >{{ allMeals[meal_index]["name"] }}</b-list-group-item
                ></b-list-group
              ></b-card
            >
          </b-col>
        </b-row>
      </b-container>
      <div>
        <b-calendar v-model="selectedDate" value-as-date></b-calendar>
        <div>
          <b-button
            size="sm"
            variant="outline-primary"
            class="ml-auto"
            @click="setToday"
            >Set Today</b-button
          >
        </div>
      </div>

      <div>
        <b-button-group size="sm">
          <b-button
            v-for="tag in allTags"
            :pressed.sync="tagsPressed[tag]"
            pill
            variant="primary"
            :key="tag"
            >{{ tag }}</b-button
          >
        </b-button-group>
        <b-table
          fixed
          striped
          hover
          :items="computedMeals"
          :fields="mealFields"
        >
          <template #cell(tags)="data">
            <div>
              <b-button
                size="sm"
                v-for="tag in data.item.tags"
                :pressed.sync="tagsPressed[tag]"
                pill
                variant="primary"
                :key="tag"
                >{{ tag }}</b-button
              >
            </div>
            <div>
              <b-collapse
                v-model="mealRowTagsEnabled[data.item.name]"
                v-bind:id="data.item.name"
                class="mt-2"
              >
                <b-form-tags
                  input-id="tags-basic"
                  :disabled="!mealRowTagsEnabled[data.item.name]"
                  v-model="data.item.tags"
                  tag-pills
                  @input="onTagChange($event, data.item)"
                ></b-form-tags>
              </b-collapse>
              <b-button
                :class="mealRowTagsEnabled[data.item.name] ? null : 'collapsed'"
                :aria-expanded="
                  mealRowTagsEnabled[data.item.name] ? 'true' : 'enabled'
                "
                :aria-controls="data.item.name"
                :pressed.sync="mealRowTagsEnabled[data.item.name]"
                variant="outline-secondary"
                pill
                size="sm"
                ><small v-if="!mealRowTagsEnabled[data.item.name]">Edit</small>
                <small v-else>Close</small></b-button
              >
            </div>
          </template>
          <template #cell(add)="data">
            <b-button
              type="submit"
              size="sm"
              variant="outline-primary"
              class="ml-auto"
              @click="addMealToCurrentDate(data.item)"
              >Add Meal</b-button
            >
          </template>
        </b-table>
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
  methods: {
    convertDateToString: function (date) {
      let cDay = date.getDate();
            let sDay = cDay.toString().padStart(2,'0')
      let cMonth = date.getMonth() + 1
      let sMonth = cMonth.toString().padStart(2,'0')
      let cYear = date.getFullYear();
      return cYear + "-" + sMonth+ "-" + sDay;
    },
    addMealToCurrentDate: function (meal) {
      var newLastDates = meal.last_dates;

      newLastDates.push(this.convertDateToString(this.selectedDate));
      var uniqueDates = [...new Set(newLastDates)].sort();

      meal.last_dates = uniqueDates;
      axios
        .post("http://localhost:8000/update_dates_for_meal", meal)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
      console.log(meal);
    },
    setToday: function () {
      this.selectedDate = new Date();
    },
    filterMealsByTags: function (meals, tags) {
      var filteredMeals = [];
      var mealHasAllTags = false;
      for (var i = 0; i < meals.length; i++) {
        mealHasAllTags = true;
        for (var j = 0; j < tags.length; j++) {
          if (!meals[i].tags.includes(tags[j])) {
            mealHasAllTags = false;
          }
        }
        if (mealHasAllTags) {
          filteredMeals.push(meals[i]);
        }
      }
      return filteredMeals;
    },
    getOldestNMeals: function (meals, n) {
      var parts;
      var usedMeals = []; //sorted by oldest to newest
      var usedDates = [];
      var currentDate;
      const oldestDate = new Date(1970, 0, 0);
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
        if (currentMeal.last_dates.length == 0) {
          currentDate = oldestDate;
        } else {
          parts = currentMeal.last_dates.sort()[0].split("-");
          currentDate = new Date(parts[0], parts[1] - 1, parts[2]);
        }

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
      for (j = 0; j < usedMealsLength; j++) {
        if (usedDates[j] == oldestDate) {
          usedMeals[j].last_dates = [];
        }
      }
      return usedMeals;
    },
    onTagChange: function (event, meal) {
      console.log(event);
      console.log(JSON.stringify(meal));
      axios
        .post("http://localhost:8000/change_tags_for_meal", meal)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  },
  data() {
    return {
      mealFields: ["name", "tags", "count", "last_dates", "add"],
      allMeals: [],
      loading: true,
      errored: false,
      tagsPressed: {},
      selectedDate: null,
      mealRowTagsEnabled: {},
      numberOfMealsShown: 5,
      numberOfDaysShown: 14,
    };
  },
  computed: {
    allTags: function () {
      var meals = this.allMeals;
      var tags = [];
      var allTags = [];
      for (var i = 0; i < meals.length; i++) {
        if (meals[i].tags.length > 0) {
          tags = tags.concat(meals[i].tags);
        }
      }

      let unique = [...new Set(tags)];
      unique.forEach((tag) => {
        allTags.push(tag);
        if (tag in this.tagsPressed) {
          //For button :pressed.sync usage the synced prop must be in the datafield
          this.$set(this.tagsPressed, tag, this.tagsPressed[tag]);
        } else {
          this.$set(this.tagsPressed, tag, false);
        }
      });
      return allTags;
    },
    tagsToFilter: function () {
      return this.allTags.filter((tag) => {
        return this.tagsPressed[tag];
      });
    },
    computedMeals: function () {
      var result = Array();
      var meals = this.allMeals;

      var currentMeals;
      const tagsToFilterLength = this.tagsToFilter.length;
      if (tagsToFilterLength > 0) {
        currentMeals = this.filterMealsByTags(meals, this.tagsToFilter);
        if (currentMeals.length > 0) {
          result = this.getOldestNMeals(currentMeals, this.numberOfMealsShown);
        }
      } else {
        result = this.getOldestNMeals(meals, this.numberOfMealsShown);
      }
      for (var i = 0; i < result.length; i++) {
        this.$set(this.mealRowTagsEnabled, result[i].name, false);
      }
      return result;
    },
    currentDatesShown: function () {
      var result = [];
      var currentDate = new Date(this.selectedDate);
      result.push(this.convertDateToString(currentDate));
      for (var i = 0; i < this.numberOfDaysShown; i++) {
        currentDate.setDate(currentDate.getDate() - 1);
        result.push(this.convertDateToString(currentDate));
      }
      return result;
    },
    currentDateToMeals: function () {
      var result = new Object();
      var currentDate;
      for (var i = 0; i < this.currentDatesShown.length; i++) {
        currentDate = this.currentDatesShown[i];
        if (currentDate in this.dateToMeals) {
          result[currentDate] = this.dateToMeals[currentDate];
        } else {
          result[currentDate] = [];
        }
      }
      return result;
    },
    dateToMeals: function () {
      var result = new Object();
      var meals = this.allMeals;
      var currentDates = [];
      var currentDate;
      var currentArray;
      for (var i = 0; i < meals.length; i++) {
        currentDates = meals[i].last_dates;
        for (var j = 0; j < currentDates.length; j++) {
          currentDate = currentDates[j];
          if (currentDate in result) {
            currentArray = result[currentDate];
            currentArray.push(i);
            result[currentDate] = currentArray;
          } else {
            result[currentDate] = [i];
          }
        }
      }
      return result;
    },
  },
  mounted() {
    this.setToday();
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
