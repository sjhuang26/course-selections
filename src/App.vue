<template>
  <AppBody />
</template>

<script>
import AppBody from './components/AppBody';

export default {
  name: 'App',
  components: {
    AppBody
  }
};
</script>

<style scoped>
.app {
  font-family: Helvetica, Arial, sans-serif;
  height: 100%;
}
</style>

<style>
.h-layout {
  display: flex;
  flex-flow: row;
  justify-content: center;
}
.h-layout > * {
  flex: 1;
  min-width: 0;
}
.v-layout {
  display: flex;
  flex-flow: column;
  justify-content: center;
}
.v-layout > * {
  flex: 1;
  min-height: 0;
}
.flex-fit-content {
  flex: 0 1 auto;
}
.scroll-layout {
  overflow: auto;
}
.fixed-scroll-layout {
  overflow: scroll;
}
</style>

<style lang="scss">
@import './styles/main.scss';
@import 'bootstrap/scss/bootstrap.scss';
</style>
