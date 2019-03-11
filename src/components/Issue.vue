<template>
  <b-alert show variant="danger">
    <div v-if="issue.type === 'prereq'">
      <p class="lead">Prerequisite issue with {{ issue.course }}</p>
      <p>Requirements:</p>
      <IssueRule :rule="issue.rule"/>
    </div>
    <div v-if="issue.type === 'duplicate-entry'">
      <p class="lead">Duplicate courses</p>
      <p>In grade {{ numberToGrade(issue.grade) }}, there are too many copies of course {{ issue.baseCourse }}.</p>
    </div>
    <div v-if="issue.type === 'duplication'">
      <p class="lead">Duplicate courses</p>
      <p>You can only take course {{ issue.baseCourse }} once.</p>
    </div>
    <div v-if="issue.type === 'grade-constraint'">
      <p class="lead">Wrong grade</p>
      <p>You have to take {{ courses[issue.course].name }} during grade {{ numberToGrade(issue.requiredGrade) }}.</p>
    </div>
    <div v-if="issue.type === 'grade-common'">
      <p class="lead">Uncommon grade</p>
      <p>It is uncommon to take course {{ courses[issue.course].name }} during grade {{ numberToGrade(issue.currentGrade) }}.</p>
    </div>
  </b-alert>
</template>

<script>
import IssueRule from './IssueRule';
import { numberToGrade, courses } from '../js/data';

export default {
  name: 'Issue',
  components: {
    IssueRule
  },
  props: {
    issue: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      courses
    };
  },
  methods: {
    numberToGrade
  }
};
</script>
