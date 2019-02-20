<template>
  <b-list-group-item class="course">
    <div class="course-names">{{ course.id }} {{ course.name }}</div>
    <CourseToggleButton :course="course" :level="course.level" />
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
  name: 'CourseListItem',
  components: {
    CourseToggleButton
  },
  props: {
    courseKey: {
      type: String,
      required: true
    },
    course: {
      type: Object,
      required: true
    }
  }
};
</script>
