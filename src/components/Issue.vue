<template>
  <b-alert show variant="danger">
    {{ alertContent }}
  </b-alert>
</template>

<script>
import { courses, numberToGrade } from '../js/data';

export default {
  name: 'Issue',
  props: {
    issue: {
      type: Object,
      required: true
    }
  },
  computed: {
    alertContent() {
      const { issue } = this;
      if (issue.type === 'prereq') {
        return (
          courses[issue.course].name +
          ' cannot be taken without taking ' +
          courses[issue.prereq].name +
          ' first.'
        );
      }
      if (issue.type === 'duplicate-entry') {
        return (
          'In grade ' +
          numberToGrade(issue.grade) +
          ', there are too many copies of course ' +
          issue.baseCourse +
          '.'
        );
      }
      if (issue.type === 'duplication') {
        return (
          'You can only take course ' +
          issue.baseCourse +
          ' once.'
        );
      }
      return 'Unknown issue';
    }
  }
};
</script>
