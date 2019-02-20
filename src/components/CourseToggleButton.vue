<template>
  <button
    @click="toggleCourse(course.key)"
    class="btn mx-1"
    :class="
      isCourseSelected(course.key) ? 'btn-primary' : 'btn-outline-primary'
    "
  >
    {{ courseToggleText(course, level) }}
  </button>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { levelsToNames } from '../js/data';

export default {
  name: 'CourseToggleButton',
  props: {
    course: {
      type: Object,
      required: true
    },
    level: {
      type: String,
      required: true
    }
  },
  computed: {
    levelsToNames() {
      return levelsToNames;
    },
    ...mapGetters(['isCourseSelected'])
  },
  methods: {
    courseToggleText(course, level) {
      const verb = this.isCourseSelected(course.key) ? 'Remove' : 'Add';
      return level === 'e' ? verb : verb + ' ' + levelsToNames[level];
    },
    ...mapActions(['toggleCourse'])
  }
};
</script>
