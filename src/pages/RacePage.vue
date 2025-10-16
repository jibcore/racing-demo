<template>
  <div class="race-page">
    <PageHeader
      title="Horse Racing"
      @toggle-race="handleToggleRace"
      @generate-program="handleGenerateProgram"
    />

    <div v-if="hasRaces" class="race-page__body">
      <RacersTable :racers="getRacers" />

      <RaceTrack :race="getCurrentRace" />

      <RaceResultsList :races="getRaces" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import PageHeader from "../components/PageHeader.vue";
import RacersTable from "../components/RacersTable.vue";
import RaceTrack from "../components/RaceTrack.vue";
import RaceResultsList from "../components/RaceResultsList.vue";

export default {
  name: "RacePage",
  components: {
    PageHeader,
    RacersTable,
    RaceTrack,
    RaceResultsList,
  },
  computed: {
    ...mapGetters("raceStore", ["getRacers", "getRaces", "getCurrentRace"]),
    hasRaces() {
      return this.getRaces?.length > 0;
    },
  },
  methods: {
    ...mapActions("raceStore", ["initRacers", "initRaces", "toggleRace"]),
    handleGenerateProgram() {
      this.initRacers();
      this.initRaces();
    },
    async handleToggleRace() {
      await this.toggleRace();
    },
  },
};
</script>

<style scoped>
.race-page {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
  gap: 15px;
  background-color: lightgray;
}

.race-page__body {
  display: grid;
  grid-template-columns: 25% auto 25%;
  gap: 25px;
  padding: 0 25px 10px;
  overflow: auto;
}
</style>
