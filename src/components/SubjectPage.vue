<template>
  <div>
    <div v-show="courseBrowserOpen">
      <h1>All courses</h1>
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
        class="my-3"
      />
      <button
        class="btn btn-primary btn-block btn-lg"
        @click="courseBrowserOpen = true"
      >
        Browse all courses
      </button>
      <b-list-group>
        <b-list-group-item variant="primary">No grade</b-list-group-item>
        <draggable v-model="scheduleGrade0" :options="{ group: 'scheduledCourses' }">
          <CourseListItem
            v-for="scheduledCourse of scheduleGrade0"
            :key="'scheduled-courses-draggable-' + scheduledCourse.courseKey"
            :courseKey="scheduledCourse.courseKey"
            :course="subject.courses[scheduledCourse.courseKey]"
          />
        </draggable>
      </b-list-group>
      <b-list-group>
        <b-list-group-item variant="primary">9th grade</b-list-group-item>
        <draggable v-model="scheduleGrade9" :options="{ group: 'scheduledCourses' }">
          <CourseListItem
            v-for="scheduledCourse of scheduleGrade9"
            :key="'scheduled-courses-draggable-' + scheduledCourse.courseKey"
            :courseKey="scheduledCourse.courseKey"
            :course="subject.courses[scheduledCourse.courseKey]"
          />
        </draggable>
      </b-list-group>
      <b-list-group>
        <b-list-group-item variant="primary">10th grade</b-list-group-item>
        <draggable v-model="scheduleGrade10" :options="{ group: 'scheduledCourses' }">
          <CourseListItem
            v-for="scheduledCourse of scheduleGrade10"
            :key="'scheduled-courses-draggable-' + scheduledCourse.courseKey"
            :courseKey="scheduledCourse.courseKey"
            :course="subject.courses[scheduledCourse.courseKey]"
          />
        </draggable>
      </b-list-group>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { subjects, courses } from '../js/data';
import BaseCoursePicker from './BaseCoursePicker';
import CourseListItem from './CourseListItem';

export default {
  name: 'SubjectPage',
  components: {
    BaseCoursePicker,
    draggable,
    CourseListItem
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
    // code duplication ... oh, well ...
    scheduleGrade0: {
      get() {
        const condition = x => this.courses[x.courseKey].subject === this.subjectKey && x.grade === 0;
        return this.$store.state.schedule.filter(condition);
      },
      set(value) {
        const condition = x => this.courses[x.courseKey].subject === this.subjectKey && x.grade === 0;
        this.$store.dispatch('changeSchedule', this.$store.state.schedule.filter(x => !condition(x)).concat(value.map(value => ({grade: 0, courseKey: value.courseKey}))));
      }
    },
    scheduleGrade9: {
      get() {
        const condition = x => this.courses[x.courseKey].subject === this.subjectKey && x.grade === 9;
        return this.$store.state.schedule.filter(condition);
      },
      set(value) {
        const condition = x => this.courses[x.courseKey].subject === this.subjectKey && x.grade === 9;
        this.$store.dispatch('changeSchedule', this.$store.state.schedule.filter(x => !condition(x)).concat(value.map(value => ({grade: 9, courseKey: value.courseKey}))));
      }
    },
    scheduleGrade10: {
      get() {
        const condition = x => this.courses[x.courseKey].subject === this.subjectKey && x.grade === 10;
        return this.$store.state.schedule.filter(condition);
      },
      set(value) {
        const condition = x => this.courses[x.courseKey].subject === this.subjectKey && x.grade === 10;
        this.$store.dispatch('changeSchedule', this.$store.state.schedule.filter(x => !condition(x)).concat(value.map(value => ({grade: 10, courseKey: value.courseKey}))));
      }
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
