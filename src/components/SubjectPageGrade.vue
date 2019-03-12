<template>
  <b-list-group class="my-4">
    <b-list-group-item variant="primary">{{ gradeDisplay }}</b-list-group-item>
    <draggable v-model="scheduleGrade" :options="{ group: 'scheduledCourses' }">
      <CourseListItem
        v-for="scheduledCourse of scheduleGrade"
        :key="'subject-page-grade-draggable-' + scheduledCourse.courseKey"
        :courseKey="scheduledCourse.courseKey"
        :course="subject.courses[scheduledCourse.courseKey]"
      />
    </draggable>
  </b-list-group>
</template>

<script>
import draggable from 'vuedraggable';
import { subjects, courses } from '../js/data';

import CourseListItem from './CourseListItem';
export default {
  name: 'SubjectPageGrade',
  components: {
    draggable,
    CourseListItem
  },
  props: {
    subjectKey: {
      type: String,
      required: true
    },
    grade: {
      type: Number,
      required: true
    }
  },
  computed: {
    subject() {
      return subjects[this.subjectKey];
    },
    courses() {
      return courses;
    },
    scheduleGrade: {
      get() {
        // Only look at the courses in the schedule with matching subject and grade
        const condition = x =>
          this.courses[x.courseKey].subject === this.subjectKey &&
          x.grade === this.grade;
        return this.$store.state.schedule.filter(condition);
      },
      set(value) {
        // Set the new schedule to [old schedule with CONDITION courses removed] + [value, but with the grade set to the new grade]
        const condition = x =>
          this.courses[x.courseKey].subject === this.subjectKey &&
          x.grade === this.grade;
        this.$store.dispatch(
          'changeSchedule',
          this.$store.state.schedule
            .filter(x => !condition(x))
            .concat(
              value.map(value => ({
                grade: this.grade,
                courseKey: value.courseKey
              }))
            )
        );
      }
    },
    gradeDisplay() {
      const gradeToDisplay = {
        0: 'No grade',
        1: '9th grade',
        2: '10th grade',
        3: '11th grade',
        4: '12th grade'
      };
      const suffix = this.scheduleGrade.length === 0 ? ' (no courses)' : '';
      return gradeToDisplay[this.grade] + suffix;
    }
  }
};
</script>
