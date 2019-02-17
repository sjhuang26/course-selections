<template>
  <div class="v-layout scroll-layout">
    <h1 class="flex-fit-content">{{ subject.name }}</h1>
    <div
      v-for="(category, categoryKey) of subject.categories"
      :key="'subject-listing-category-' + categoryKey"
    >
      <h2>{{ category.name }}</h2>
      <ul class="list-group">
        <li
          v-for="(baseCourse, baseCourseKey) of category.baseCourses"
          :key="'subject-listing-' + baseCourseKey"
          class="list-group-item"
        >
          <p
            v-for="course of baseCourse.courses"
            :key="'subject-listing-course-' + course.key"
          >
            {{ course.id }} {{ course.name }}
          </p>
          <div v-if="baseCourse.size > 1">
            <button
              v-for="(course, level) of baseCourse.courses"
              :key="'subject-level-button-' + level"
              class="btn btn-primary"
            >
              Add {{ levelsToNames[level] }}
            </button>
          </div>
          <div v-else>
            <button class="btn btn-primary">Add</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { subjects, levelsToNames } from '../js/data';

export default {
  name: 'SubjectPage',
  props: {
    subjectKey: {
      type: String,
      required: true
    }
  },
  computed: {
    subject() {
      return subjects[this.subjectKey];
    },
    levelsToNames() {
      return levelsToNames;
    }
  }
};
</script>
