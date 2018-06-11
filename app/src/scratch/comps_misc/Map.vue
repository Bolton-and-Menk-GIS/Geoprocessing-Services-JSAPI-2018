<template>
<div id="mapwrapper">
  <div id="viewDiv"></div>
  <Slider :direction="'Right'">
    <div slot="content" style="width: 100%; height: 100%;">
      <div style="color: white;">Injected Content</div>
      <ExportMap></ExportMap>
    </div>
  </Slider>
</div>
</template>
<script>
  import Slider from "./Slider.vue";
  import ExportMap from "./Export_Map.vue"

  import { loadModules } from 'esri-loader';

  export default {
    name: 'map-component',
    props: ['basemap'],
    components:{Slider, ExportMap},
    data(){
      return {
        map: null,
        view: null
      }
    },
    mounted: function () {
      loadModules(['esri/Map', 'esri/views/MapView'])
        .then(([Map, MapView]) => {
          // initialize map and view
          this.map = new Map({
            basemap: this.basemap || "satellite"
          });

          this.view = new MapView({
            container: "viewDiv",
            map: this.map,
            zoom: 16,
            center: [-93.3, 45]
          });
        })
        .catch(err => {
          // handle any script or module loading errors
          console.error(err);
        });
    }
  }


</script>

<style>
  #viewDiv{
    width: 100%;
    height: 100%;
  }

  #mapwrapper{
    display: flex;
    /*flex-direction: column;*/
    position: relative;
    width: 100%;
    height: inherit;
    border-radius: 2px;
  }

</style>
