import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentPage: ['home']
  },
  mutations: {
    setPage(state, path) {
      state.currentPage = path;
    }
  },
  actions: {
    navigateToPage({ commit }, path) {
      commit('setPage', path);
    }
  }
});
