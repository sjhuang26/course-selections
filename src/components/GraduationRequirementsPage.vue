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
    <p>{{ issues }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { validate } from '../js/validation';

export default {
  name: 'GraduationRequirementsPage',
  computed: {
    issues() {
      return validate(this.schedule);
    },
    ...mapState(['schedule'])
  }
};
</script>
