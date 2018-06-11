<template>
  <div id="mapwrapper">
    <div id="viewDiv"></div>
    <Panel :direction="'Right'"
           :label="'Export'"
           :trigger="tasks.property_export.trigger"
           :style="{'z-index':tasks.crash.visible?'0':'1'}"
           @evt_isOpen="isOpen('property_export')">
      <div slot="content" style="width: 100%; height: 100%; padding: 0 0 10px 0;">
        <PropertyExport :disabled="tasks.property_export.state.disabled" :feature="tasks.property_export.feature"
                        :configs="tasks.property_export.configs"></PropertyExport>
      </div>
    </Panel>
    <Panel
            :direction="'Right'"
            :label="'Crash'"
            :class_override="{panel: 'panel', tab: 'tab'}"
            :style="{'z-index':tasks.crash.visible?'1':'0'}"
            @evt_isOpen="isOpen()">
      <div slot="content" style="width: 100%; height: 100%; padding: 0 0 10px 0;">
        <CrashTool :state="{active: tasks.crash.state.active, disabled: tasks.crash.state.disabled}"
                   :selected="tasks.crash.selected_field"
                   :buffer_distance.sync="tasks.crash.buffer_distance"
                   :crash_fields="tasks.crash.display_fields"
                   :buffers="tasks.crash.buffers"
                   @evt_draw-start="draw_start"
                   @evt_dropdown-field-changed="crash_task_update"
                   @evt_crash-gp-complete="crash_task_complete">

        </CrashTool>
      </div>
    </Panel>
  </div>
</template>

