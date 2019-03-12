<template>
  <b-alert show :variant="variant">
    <div v-if="issue.type === 'prereq'">
      <p class="lead">
        Prerequisite issue with {{ courses[issue.course].name }}
      </p>
      <p>
        {{
          issue.severity === 'error'
            ? 'Requirements:'
            : 'Recommended (but not required):'
        }}
      </p>
      <IssueRule :rule="issue.rule" />
    </div>
    <div v-if="issue.type === 'duplicate-entry'">
      <p class="lead">Duplicate courses</p>
      <p>
        In grade {{ numberToGrade(issue.grade) }}, there are too many copies of
        course type "{{ issue.baseCourse }}".
      </p>
    </div>
    <div v-if="issue.type === 'duplication'">
      <p class="lead">Duplicate courses</p>
      <p>You can only take course type "{{ issue.baseCourse }}" once.</p>
    </div>
    <div v-if="issue.type === 'grade-constraint'">
      <p class="lead">Wrong grade</p>
      <p>
        You have to take {{ courses[issue.course].name }} during grade
        {{ numberToGrade(issue.requiredGrade) }}.
      </p>
    </div>
    <div v-if="issue.type === 'grade-common'">
      <p class="lead">Uncommon grade</p>
      <p>
        It is uncommon to take course {{ courses[issue.course].name }} during
        grade {{ numberToGrade(issue.currentGrade) }}.
      </p>
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
  },
  computed: {
    variant() {
      if (this.issue.severity === 'error') return 'danger';
      if (this.issue.severity === 'warning') return 'warning';
      if (this.issue.severity === 'info') return 'info';
      throw new Error('unknown issue severity');
    }
  }
};
</script>
