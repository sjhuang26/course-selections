<template>
  <div>
    <h1 class="display-2 mb-5">Graduation requirements</h1>
    <h2 class="mb-4">List of courses</h2>
    <div class="mb-5">
      <b-list-group>
        <b-list-group-item
          v-for="scheduledCourse of schedule"
          :key="
            'grad-course-list-' +
              scheduledCourse.grade +
              scheduledCourse.courseKey
          "
        >
          {{ courses[scheduledCourse.courseKey].name }} (grade
          {{ numberToGrade(scheduledCourse.grade) }})
        </b-list-group-item>
      </b-list-group>
      <b-alert v-if="schedule.length === 0" variant="primary" show>No courses yet!</b-alert>
    </div>
    <h2 class="mb-4">Graduation checklist</h2>
    <b-list-group class="mb-5">
      <template v-for="group of validationResult.graduationChecklist">
        <b-list-group-item
          variant="primary"
          :key="'group-header-' + group.header"
          >{{ group.header }}</b-list-group-item
        >
        <b-list-group-item
          v-for="entry of group.required"
          :key="
            'validation-result-entry-' + group.header + JSON.stringify(entry)
          "
        >
          <b-badge :variant="entry.value ? 'success' : 'danger'">{{
            entry.value ? 'Pass' : 'Fail'
          }}</b-badge>
          {{ entry.name }}
        </b-list-group-item>
        <b-list-group-item
          v-for="entry of group.advanced"
          :key="
            'validation-result-entry-' + group.header + JSON.stringify(entry)
          "
        >
          <b-badge :variant="entry.value ? 'success' : 'danger'">{{
            entry.value ? 'Pass' : 'Fail'
          }}</b-badge>
          {{ entry.name }}
          <span class="badge badge-primary">For advanced diploma</span>
        </b-list-group-item>
      </template>
    </b-list-group>
    <h2 class="mb-4">Issues with courses</h2>
    <Issue
      v-for="issue of validationResult.issues"
      :key="'issue-' + JSON.stringify(issue)"
      :issue="issue"
      class="mb-4"
    />
    <b-alert v-if="validationResult.issues.length === 0" variant="primary" show>No issues!</b-alert>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { validate } from '../js/validation';
import { courses, numberToGrade } from '../js/data';

import Issue from './Issue';

export default {
  name: 'GraduationRequirementsPage',
  components: {
    Issue
  },
  data() {
    return {
      courses
    };
  },
  methods: {
    numberToGrade
  },
  computed: {
    validationResult() {
      return validate(this.schedule);
    },
    ...mapState(['schedule'])
  }
};
</script>
