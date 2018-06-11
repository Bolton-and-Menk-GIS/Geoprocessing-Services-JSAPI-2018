<!-- :::: VUE ENTRY POINT :::: -->
<template>
  <div id="app">
    <SceneComponent :basemap="'topo'"></SceneComponent>
  </div>
</template>

<script>
  import 'babel-polyfill';
  import SceneComponent from "./components/Scene.vue";

  export default {
    components: {SceneComponent},
    name: 'app'
  }
</script>

<style lang="scss">
  /* :: esri styles :: */
  @import url(https://js.arcgis.com/4.7/esri/css/main.css);
  /* :: Bootstrap & Bootstrap Vue styles :: */
  @import url(//unpkg.com/bootstrap/dist/css/bootstrap.min.css);
  @import url(//unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.css);
  /* :: Fonts :: */
  @import url(//fonts.googleapis.com/css?family=Play);

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  #app {
    font-family: 'Play', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
  }
</style>
