<template>
  <div class="v-layout">
    <b-card class="text-center m-4 lead" body-class="p-2">
      High School Schedule Planner
    </b-card>
    <div class="h-layout">
      <b-card class="m-4 flex-fit-content" body-class="p-2">
        <h2>Subjects</h2>
        <div class="list-group">
          <div
            class="list-group-item list-group-item-action"
            v-for="(subject, subjectKey) of subjects"
            :key="'navigation-subject-' + subjectKey"
            @click="navigateToPage(['subject', subjectKey])"
          >
            {{ subject.name }}
          </div>
          <div
            class="list-group-item list-group-item-action list-group-item-primary"
          >
            Graduation requirements
          </div>
        </div>
      </b-card>
      <div class="v-layout">
        <div v-if="currentPage[0] === 'home'">
          <h1>Welcome!</h1>
        </div>
        <SubjectPage
          v-if="currentPage[0] === 'subject'"
          :subjectKey="currentPage[1]"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { subjects } from '../js/data';
import SubjectPage from './SubjectPage';

export default {
  name: 'App',
  components: {
    SubjectPage
  },
  methods: {
    ...mapActions(['navigateToPage'])
  },
  computed: {
    ...mapState(['currentPage']),
    subjects() {
      return subjects;
    }
  }
};
</script>
