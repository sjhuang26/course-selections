<template>
  <ul class="list-group">
    <li v-if="header" class="list-group-item list-group-item-primary">
      {{ header }}
    </li>
    <li
      v-for="(baseCourse, baseCourseKey) of baseCourses"
      :key="'subject-listing-' + baseCourseKey"
      class="list-group-item course"
    >
      <div class="course-names">
        <div
          v-for="course of baseCourse.courses"
          :key="'subject-listing-course-' + course.key"
        >
          {{ course.id }} {{ course.name }}
        </div>
      </div>
      <button
        v-for="(course, level) of baseCourse.courses"
        :key="'subject-level-button-' + level"
        @click="toggleCourse(course.key)"
        class="btn mx-1"
        :class="
          isCourseSelected(course.key) ? 'btn-primary' : 'btn-outline-primary'
        "
      >
        {{ courseToggleText(course, level) }}
      </button>
    </li>
  </ul>
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
import { mapGetters, mapActions } from 'vuex';
import { levelsToNames } from '../js/data';

export default {
  name: 'BaseCoursePicker',
  props: {
    baseCourses: {
      type: Object,
      required: true
    },
    header: {
      type: String,
      required: false
    }
  },
  methods: {
    courseToggleText(course, level) {
      const verb = this.isCourseSelected(course.key) ? 'Remove' : 'Add';
      return level === 'e' ? verb : verb + ' ' + levelsToNames[level];
    },
    ...mapActions(['toggleCourse'])
  },
  computed: {
    levelsToNames() {
      return levelsToNames;
    },
    ...mapGetters(['isCourseSelected'])
  }
};
</script>
