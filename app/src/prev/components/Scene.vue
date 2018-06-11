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
  import featurelayer_configs from "../modules/featureLayer_configs.js";

  import FL from "../modules/featureLayer_configs_Sample_Service.js";

  import data from "../../data/buildings_mercator.json";

  // import data from "../../data/downtown_esri.json";

  // import sampleData from "../../data/service_geom.json";

  import sampleData from "../../data/service_geom_f.json";

const {renderers } = FL;
  const { symbols, popupTemplate } = featurelayer_configs;

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
          view:{
            initExtent:{x: -10253568.62874889, y: 5907956.409385364, spatialReference: {wkid: 102100}}, // DULUTH
            // initExtent: {x: -8354625.242281401, y: 4641993.932138052, z: 500, spatialReference: {wkid: 3857}},
            // initExtent: {x: -10377194.866578178, y: 5617375.123604663, z: 500, spatialReference: {wkid: 102100}},
            aspect: {heading: 300, tilt: 65},
            container: "viewDiv"
          },
          layers:{
            // parcels: '//gis.bolton-menk.com/bmigis/rest/services/MN_GIS/Duluth_Parcels/MapServer',
            intersections: '//www.esri.com/arcgis-blog/products/js-api-arcgis/mapping/using-the-new-webpack-plugin-for-the-arcgis-api-for-javascript/',
            parcels: '//gis.stlouiscountymn.gov/arcgis/rest/services/GeneralUse/OpenData/MapServer',
            building: '//services1.arcgis.com/jjVcwHv9AQEq3DH3/ArcGIS/rest/services/Buildings/FeatureServer/0',
          }

        }
      }
    },
    methods:{
      switchView(){
        this.views.active.container = null;
        let extent = this.views.active.viewpoint;
        if(this.views.active.type === '3d'){
          this.views.active = this.views.map;
          this.views.active.viewpoint = extent;
          // this.views.active.viewpoint.camera.tilt = this.config.view.view.aspect.tilt;
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
    created(){

    },
    mounted(){
      loadModules(['esri/Map', 'esri/views/MapView', 'esri/views/SceneView', 'esri/Graphic', 'esri/widgets/Sketch/SketchViewModel', 'esri/layers/GraphicsLayer', 'esri/layers/MapImageLayer', 'esri/layers/FeatureLayer', 'esri/widgets/Legend']).then(([Map, MapView, Scene, Graphic, GraphicsLayer, SketchViewModel, MapImageLayer, FeatureLayer, Legend])=> {
        // :: INSTANTIATE FEATURE LAYER :: \\
        // const buildingsLyr = new FeatureLayer({
        //   url: "https://services1.arcgis.com/jjVcwHv9AQEq3DH3/ArcGIS/rest/services/Buildings/FeatureServer/0",
        //   renderer: renderers._3d,
        //   popupTemplate: popupTemplate, // autocasts as new PopupTemplate()
        //   outFields: ["ADDRESS", "DESCLU", "ELEVATION"],
        //   definitionExpression: "ELEVATION > 0", // show only buildings with height
        //   minScale: 2500
        // });



        const parcelLyrF = new FeatureLayer({
          url: `${this.config.layers.parcels}/1`,
          renderer: renderers.parc,
          definitionExpression: "PRCL_NBR <> 'Dedicated ROW'",
          popupTemplate:{
            title: "Parcels",
            content: [{
              type: "fields",
              fieldInfos: [{
                fieldName: "PRCL_NBR",
                label: "Parcel"
              }, {
                fieldName: "ACREAGE",
                label: "ACREAGE"
              }, {
                fieldName: "TXNAME",
                label: "TXNAME"
              }]
            }]
          },
          outFields: ['*'],
          minScale: 9050
        });


        const parcelLyr = new MapImageLayer({
          url: this.config.layers.parcels,
          sublayers:[
            {
              id:7,
              definitionExpression: "PRCL_NBR <> 'Dedicated ROW'",
              renderer: renderers.parc,
              popupTemplate:{
                title: "Parcels",
                content: [{
                  type: "fields",
                  fieldInfos: [{
                    fieldName: "PRCL_NBR",
                    label: "Parcel"
                  }, {
                    fieldName: "ACREAGE",
                    label: "ACREAGE"
                  }, {
                    fieldName: "TXNAME",
                    label: "TXNAME"
                  }]
                }]
              }
            }
          ]
        });

        // https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-GraphicsLayer.html#elevationInfo
        // const buildingsLyr = new GraphicsLayer();
        // buildingsLyr.elevationInfo = {
        //   mode:'on-the-ground'
        // };

          // :: INSTANTIATE MAP :: \\
          const map = new Map({
          basemap: this.basemap || "satellite",
          // ground: "world-elevation",
          //   layers: [parcelLyrF]
          layers: [parcelLyr]
          // layers: [buildingsLyr]
        });

        // :: INSTANTIATE MAPVIEW :: \\
          this.views.map = new MapView({
          container: "viewDiv",
          map: map,
          zoom: 16,
          center: this.config.view.initExtent,
          popup:{
            dockOptions:{
              position: 'bottom-right'
            }
          }
        });

        // :: INSTANTIATE SCENEVIEW :: \\
          this.views.scene = new Scene({
          // container: "viewDiv",
          map: map,
          camera: {
            position: this.config.view.initExtent,
            heading: this.config.view.aspect.heading,
            tilt: this.config.view.aspect.tilt
          },
            popup:{
              highlightEnabled: false,
              dockOptions:{
                position: 'bottom-right'
              }
            }
        });

        // this.layers.feature = buildingsLyr;
        this.views.active = this.views.map;
        // this.views.active = this.views.scene;

        // ::::: ADD LIDAR GRAPHICS :::::: \\
        this.views.active.when(()=>{
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

          var polygonSymbol = { // symbol used for polygons
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: "rgba(138,43,226, 0.8)",
            style: "solid",
            outline: {
              color: "white",
              width: 1
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

          console.log("DATA SPATIAL REFERENCE ", data.spatialReference)

          // data.features.map((v)=>{
          //   let lidar_graphic = new Graphic();
          //   let geom = {type: 'polygon', rings: v.geometry.rings, spatialReference: data.spatialReference};
          //   console.log("GEOM ? ", geom)
          //   symbols['3d'].symbolLayers[0].size = v.attributes.Height - 252;
          //   lidar_graphic.attributes = v.attributes;
          //   lidar_graphic.symbol = symbols['3d'];
          //   lidar_graphic.geometry = geom;
          //   console.log("V ", v);
          //   // buildingsLyr.graphics.add(lidar_graphic);
          //   this.views.active.graphics.add(lidar_graphic);
          // });

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