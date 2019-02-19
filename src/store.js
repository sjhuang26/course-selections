import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentPage: ['home'],
    schedule: []
  },
  mutations: {
    setPage(state, path) {
      state.currentPage = path;
    },
    addCourse(state, courseKey) {
      state.schedule.push(courseKey);
    },
    removeCourse(state, courseKey) {
      state.schedule.splice(state.schedule.indexOf(courseKey), 1);
    }
  },
  getters: {
    isCourseSelected(state) {
      return courseKey => state.schedule.includes(courseKey);
    }
  },
  actions: {
    navigateToPage({ commit }, path) {
      commit('setPage', path);
    },
    toggleCourse({ commit, getters }, courseKey) {
      if (getters.isCourseSelected(courseKey)) {
        commit('removeCourse', courseKey);
      } else {
        commit('addCourse', courseKey);
      }
    }
  }
});
