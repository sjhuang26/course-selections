<template>
  <div>
    <h1>Graduation requirements</h1>
    <ul class="list-group">
      <li
        v-for="scheduledCourse of schedule"
        :key="'grad-req-' + scheduledCourse.grade + scheduledCourse.courseKey"
        class="list-group-item"
      >
        {{ scheduledCourse.grade }} {{ scheduledCourse.courseKey }}
      </li>
    </ul>
    <h2>Issues</h2>
    <Issue
      v-for="issue of issues"
      :key="'issue-' + JSON.stringify(issue)"
      :issue="issue"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { validate } from '../js/validation';

import Issue from './Issue';

export default {
  name: 'GraduationRequirementsPage',
  components: {
    Issue
  },
  computed: {
    issues() {
      return validate(this.schedule);
    },
    ...mapState(['schedule'])
  }
};
</script>
