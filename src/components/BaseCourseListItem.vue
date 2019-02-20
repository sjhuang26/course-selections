<template>
  <b-list-group-item class="course">
    <div class="course-names">
      <div
        v-for="course of baseCourse.courses"
        :key="'subject-listing-course-' + course.key"
      >
        {{ course.id }} {{ course.name }}
      </div>
    </div>
    <CourseToggleButton
      v-for="(course, level) of baseCourse.courses"
      :key="'subject-level-button-' + level"
      :course="course"
      :level="level"
    />
  </b-list-group-item>
</template>

<style scoped>
.course {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.course-names {
  flex: 1 1 auto;
}
</style>

<script>
import CourseToggleButton from './CourseToggleButton';

export default {
  name: 'BaseCourseListItem',
  components: {
    CourseToggleButton
  },
  props: {
    baseCourseKey: {
      type: String,
      required: true
    },
    baseCourse: {
      type: Object,
      required: true
    }
  }
};
</script>
