<template>
  <div v-if="isListNeeded">
    <p>{{ rule.type === 'and' ? 'All of' : 'Any one of' }}</p>
    <ul>
      <li
        v-for="child of rule.values"
        :key="'issue-rule-' + JSON.stringify(child)"
      >
        <IssueRule :rule="child" />
      </li>
    </ul>
  </div>
  <span v-else-if="isPrimitive">
    <span v-if="rule.type === 'course'"
      >course {{ courses[rule.key] ? courses[rule.key].name : '???' }}</span
    >
    <span v-if="rule.type === 'condition'">{{
      conditions[rule.name] ? conditions[rule.name].name : '???'
    }}</span>
    <span v-if="rule.concurrent"><i> (concurrent)</i></span>
  </span>
  <span v-else>
    <IssueRule :rule="rule.values[0]" /> {{ linkingWord }}
    <IssueRule :rule="rule.values[1]" />
  </span>
</template>

<script>
import { conditions } from '../js/validation';
import { courses } from '../js/data';

export default {
  name: 'IssueRule',
  props: {
    rule: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      conditions,
      courses
    };
  },
  computed: {
    isPrimitive() {
      return this.rule.type !== 'and' && this.rule.type !== 'or';
    },
    linkingWord() {
      // may change in future
      return this.rule.type;
    },
    isListNeeded() {
      const { rule } = this;
      if (this.isPrimitive) return false;
      if (rule.values.length > 2) {
        return true;
      }
      // CASE: if any one of the children is AND or OR
      for (const child of rule.values) {
        if (child.type === 'and' || child.type === 'or') {
          return true;
        }
      }
      return false; // no list is needed (the format will look like __ AND __ or __ OR __)
    }
  }
};
</script>
