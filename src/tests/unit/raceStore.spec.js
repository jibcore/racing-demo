import Vue from "vue";
import Vuex from "vuex";
import { describe, it, expect, beforeEach, vi } from "vitest";
import raceStore from "../../stores/raceStore";
import {
  RACE_DISTANCES,
  RACERS_PER_RACE,
  TOTAL_RACERS_AVAILABLE,
} from "../../constants/raceConstants";

Vue.use(Vuex);

vi.mock("@/utils/helpers", () => ({
  generateRacers: vi.fn(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      condition: Math.random(),
    }))
  ),
}));

vi.mock("@/utils/progressHelper", () => ({
  increaseProgress: vi.fn((progress) => progress + 10),
}));

describe("raceStore", () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        raceStore,
      },
    });
  });

  it("initializes racers correctly", () => {
    store.dispatch("raceStore/initRacers");
    const racers = store.getters["raceStore/getRacers"];
    expect(racers).toHaveLength(TOTAL_RACERS_AVAILABLE);
    expect(racers[0]).toHaveProperty("id");
    expect(racers[0]).toHaveProperty("condition");
  });

  it("initializes races correctly", () => {
    store.dispatch("raceStore/initRacers");
    store.dispatch("raceStore/initRaces");

    const races = store.getters["raceStore/getRaces"];
    expect(races).toHaveLength(RACE_DISTANCES.length);
    expect(races[0].racers).toHaveLength(RACERS_PER_RACE);
    expect(races[0]).toHaveProperty("distance");
    expect(races[0].racers[0]).toHaveProperty("progress");
  });

  it("toggles pause state", () => {
    expect(store.state.raceStore.racePaused).toBe(false);
    store.commit("raceStore/TOGGLE_PAUSE");
    expect(store.state.raceStore.racePaused).toBe(true);
    store.commit("raceStore/TOGGLE_PAUSE", false);
    expect(store.state.raceStore.racePaused).toBe(false);
  });

  it("updates racer progress", () => {
    store.dispatch("raceStore/initRacers");
    store.dispatch("raceStore/initRaces");

    const raceId = 1;
    const racerId = store.state.raceStore.races[0].racers[0].id;

    store.commit("raceStore/UPDATE_RACER_PROGRESS", {
      raceId,
      racerId,
      progress: 50,
    });

    const updated = store.state.raceStore.races[0].racers.find(
      (r) => r.id === racerId
    );
    expect(updated.progress).toBe(50);
  });

  it("finalizes race correctly", () => {
    store.dispatch("raceStore/initRacers");
    store.dispatch("raceStore/initRaces");

    const race = store.state.raceStore.races[0];
    race.racers.forEach((r) => {
      r.progress = 100;
    });

    store.commit("raceStore/FINALIZE_RACE", race.id);

    const scores = race.racers.map((r) => r.score);
    expect(new Set(scores).size).toBe(race.racers.length);
    expect(Math.min(...scores)).toBe(1);
  });
});
