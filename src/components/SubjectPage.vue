<template>
  <div>
    <div v-show="courseBrowserOpen">
      <h1 class="display-2 mb-5">All courses</h1>
      <button
        class="btn btn-primary btn-block btn-lg"
        @click="courseBrowserOpen = false"
      >
        Back
      </button>
      <hr class="mb-4" />
      <div
        v-for="(category, categoryKey) of subject.categories"
        :key="'subject-listing-category-' + categoryKey"
        class="mt-5"
      >
        <h2>{{ category.name }}</h2>
        <BaseCoursePicker :baseCourses="category.baseCourses" />
      </div>
    </div>
    <div v-show="!courseBrowserOpen">
      <h1 class="display-1 mb-5">{{ subject.name }}</h1>
      <button
        class="btn btn-primary btn-block btn-lg mb-5"
        @click="courseBrowserOpen = true"
      >
        Browse all courses
      </button>
      <b-img :src="imageUrl" thumbnail fluid class="infographic mb-5" />
      <div class="input-group mb-5">
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
        class="mb-5"
      />
      <h2>Arrange the courses (drag and drop)</h2>

      <SubjectPageGrade :subjectKey="subjectKey" :grade="0" />
      <SubjectPageGrade :subjectKey="subjectKey" :grade="1" />
      <SubjectPageGrade :subjectKey="subjectKey" :grade="2" />
      <SubjectPageGrade :subjectKey="subjectKey" :grade="3" />
      <SubjectPageGrade :subjectKey="subjectKey" :grade="4" />
    </div>
  </div>
</template>

<script>
import { subjects, courses } from '../js/data';
import BaseCoursePicker from './BaseCoursePicker';
import SubjectPageGrade from './SubjectPageGrade';

export default {
  name: 'SubjectPage',
  components: {
    BaseCoursePicker,
    SubjectPageGrade
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
      searchInput: '',
      courseBrowserOpen: false
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
    courses() {
      return courses;
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
