<template>
  <b-list-group>
    <b-list-group-item v-if="header" variant="primary">
      {{ header }}
    </b-list-group-item>
    <BaseCourseListItem
      v-for="(baseCourse, baseCourseKey) of baseCourses"
      :key="'subject-listing-' + baseCourseKey"
      :baseCourse="baseCourse"
      :baseCourseKey="baseCourseKey"
    />
  </b-list-group>
</template>

<script>
import BaseCourseListItem from './BaseCourseListItem';

export default {
  name: 'BaseCoursePicker',
  components: {
    BaseCourseListItem
  },
  props: {
    baseCourses: {
      type: Object,
      required: true
    },
    header: {
      type: String,
      required: false
    }
  }
};
</script>