<script>
  // mapping configuration
  import Config from "../config.json";
  // components
  import Panel from "./UI/Panel.vue";
  import PropertyExport from "./GP/Export_PropertyCard.vue";
  import CrashTool from "./GP/Crash_Analysis.vue";

  // modules
  import Analysis from '../modules/analysis.js';
  import presentation_config from "../modules/presentation_config.js";

  // esri loader
  import { loadModules } from 'esri-loader';

  // destructure presentation config create corresponding variables
  const {popupTemplate, renderers, WebMap_Json} = presentation_config;

  export default {
    name: "map-component",
    props: ['basemap'],
    components: {
      Panel,
      PropertyExport,
      CrashTool
    },
    data() {
      return {
        // vue scene object structure - all of these objects and properties the vue instance needs access to
        view: {
          scene: null,
          is2D: true
        },
        // configs pulled from config.json for initializing objects
        config: {
          // used when initializing sceneview
          view: {
            initExtent: Config.Map.initExtent,
          },
          // used when intializing parcel and intersection mapImageLayers()
          urls: {
            parcels: Config.Layers.parcels,
            intersections: Config.Layers.intersections
          }
        },
        // setting the parcel & intersection layers once intialized
        layers: {
          parcels: null,
          intersections: null
        },
        // set task configurations
        tasks: {
          property_export: {
            // UI - setting and changing UI state
            isOpen: false,
            trigger: false,
            state:{
              disabled: true
            },
            feature: null,
            // GP props to pass into @PropertyExport component
            configs: {
              url: Config.Tasks.property_export.gp_url,
              element_map: Config.Tasks.property_export.element_map,
              webmap_json: null
            }
          },
          crash: {
            // UI - setting and changing UI state
            isOpen: false,
            visible: true,
            state:{
              active: false,
              disabled: true
            },
            // draw object once initialized
            draw: null,
            // intersection feature selection
            current_selection: null,
            // intersection buffers featureSet to pass into @CrashTool component
            buffers: null,
            // reference to extrude_data method when available
            extrude_data: null,
            // GP props to pass into @CrashTool component
            buffer_distance: Config.Tasks.crash.buffer_distance,
            selected_field: Config.Tasks.crash.default_field,
            display_fields: Config.Tasks.crash.display_fields,
          }
        }
      }
    },
    // vue methods
    methods: {
      isOpen(property_export, trigger) {
        // :: GP Tab Expand vue event handler (@evt_isOpen) from @Panel component ::
        // if propertycard is opened
        if(property_export){
          // if export map is open panel programatically else set trigger back to false \\
          if (trigger) {
            this.tasks.property_export.trigger = true;
          } else {
            this.tasks.property_export.trigger = false;
          }
          // toggle property_export.isOpen property
          this.tasks.property_export.isOpen = !this.tasks.property_export.isOpen;
          // set crash.visible property based on if property export panel is open set false otherwise true
          this.tasks.crash.visible = this.tasks.property_export.isOpen ? false : true;
        }else{
          this.tasks.crash.isOpen =! this.tasks.crash.isOpen;
          this.layers.parcels.visible = !this.layers.parcels.visible;
          this.view.scene.graphics.removeAll();
          this.switchView();
        }
      },
      switchView(is3D) {
        // :: switch MapView (2D) to SceneView (3D) :: \\

        // everytime view is switched clear rendered graphics
        this.view.scene.graphics.removeAll();
        if(is3D){
          // if 3d mode enable tilt
          this.view.scene.constraints.tilt.max = 180;
          // set is 2d property to false
          this.view.is2D = false;
          // turn off parcels & intersection layers
          this.layers.parcels.visible = false;
          this.layers.intersections.visible = false;
        }else{
          // if 2d mode disable tilt
          this.view.scene.constraints.tilt.max = 0;
          // set is 3d property to true on the is2d property on the vue data object
          this.view.is2D = true;
          // turn on parcels & intersections
          this.layers.parcels.visible = this.tasks.crash.isOpen?false:true;
          this.layers.intersections.visible = true;
        }
      },
      draw_start() { // :: draw init vue event handler (@evt_draw-start) :: \\
        // remove existing graphics from map
        this.view.scene.graphics.removeAll();

        // clear buffers
        this.tasks.crash.buffers = null;

        // run tool disabled until selection is made
        this.tasks.crash.state.disabled = true;

        // UI state
        this.tasks.crash.state.active = this.view.is2D?true:false;

        // if 3d view active switch back to 2d
        this.view.is2D?false:this.switchView();

        // activate draw
        this.tasks.crash.draw.create('polygon');
      },
      crash_task_update(field) { // :: crash task dropdown update vue event handler (@evt_dropdown-field-changed) :: \\
        // update 3d symbols from dropdown value
        // update crash.selected_field in vue data object
        this.tasks.crash.selected_field = field;

        // check if crash buffers is populated if so show crash 3d symbols
        this.tasks.crash.buffers?this.tasks.crash.extrude_data(this.tasks.crash.current_selection, field, this.view.scene):false;
      },
      crash_task_complete(evt) { // :: crash task complete vue event handler (@evt_crash-gp-complete) :: \\
        this.switchView('3d');
        this.tasks.crash.state.disabled = true;
        this.layers.intersections.visible = false;
        this.tasks.crash.current_selection = evt.results[0].value;
        this.tasks.crash.extrude_data(evt.results[0].value, this.tasks.crash.selected_field, this.view.scene);
      }
    },
    mounted() {
      loadModules(['esri/Map', 'esri/views/MapView', 'esri/views/SceneView', 'esri/Graphic', 'esri/widgets/Sketch/SketchViewModel', 'esri/layers/GraphicsLayer', 'esri/layers/MapImageLayer']).then(([Map, MapView, SceneView, Graphic, SketchViewModel, GraphicsLayer, MapImageLayer]) => {

        // instantiate MapImageLayers - using mapImageLayer instead of featureLayer more performant
        // parcels for map export
        const parcels = new MapImageLayer({
          url: this.config.urls.parcels,
          sublayers: [{
            id: 0,
            renderer: renderers.parcels,
            popupTemplate: popupTemplate.parcels
          }]
        });

        // intersections for crash task
        const intersections = new MapImageLayer({
          url: this.config.urls.intersections,
          minScale: 50000,
          maxScale: null,
          sublayers: [{
            id: 0,
            popupTemplate: popupTemplate.intersections
          }]
        });

        // set initialized parcel layer to the vue.layers.parcels property
        this.layers.parcels = parcels;
        // set initialized parcel layer to the vue.layers intersections property
        this.layers.intersections = intersections;

        // instantiating map
        const map = new Map({
          basemap: this.basemap || "satellite",
          layers: [parcels, intersections]
        });

        // instantiate scene
        this.view.scene =  new SceneView({
          map: map,
          zoom: 16,
          container: 'viewDiv',
          center: this.config.view.initExtent,
          popup: {
            highlightEnabled: false,
            dockOptions: {
              position: 'bottom-left'
            }
          }
        });

        // initially disabling tilt on the scene to force "2d mode" 
        this.view.scene.constraints.tilt.max = 0;

        // ::::::::::::::::::::::::::::::::::::::: \\
        // ::::::: ---- Popup Events ---- :::::::: \\
        // ::::::::::::::::::::::::::::::::::::::: \\
          const {init: initAnalysis, Select, extrude_data} = Analysis;
          this.view.scene.popup.watch('visible', (evt) => {
            if (evt) {
              // set currently selected feature to property_export.params.feature property on vue data object \\
              this.tasks.property_export.feature = this.view.scene.popup.viewModel.selectedFeature;

              const oid = this.view.scene.popup.viewModel.selectedFeature.attributes.OBJECTID;
              // set webmap_json to property_export.params.webmap_json property on vue data object \\
              this.tasks.property_export.configs.webmap_json = WebMap_Json(this.view.scene, parcels, oid);

              this.tasks.property_export.state.disabled = false;
            }else{
              this.tasks.property_export.state.disabled = true;
            }
          });

          this.view.scene.popup.on('trigger-action', (evt) => {
            // listen for trigger action (exportAction)
            if (evt.action.id === 'export-property-report') {
              let popup = this.view.scene.popup;
              this.tasks.property_export.trigger = true;
              // assign selectedFeature attributes to property_export.params property on vue data object
              this.tasks.property_export.feature = popup.viewModel.selectedFeature;
            }
          });


          // :::::::::::::::::::::::::::::::::::::: \\
          // :::: ---- Scene Loaded Event ---- :::: \\
          // :::::::::::::::::::::::::::::::::::::: \\
          this.view.scene.when(async (view) => {
            // once scene is loaded - using async here so we can handle deferred methods with await
            // set intersection variable to the intersection url from the config
            let intersection = `${this.config.urls.intersections}/0`;

            // :::: -- DRAW -- :::: \\
            // @_Analysis Module initialize ArcGIS Modules
            await initAnalysis;

            // instantiate sketchViewModel
            // #SketchViewModel -- simplifies the process of adding temporary geometries to the MapView abstracts the work of sketching geometry types
            let sketchViewModel = Select.init(view);

            // assign sketchViewModel instance to crash.draw property on vue instance - hoist access to draw_start event
            this.tasks.crash.draw = sketchViewModel;

            // :: define add method to execute on 'draw-complete' :: \\
            const add = async (evt) => {

              // @_Analysis Module call Select.makeSelection returns graphics object/featureset and assigns it to selection
              const selection = await Select.makeSelection(evt.geometry, intersection, this.tasks.crash.buffer_distance);

              // destructure selection to assign graphics & featureset variables
              const {graphics, featureset} = selection;

              hook.graphics = graphics;

              // add point buffers/overall buffer/point graphics graphics retrieved from makeSelection to map
              view.graphics.addMany(graphics.selected_points);
              view.graphics.addMany(graphics.buffers);
              view.graphics.add(graphics.buffer);

              // assign featureset to gp_params.buffers on vue instance to pass into crashtool
              this.tasks.crash.buffers = featureset;

              // deactivate draw icon on selection
              this.tasks.crash.state.active = false;
              // enable run analysis check button
              this.tasks.crash.state.disabled = false;
            };

            // on selection execute add callback function
            sketchViewModel.on('draw-complete', add);

            // :::::: -- DRAW -- :::::: \\

            // dock popup when view is loaded
            this.view.scene.popup.dockEnabled = true;
          });
        // ::::::: Map/Scene View Events Closure :::::::: \\


        // these internal functions need to be available to call from vue instance > attach to vue methods object
        this.tasks.crash.extrude_data = extrude_data;
        hook.sceneC = this;

      }) // ESRI LOAD MODULE CLOSURE
    }
  }
