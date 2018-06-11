<template>
  <div id="mapwrapper">
    <div id="viewDiv"></div>
    <!--<Slider :direction="'Right'">-->
      <!--<div slot="content" style="width: 100%; height: 100%;">-->
        <!--<div style="color: white;">Injected Content</div>-->
        <!--&lt;!&ndash;<div style="height: 80%; width: 80%; background-color: white; margin-right: 50px;"></div>&ndash;&gt;-->
        <!--<ExportMap></ExportMap>-->
      <!--</div>-->
    <!--</Slider>-->
  </div>
</template>

<script>
  import Slider from "./Slider.vue";
  import ExportMap from "./Export_Map.vue";
  import featurelayer_configs from "../modules/presentation_config.js";
  import data from "../../data/buildings_mercator.json";

  // import sampleData from "../../data/service_geom.json";

  import sampleData from "../../data/service_geom_f.json";


  const { symbols, popupTemplate } = featurelayer_configs

  import { loadModules } from 'esri-loader';

  export default {
    name: "scene-component",
    props: ['basemap'],
    components:{Slider, ExportMap},
    data(){
      return{
        layers:{
          feature: null
        },
        views:{
          map: null,
          scene: null,
          active: null
        },
        config:{
          // initExtent: {x: -8354625.242281401, y: 4641993.932138052, z: 500, spatialReference: {wkid: 3857}},
          initExtent: {x: -10377194.866578178, y: 5617375.123604663, z: 500, spatialReference: {wkid: 102100}},
          aspect: {heading: 300, tilt: 65},
          container: "viewDiv"
        }
      }
    },
    methods:{
      switchViewAlt(map, scene, active){

      },
      switchView(){
        this.views.active.container = null;
        let extent = this.views.active.viewpoint;
        if(this.views.active.type === '3d'){
          this.views.active = this.views.map;
          this.views.active.viewpoint = extent;
          // this.views.active.viewpoint.camera.heading = this.config.aspect.heading;
          // this.views.active.viewpoint.camera.tilt = this.config.aspect.tilt;
          // this.layers.feature.renderer = renderers._2d;
          this.views.map.container = 'viewDiv';
        }else{
          this.views.active = this.views.scene;
          this.views.active.viewpoint = extent;
          // this.layers.feature.renderer = renderers._3d;
          this.views.scene.container = 'viewDiv';
        }

        // setTimeout(()=>{
        //   this.views.active.popup.dockEnabled = true;
        // },10)
      }
    },
    mounted(){

      const dojoConfig = {
        has: {  "esri-featurelayer-webgl": 1}
      };

      loadModules(['esri/Map', 'esri/views/MapView', 'esri/views/SceneView', 'esri/Graphic', 'esri/geometry/support/webMercatorUtils', 'esri/layers/FeatureLayer', 'esri/widgets/Legend'],{dojoConfig}).then(([Map, MapView, Scene, Graphic, WMU, FeatureLayer, Legend])=>{
        // :: INSTANTIATE FEATURE LAYER :: \\
        // const buildingsLyr = new FeatureLayer({
        //   url: "https://services1.arcgis.com/jjVcwHv9AQEq3DH3/ArcGIS/rest/services/Buildings/FeatureServer/0",
        //   renderer: renderers._3d,
        //   popupTemplate: popupTemplate, // autocasts as new PopupTemplate()
        //   outFields: ["ADDRESS", "DESCLU", "ELEVATION"],
        //   definitionExpression: "ELEVATION > 0", // show only buildings with height
        //   minScale: 2500
        // });

          // :: INSTANTIATE MAP :: \\
          const map = new Map({
          basemap: this.basemap || "satellite",
          ground: "world-elevation"
          // layers: [buildingsLyr]
        });

        // :: INSTANTIATE MAPVIEW :: \\
        //   this.views.map = new MapView({
        //   // container: "viewDiv",
        //   map: map,
        //   zoom: 16,
        //   center: this.config.initExtent,
        //   popup:{
        //     dockOptions:{
        //       position: 'bottom-right'
        //     }
        //   }
        // });

        // :: INSTANTIATE SCENEVIEW :: \\
          let view = new Scene({
          container: "viewDiv",
          map: map,
          camera: {
            position: this.config.initExtent,
            heading: this.config.aspect.heading,
            tilt: this.config.aspect.tilt
          },
            popup:{
              highlightEnabled: false,
              dockOptions:{
                position: 'bottom-right'
              }
            }
        });

        // this.layers.feature = buildingsLyr;
        // this.views.active = this.views.map;
        // this.views.active = this.views.scene;

        // ::::: ADD LIDAR GRAPHICS :::::: \\
        view.when(()=>{
          console.log("GRAPHIC ", Graphic);

                    // :: SAMPLE ADD :: \\
          // let symbol = {
          //   type: "simple-fill",
          //     color: "#FC921F",
          //     style: 'solid',
          //     outline:{
          //     color: '#FCFA3E',
          //       width: 0.75
          //   }
          // }

          // STYLES :: https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=layers-scenelayer-edges

          let solidEdges = {
            type: "solid",
            color: [0, 72, 131, 0.6],
            size: 1
          };

          let sketchEdges = {
            type: "sketch",
            color: [0, 72, 131, 0.4],
            size: 1.2,
            extensionLength: 3
          };

          let symbol = {
            type: "polygon-3d", // autocasts as new PolygonSymbol3D()
            symbolLayers: [{
              type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
              material: {
                color: "#86CFE8"
              },
              edges: solidEdges
            }]
          }


          const mapStore = {
              layers:{
                feature: null
              },
              views:{
                map: null,
                scene: null,
                active: null
              },
              config:{
                // initExtent: {x: -8354625.242281401, y: 4641993.932138052, z: 500, spatialReference: {wkid: 3857}},
                initExtent: {x: -10377194.866578178, y: 5617375.123604663, z: 500, spatialReference: {wkid: 102100}},
                aspect: {heading: 300, tilt: 65},
                container: "viewDiv"
              }
            }

          // :: SAMPLE ADD :: \\
          // let GO = new Graphic();
          // symbol.symbolLayers[0].size = sampleData.features[0].attributes.ELEVATION;
          // GO.symbol = symbol;
          // GO.attributes = sampleData.features[0].attributes;
          // let geom = {type: 'polygon', rings: sampleData.features[0].geometry.rings, spatialReference: sampleData.spatialReference};
          // GO.geometry = geom;
          //
          // this.views.active.graphics.add(GO);

        // :: ------------------------------------------ :: \\
        // :: ITERATE THROUGH SAMPLE DATA AND ADD TO MAP :: \\
        // :: ------------------------------------------ :: \\
          data.features.map((v)=>{
            let lidar_graphic = new Graphic();
            let geom = {type: 'polygon', rings: v.geometry.rings, spatialReference: data.spatialReference};
            console.log(`HEIGHT ${v.attributes.Height}`)
            // symbols['3d'].symbolLayers[0].size = v.attributes.Height * 0.3048;
            symbols['3d'].symbolLayers[0].size = v.attributes.Height * 0.25;
            lidar_graphic.attributes = v.attributes;
            lidar_graphic.symbol = symbols['3d'];
            lidar_graphic.geometry = geom;
            view.graphics.add(lidar_graphic);
          });
        //
        //   console.log("THIS VIEWS ACTIVE ", this.views.active.graphics)
        // :: ------------------------------------------ :: \\
        // :: ITERATE THROUGH SAMPLE DATA AND ADD TO MAP :: \\
        // :: ------------------------------------------ :: \\

          // console.log("SHOW LDIAR GRAHPIC ", lidar_graphic)

          // this.views.active.popup.dockEnabled = true;
        });

        // ::::: ADD LIDAR GRAPHICS :::::: \\

        // window.renderer = renderers;
        window.sceneC = this;

      }) // LOAD MODULE CLOSURE
    }
  }
</script>

<style scoped>
  html,
  body,
  #viewDiv {
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
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