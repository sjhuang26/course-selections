<template>
  <div class="v-layout">
    <b-card class="text-center m-4 lead flex-fit-content" body-class="p-2">
      High School Schedule Planner
    </b-card>
    <div class="h-layout">
      <b-card class="m-4 flex-fit-content scroll-layout" body-class="p-2">
        <h2>Subjects</h2>
        <div class="list-group">
          <div
            class="list-group-item list-group-item-action"
            v-for="(subject, subjectKey) of subjects"
            :key="'navigation-subject-' + subjectKey"
            @click="navigateToPage(['subject', subjectKey])"
            :class="{
              active:
                currentPage[0] === 'subject' && currentPage[1] === subjectKey
            }"
          >
            {{ subject.name }}
          </div>
          <div
            class="list-group-item list-group-item-action list-group-item-primary"
            @click="navigateToPage(['graduation-requirements'])"
            :class="{ active: currentPage[0] === 'graduation-requirements' }"
          >
            Graduation requirements
          </div>
        </div>
      </b-card>
      <div class="v-layout m-4 scroll-layout">
        <div v-if="currentPage[0] === 'home'">
          <div class="jumbotron">
            <h1 class="display-4">Welcome!</h1>
            <p class="lead">
              Here, you can create a four-year plan for high school course
              selections.
            </p>
            <p class="lead">Start by selecting a subject.</p>
          </div>
        </div>
        <SubjectPage
          v-if="currentPage[0] === 'subject'"
          :subjectKey="currentPage[1]"
        />
        <GraduationRequirementsPage
          v-if="currentPage[0] === 'graduation-requirements'"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { subjects } from '../js/data';
import SubjectPage from './SubjectPage';
import GraduationRequirementsPage from './GraduationRequirementsPage';

export default {
  name: 'App',
  components: {
    SubjectPage,
    GraduationRequirementsPage
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
