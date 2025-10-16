import { generateRacers } from "../utils/helpers";
import { increaseProgress } from "../utils/progressHelper";

const RACE_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200];
const RACERS_PER_RACE = 10;
const TOTAL_RACERS_AVAILABLE = 20;
const TICK_INTERVAL_MS = 150;

const state = () => ({
  racers: [],
  races: [],
  currentRaceId: 0,
  raceInterval: null,
  racePaused: false,
});

const mutations = {
  SET_RACERS(state, racers) {
    state.racers = racers;
  },
  SET_RACES(state, races) {
    state.races = races;
  },
  SET_CURRENT_RACE(state, raceId) {
    state.currentRaceId = raceId;
  },
  SET_INTERVAL(state, interval) {
    state.raceInterval = interval;
  },
  CLEAR_INTERVAL(state) {
    if (state.raceInterval) {
      clearInterval(state.raceInterval);
    }
    state.raceInterval = null;
  },
  TOGGLE_PAUSE(state, value) {
    state.racePaused = value ?? !state.racePaused;
  },
  UPDATE_RACER_PROGRESS(state, { raceId, racerId, progress }) {
    const race = state.races.find((r) => r.id === raceId);
    const racer = race?.racers.find((r) => r.id === racerId);

    if (racer) {
      racer.progress = progress;
    }
  },
  FINALIZE_RACE(state, raceId) {
    const race = state.races.find((r) => r.id === raceId);
    if (!race) {
      return;
    }

    const sortedRacers = [...race.racers].sort((a, b) => {
      if (b.progress === a.progress) {
        return Math.random() - 0.5; // shuffle progress both progress - 100
      }
      return b.progress - a.progress;
    });

    sortedRacers.forEach((racer, index) => {
      racer.score = index + 1;
    });
  },
};

const actions = {
  initRacers({ commit }) {
    commit("SET_RACERS", generateRacers(TOTAL_RACERS_AVAILABLE));
  },

  initRaces({ state, commit }) {
    if (!state.racers.length) {
      return;
    }

    const races = RACE_DISTANCES.map((distance, raceIndex) => {
      const shuffledRacers = [...state.racers].sort(() => Math.random() - 0.5);
      const selectedRacers = shuffledRacers.slice(0, RACERS_PER_RACE);

      const raceRacers = selectedRacers.map((racer, idx) => ({
        id: racer.id,
        position: idx + 1,
        progress: 0,
        score: 0,
      }));

      return {
        id: raceIndex + 1,
        racers: raceRacers,
        distance,
      };
    });

    commit("CLEAR_INTERVAL");
    commit("SET_RACES", races);
    commit("SET_CURRENT_RACE", 0);
  },

  toggleRace({ state, commit, dispatch }) {
    if (!state.raceInterval) {
      commit("TOGGLE_PAUSE", false);
      dispatch("startRaceSeries");
    } else {
      commit("TOGGLE_PAUSE");
    }
  },

  async startRaceSeries({ state, commit, dispatch }) {
    if (state.raceInterval) {
      return;
    }

    const racesToRun = state.races.slice(state.currentRaceId);

    for (const [index, race] of racesToRun.entries()) {
      commit("SET_CURRENT_RACE", state.currentRaceId + index);
      await dispatch("runSingleRace", race);
    }

    commit("CLEAR_INTERVAL");
    commit("TOGGLE_PAUSE", false);
  },

  runSingleRace({ state, commit }, race) {
    if (!race) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const racersData = race.racers.map((racer) => {
        const racerInfo = state.racers.find((r) => r.id === racer.id);
        return {
          id: racer.id,
          progress: racer.progress ?? 0,
          condition: racerInfo?.condition ?? 0,
        };
      });

      const maxCondition =
        Math.max(...racersData.map((racer) => racer.condition)) || 1;

      const updateProgress = () => {
        racersData.forEach((racer) => {
          racer.progress = increaseProgress(
            racer.progress,
            racer.condition,
            maxCondition
          );
          commit("UPDATE_RACER_PROGRESS", {
            raceId: race.id,
            racerId: racer.id,
            progress: racer.progress,
          });
        });

        return racersData.every((r) => r.progress >= 100);
      };

      commit("CLEAR_INTERVAL");

      const interval = setInterval(() => {
        if (state.racePaused) {
          return;
        }

        const finished = updateProgress();

        if (finished) {
          commit("FINALIZE_RACE", race.id);
          commit("CLEAR_INTERVAL");
          resolve();
        }
      }, TICK_INTERVAL_MS);

      commit("SET_INTERVAL", interval);
    });
  },
};

const getters = {
  getCurrentRace: (state, getters) =>
    getters.getRaces[state.currentRaceId] || null,
  getRacers: (state) => state.racers,
  getRaces: (state) => {
    const racerMap = new Map(state.racers.map((h) => [h.id, h]));

    return state.races.map((race) => ({
      ...race,
      racers: race.racers.map((racer) => ({
        ...racer,
        ...(racerMap.get(racer.id) || {}),
      })),
    }));
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
