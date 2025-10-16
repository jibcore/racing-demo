<template>
  <div class="race-results-list">
    <div class="race-results-list__title">Results</div>

    <div v-for="race in races" class="race-results-list__race">
      <div class="race-results-list__race-title">
        #{{ race.id }} Race - {{ race.distance }}m
      </div>
      <BaseTable :columns="COLUMNS" :rows="race.racers">
        <template #cell-color="{ value }">
          <div class="color-cell">
            <span class="color-dot" :style="{ backgroundColor: value }"></span>
            {{ value }}
          </div>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script>
import BaseTable from "./base/BaseTable.vue";

const COLUMNS = [
  { key: "position", label: "Position" },
  { key: "name", label: "Name" },
  { key: "score", label: "Score" },
];

export default {
  name: "RaceResultsList",
  components: {
    BaseTable,
  },
  props: {
    races: {
      type: Array,
      reqired: true,
    },
  },
  data() {
    return {
      COLUMNS,
    };
  },
};
</script>

<style>
.race-results-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  position: relative;
}

.race-results-list__title {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: darkseagreen;
  font-size: 20px;
  padding: 10px;
}

.race-results-list__race-title {
  padding: 8px;
  font-weight: bold;
  background-color: chocolate;
  text-align: center;
}
</style>