</script>

<style lang="scss">
  html,
  body,
  #viewDiv {
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
  }

  #mapwrapper {
    display: flex;
    position: relative;
    width: 100%;
    height: inherit;
    border-radius: 2px;
  }

  .panel {
    width: 350px;
    top: 30px;
    padding: 0px;
    background-color: #2c3e50;
  }


  .tab {
    top: 55px;
    background-color: #e3e3e3;
    padding: 8px;
    border-radius: 0 4px 4px 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: black;
    &:hover {
      background-color: #2c3e50;
      color: white;
      opacity: 0.75;
    }
  }

  $content-blue: rgba(44, 62, 80, 1);
  $content-blueOp: rgba(178, 233, 248, 0.5);

  .esri-popup__main-container {
    color: #e5e5e5;
    background: $content-blue;
  }

  .esri-table {
    color: #e5e5e5;
    background: $content-blue
  }

  .esri-popup__button {
    &.esri-popup__button--dock {
      color: white;
    }
  }

  .esri-popup__action-text {
    color: white;
  }

  .esri-table tr:nth-child(odd) {
    background-color: $content-blueOp;
  }

  .esri-popup__icon {
    &.esri-icon-zoom-in-magnifying-glass:before {
      color: white;
    }
    &.esri-icon-close:before {
      color: white;
    }
  }

  .esri-icon-documentation:before {
    color: white;
  }

  .esri-popup__pointer-direction {
    background-color: $content-blue;
  }
</style>