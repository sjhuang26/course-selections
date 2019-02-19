<template>
  <div>
    <h1>{{ subject.name }}</h1>
    <hr class="mb-4" />
    <b-img :src="imageUrl" thumbnail fluid class="infographic" />
    <div class="input-group my-3">
      <div class="input-group-prepend">
        <span class="input-group-text">Search courses</span>
      </div>
      <VueFuse
        :keys="['key', 'courses.key', 'courses.name']"
        event-name="results"
        :list="baseCoursesSearchArray"
        placeholder="Search courses"
        @fuseInputChanged="updateSearchInput"
        class="form-control"
      />
    </div>
    <BaseCoursePicker
      v-show="searchInput !== ''"
      :header="
        Object.keys(searchResultsObject).length > 0
          ? 'Search results'
          : 'No courses found'
      "
      :baseCourses="searchResultsObject"
    />
    <div
      v-for="(category, categoryKey) of subject.categories"
      :key="'subject-listing-category-' + categoryKey"
      class="mt-5"
    >
      <h2>{{ category.name }}</h2>
      <BaseCoursePicker :baseCourses="category.baseCourses" />
    </div>
  </div>
</template>

<script>
import { subjects } from '../js/data';
import BaseCoursePicker from './BaseCoursePicker';

export default {
  name: 'SubjectPage',
  components: {
    BaseCoursePicker
  },
  props: {
    subjectKey: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      searchResults: [],
      searchInput: ''
    };
  },
  created() {
    this.$on('results', results => {
      this.searchResults = results.slice(0, 3);
    });
  },
  methods: {
    updateSearchInput(newSearchInput) {
      this.searchInput = newSearchInput;
    }
  },
  computed: {
    subject() {
      return subjects[this.subjectKey];
    },
    imageUrl() {
      return require('../assets/course-infographics/' +
        this.subjectKey +
        '.png');
    },
    baseCoursesSearchArray() {
      const result = [];
      for (const [key, baseCourseValue] of Object.entries(
        this.subject.baseCourses
      )) {
        const courseResult = [];
        for (const [key, value] of Object.entries(baseCourseValue.courses)) {
          courseResult.push({
            key: key,
            name: value.name
          });
        }
        result.push({
          key,
          courses: courseResult
        });
      }
      return result;
    },
    searchResultsObject() {
      const result = {};
      for (const { key } of this.searchResults) {
        result[key] = this.subject.baseCourses[key];
      }
      return result;
    }
  }
};
</script>
