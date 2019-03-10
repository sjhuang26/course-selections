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
  </b-alert>
</template>

<script>
import IssueRule from './IssueRule';
import { numberToGrade } from '../js/data';

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
  methods: {
    numberToGrade
  }
};
</script>
