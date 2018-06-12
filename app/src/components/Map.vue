<template>
  <div id="mapwrapper">
    <div id="viewDiv"></div>
    <Panel :direction="'Right'" @evt_isOpen="isOpen('property_export')" :trigger="tasks.property_export.trigger" :label="'Export'" :style="{'z-index':tasks.crash.visible?'0':'1'}">
      <div slot="content" style="width: 100%; height: 100%; padding: 0 0 10px 0;">
        <PropertyExport
                :disabled="tasks.property_export.state.disabled"
                :feature="tasks.property_export.feature"
                :configs="tasks.property_export.configs">

        </PropertyExport>
      </div>
    </Panel>
    <Panel :direction="'Right'"
           @evt_isOpen="isOpen()"
           :class_override="{panel: 'panel', tab: 'tab'}"
           :style="{'z-index':tasks.crash.visible?'1':'0'}"
           :label="'Crash'">
      <div slot="content" style="width: 100%; height: 100%; padding: 0 0 10px 0;">
        <CrashTool :state="{active: tasks.crash.state.active, disabled: tasks.crash.state.disabled}"
                   :selected="tasks.crash.selected_field"
                   :buffer_distance.sync="tasks.crash.buffer_distance" :
                   crash_fields="tasks.crash.display_fields"
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
        // scaffold data() object
        views: {
          // view placeholders
          map: null,
          scene: null,
          active: null,
          createView: null,
          registerEvents: null
        },
        config: {
          view: {
            initExtent: Config.Map.initExtent, // DES MOINES
            container: "viewDiv"
          },
          urls: {
            parcels: Config.Layers.parcels,
            intersections: Config.Layers.intersections
          }
        },
        layers: {
          parcels: null,
          intersections: null
        },
        tasks: {
          property_export: {
            // UI
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
            isOpen: false,
            visible: true,
            state:{
              active: false,
              disabled: true
            },
            draw: null,
            current_selection: null,
            // GP props to pass into @CrashTool component
            buffer_distance: Config.Tasks.crash.buffer_distance,
            selected_field: Config.Tasks.crash.default_field,
            display_fields: Config.Tasks.crash.display_fields,
            buffers: null
          }
        }
      }
    },
    methods: {
      isOpen(property_export, trigger) {
        // :: GP Tab Expand vue event handler (@evt_isOpen) ::
        // if propertycard is opened
        if(property_export){
          // if export map is open panel programatically else set trigger back to false \\
          if (trigger) {
            this.tasks.property_export.trigger = true;
          } else {
            this.tasks.property_export.trigger = false;
          }

          this.tasks.property_export.isOpen = !this.tasks.property_export.isOpen;
          this.tasks.crash.visible = this.tasks.property_export.isOpen ? false : true;
        }else{
          this.tasks.crash.isOpen =! this.tasks.crash.isOpen;
          this.layers.parcels.visible = this.tasks.crash.isOpen?false:true;
          this.views.active.graphics.removeAll();
          this.views.active.type === '3d' ? this.switchView() : false;
        }
      },

      switchView() {
        // :: switch MapView (2D) to SceneView (3D) :: \\
        this.views.active.graphics.removeAll();

        // unhook container for current view
        this.views.active.container = null;

        // store extent for active view
        let extent = this.views.active.viewpoint;

        if (this.views.active.type === '3d') {
          // if 3d set view to MapView (2d)
          this.views.active = this.views.createView('MapView');

          // set extent
          this.views.active.viewpoint = extent;

          // turn on parcels & intersections
          this.layers.parcels.visible = true;
          this.layers.intersections.visible = true;
        } else {
          // is 2d so set view to SceneView (3d)
          this.views.active = this.views.createView();
          this.views.active.viewpoint = extent;

          // turn off parcels & intersections
          this.layers.parcels.visible = this.tasks.crash.isOpen?false:true; // if crash tool is not active
          this.layers.intersections.visible = false;
        }

        // SceneView to MapView point rendering hack
        setTimeout(()=>{
          this.views.active.container = "viewDiv";
        },500)

        // hook up events each time view is switched
        this.views.registerEvents();
      },
      draw_start() { // :: draw init vue event handler (@evt_draw-start) :: \\
        // remove existing graphics from map
        this.views.active.graphics.removeAll();
        this.layers.parcels.visible = false;

        this.tasks.crash.buffers = null;
        this.tasks.crash.state.disabled = true;

        // activate draw
        this.tasks.crash.state.active = this.views.active.type === '3d'?false:true;

        // if 3d view active switch back to 2d
        this.views.active.type === '3d' ? this.switchView() : false;
        this.tasks.crash.draw.create('polygon');
      },
      crash_task_update(field) { // :: crash task dropdown update vue event handler (@evt_dropdown-field-changed) :: \\
        // update 3d symbols from dropdown value
        // update crash.selected_field in vue data object
        this.tasks.crash.selected_field = field;
        // check if crash buffers is populated if so show crash 3d symbols
        if (this.views.active.type === '3d') {
          this.tasks.crash.buffers?this.extrude_data(this.tasks.crash.current_selection, field, this.views.active):false;
        }
      },
      crash_task_complete(evt) { // :: crash task complete vue event handler (@evt_crash-gp-complete) :: \\
        this.views.active.type === '2d' ? this.switchView() : false;
        this.layers.intersections.visible = false;
        this.tasks.crash.state.disabled = true;
        this.tasks.crash.current_selection = evt.results[0].value;
        this.extrude_data(evt.results[0].value, this.tasks.crash.selected_field, this.views.active);
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

        this.layers.parcels = parcels;
        this.layers.intersections = intersections;

        // :: INSTANTIATE MAP :: \\
        const map = new Map({
          basemap: this.basemap || "satellite",
          // ground: "world-elevation",
          layers: [parcels, intersections]
        });

        const createView = (map_view) => {
          // upon switchView need to call this to return a newly instantiated mapview or sceneview based on type
          let view;
          // instantiate MapView \\
          if (map_view) {
            view = new MapView({
              map: map,
              zoom: 16,
              center: this.config.view.initExtent,
              popup: {
                dockOptions: {
                  position: 'bottom-left'
                }
              }
            });
            return view
          } else {
            // :: instantiate SceneView :: \\
            view = new SceneView({
              map: map,
              popup: {
                highlightEnabled: false,
                dockOptions: {
                  position: 'bottom-left'
                }
              }
            });
            return view;
          }
        };

        const {init: initAnalysis, Select, extrude_data} = Analysis;

        // ::::::: Map/Scene View Events :::::::: \\
        let registerEvents = () => {
          this.views.active.popup.watch('visible', (evt) => {
            if (evt) {

              // set currently selected feature to property_export property on vue data object \\
              this.tasks.property_export.feature = this.views.active.popup.viewModel.selectedFeature;

              const oid = this.views.active.popup.viewModel.selectedFeature.attributes.OBJECTID;

                // set webmap_json to property_export.params.webmap_json property on vue data object \\
              this.tasks.property_export.configs.webmap_json = WebMap_Json(this.views.active, parcels, oid);

              this.tasks.property_export.state.disabled = false;
            }else{
              this.tasks.property_export.state.disabled = true;
            }
          });

          this.views.active.popup.on('trigger-action', (evt) => {
            // listen for trigger action (exportAction)
            if (evt.action.id === 'export-property-report') {
              let popup = this.views.active.popup;
              this.tasks.property_export.trigger = true;
              // assign selectedFeature attributes to property_export.configs property on vue data object
              this.tasks.property_export.configs.feature = popup.viewModel.selectedFeature;
            }
          });

          // :::: ---- Active View Loaded Event ---- :::: \\
          this.views.active.when(async (view) => {
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

              // assign featureset to buffers on vue instance to pass into crashtool
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
            this.views.active.popup.dockEnabled = true;
          });
        };
        // ::::::: Map/Scene View Events Closure :::::::: \\


        // these internal functions need to be available to call from vue instance > attach to vue methods object
        this.views.createView = createView;
        this.views.registerEvents = registerEvents;


        this.views.active = createView('MapView');
        this.views.active.container = 'viewDiv';
        registerEvents();
        this.extrude_data = extrude_data;
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