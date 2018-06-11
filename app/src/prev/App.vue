<template>
  <div id="app">
    <!--<map-component :basemap="'topo'"></map-component>-->
    <!-- <SceneCompTest :basemap="'gray'"></SceneCompTest> -->
    <!--<WebGL></WebGL>-->
    <scene-component :basemap="'topo'"></scene-component>
    <Slider :direction="'Right'">
      <div slot="content" style="width: 100%; height: 100%;">
        <div style="color: white;">Injected Content</div>
        <ExportMap></ExportMap>
        <LidarImport></LidarImport>
      </div>
    </Slider>
  </div>
</template>

<script>

  import SceneComponent from "./components/Scene.vue";

//   import WebGL from "./components/Web_GL.vue";
// import MapComponent from "./components/Map.vue";
//   import SceneCompTest from "./components/Scene_Sample_Service.vue"
// import SceneVueData from "./components/Views_VueClash/Scene_Data.vue";

import Slider from "./components/Slider.vue";
import ExportMap from "./components/Export_Map.vue";
import LidarImport from "./components/Lidar_Import.vue";

export default {
  components: {SceneComponent, Slider, ExportMap, LidarImport},
  name: 'app',
  data () {
    return {
      msg: 'ArcGIS JS API Samples in a Vue.js App'
    }
  }
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

html, body{
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

  .nav-btn{
    position: absolute;
    top: 15px;
    bottom: 20px;
    z-index: 1000;
    height: 50px;
    right: 15px;
  }

$bmi-green: rgba(0,105,56,1);
$bmi-greenOp: rgba(105,215,163,0.5);

  .esri-popup__main-container{
    color: #e5e5e5;
    background: $bmi-green;
  }

.esri-table{
  color: #e5e5e5;
  background: $bmi-green;
}

.esri-popup__button{
  &.esri-popup__button--dock{
     color: white;
   }
}

.esri-popup__action-text{
    color: white;
  }

.esri-table tr:nth-child(odd) {
  background-color: $bmi-greenOp;
}

.esri-popup__icon{
  &.esri-icon-zoom-in-magnifying-glass:before {
  color: white;
}&.esri-icon-close:before{
  color: white;
   }
}

.esri-popup__pointer-direction{
  background-color: $bmi-green;
}

</style>
