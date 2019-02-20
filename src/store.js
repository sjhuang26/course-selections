import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentPage: ['home'],
    // schedule = [ { grade: 9/10/11/12/0, courseKey: xxx } ]
    schedule: []
  },
  mutations: {
    setPage(state, path) {
      state.currentPage = path;
    },
    addCourse(state, courseKey, grade) {
      if (grade === undefined) grade = 0;
      state.schedule.push({ grade, courseKey });
    },
    removeCourse(state, courseKey, grade) {
      state.schedule = state.schedule.map(x => {
        if (x.courseKey !== courseKey) return true;
        if (grade === undefined) return false;
        if (x.grade !== grade) return true;
        return false;
      });
    },
    changeSchedule(state, newSchedule) {
      state.schedule = newSchedule;
    }
  },
  getters: {
    isCourseSelected(state) {
      return courseKey => state.schedule.map(x => x.courseKey).includes(courseKey);
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
    },
    changeSchedule({ commit }, newSchedule) {
      commit('changeSchedule', newSchedule);
    }
  }
});
