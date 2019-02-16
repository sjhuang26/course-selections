<template>
  <div class="v-layout scroll-layout">
    <h1 class="flex-fit-content">{{ subject.name }}</h1>
    <ul class="list-group">
      <li
        v-for="(baseCourse, baseCourseKey) of subjectData"
        :key="'subject-listing-' + baseCourseKey"
        class="list-group-item"
      >
        {{ baseCourseKey }}
        <div v-if="Subjects.levelCount(baseCourse) > 1">
          <button
            v-for="(course, level) of baseCourse"
            :key="'subject-level-button-' + level"
            class="btn btn-primary"
          >
            Add {{ level }}
          </button>
        </div>
        <div v-else>
          <button class="btn btn-primary">Add</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { data, subjects, Subjects } from '../js/data';

export default {
  name: 'SubjectPage',
  props: {
    subjectKey: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      data
    };
  },
  created() {
    this.Subjects = Subjects;
  },
  computed: {
    subject() {
      return subjects[this.subjectKey];
    },
    subjectData() {
      return data[this.subjectKey];
    }
  }
};
</script>
