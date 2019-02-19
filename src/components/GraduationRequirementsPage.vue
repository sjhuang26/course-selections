<template>
  <div>
    <h1>Graduation requirements</h1>
    <ul class="list-group">
      <li
        v-for="courseKey of schedule"
        :key="'grad-req-' + courseKey"
        class="list-group-item"
      >
        {{ courseKey }}
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'GraduationRequirementsPage',
  computed: {
    ...mapState(['schedule'])
  }
};
</script>
