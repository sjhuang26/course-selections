<template>
  <div>
    <h1>Graduation requirements</h1>
    <h2>List of courses</h2>
    <b-list-group>
      <b-list-group-item
        v-for="scheduledCourse of schedule"
        :key="'grad-course-list-' + scheduledCourse.grade + scheduledCourse.courseKey"
      >
        {{ courses[scheduledCourse.courseKey].name }} (grade {{ scheduledCourse.grade }})
      </b-list-group-item>
    </b-list-group>
    <h2>Graduation checklist</h2>
    <b-list-group>
      <template
        v-for="group of validationResult.graduationChecklist"
        :key="'validation-result-group-' + JSON.stringify(group)"
      >
        <b-list-group-item variant="primary">{{ group.header }}</b-list-group-item>
        <b-list-group-item
          v-for="entry of group.required"
          :key="'validation-result-entry-' + group + JSON.stringify(group.entry)"
        >
          <b-badge :variant="group.value ? 'success' : 'danger'">{{ group.value ? 'Pass' : 'Fail' }}</b-badge>
          {{ group.name }}
        </b-list-group-item>
        <b-list-group-item
          v-for="entry of group.required"
          :key="'validation-result-entry-' + group + JSON.stringify(group.entry)"
        >
          <b-badge :variant="group.value ? 'success' : 'danger'">{{ group.value ? 'Pass' : 'Fail' }}</b-badge>
          {{ group.name }}
          <span class="badge badge-primary">For advanced diploma</span>
        </b-list-group-item>
      </template>
    </b-list-group>
    <h2>Issues</h2>
    <Issue
      v-for="issue of validationResult.issues"
      :key="'issue-' + JSON.stringify(issue)"
      :issue="issue"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { validate } from '../js/validation';
import { courses } from '../js/data';

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
  computed: {
    validationResult() {
      return validate(this.schedule);
    },
    ...mapState(['schedule'])
  }
};
</script>
