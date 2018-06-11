<template>
  <div id="viewDiv"></div>
</template>

<script>
  // this is probably the real map component we will want to use, this assumes we are using 4.x
  import { loadModules } from 'esri-loader';

  export default {
    name: 'map-component',
    props: ['basemap'],
    data(){
      return {
        map: null,
        view: null
      }
    },
    mounted: function () {
	    var dojoConfig = {
	      has: {
	        "esri-featurelayer-webgl": 1
	      }
	    };

      loadModules(["esri/WebMap",
      "esri/views/MapView",
      "esri/widgets/Legend",
      "esri/widgets/LayerList",
      "dojo/domReady!"],{dojoConfig})
        .then(([WebMap, MapView, Legend, LayerList]) => {
   // This web map contains a feature layer. The Dojo has flag
      // set in the preceding script allows this layer to be
      // rendered in WebGL, thus enabling improved performance
      // for layers with a lot of data. This layer contains
      // 180,000 polygons.

      var map = new WebMap({
        portalItem: {
          id: "294d8df2be3d40149874c6f5542da8e6"
        }
      });

      var view = new MapView({
        container: "viewDiv"
      });

      var rendererInfos;
      var currentInfo;
      map.load()
        .then(function() {

          // After the map loads, save each layer's renderer
          // to the rendererInfos object. These renderers will
          // be applied to the layer when the action with the
          // given title is clicked.

          rendererInfos = map.layers.map(function(layer) {
            return {
              renderer: layer.renderer.clone(),
              title: layer.title
            };
          });
          currentInfo = rendererInfos.getItemAt(0);

          var visibleLayer = map.layers.find(function(layer) {
            layer.title = map.portalItem.title;
            return layer.visible;
          });
          // Only keep one layer (the visible one) in the map before
          // adding the map to the view
          map.layers.removeAll();
          map.layers.add(visibleLayer);
          view.map = map;
          return view;
        }).then(addWidgets);

      // Add LayerList and Legend widgets to the view.
      function addWidgets(view) {
        view.ui.add(new Legend({
          view: view
        }), "bottom-left");
        var layerList = new LayerList({
          view: view,
          // Assign a function to the LayerList widget
          // that fires each time the relevant layer views are
          // updated. This function must return a two-dimensional
          // collection of action objects
          listItemCreatedFunction: createLayerListActions
        });
        view.ui.add(layerList, "top-right");

        // When any action in the LayerList is clicked,
        // the trigger-action event fires and the toggleRenderer()
        // callback executes
        layerList.on("trigger-action", toggleRenderer);
      }

      // This function must return a two-dimensional array of
      // action objects. This is done for the layer kept when the app
      // originally loaded.
      // One action is created for each rendererInfo object. The action title
      // will match the title of the rendererInfo object (and the associated
      // layer in the web map). The ID identifies the type of action executed
      // and the className points to an icon font included in the API. This icon
      // font is used to visually identify the action in the UI.

      function createLayerListActions(event) {
        var listItem = event.item;
        if (listItem.title === map.portalItem.title) {
          listItem.actionsOpen = true;
          listItem.actionsSections = [rendererInfos.map(function(
            rendererInfo) {
            return {
              title: rendererInfo.title,
              className: "esri-icon-maps",
              id: "change-renderer"
            };
          }).toArray()];
        }
      }

      // Each time an action is clicked, this function executes.
      // It finds the relevant rendererInfo object associated
      // with the given action title. Once a match is found, the renderer
      // is applied to the layer.

      function toggleRenderer(event) {
        if (event.action.id === "change-renderer") {
          var matchingInfo = rendererInfos.find(function(info) {
            return info.title === event.action.title;
          });
          // don't attempt to change the renderer if
          // the selection is the same as the current renderer
          if (matchingInfo.title === currentInfo.title) {
            return;
          } else {
            currentInfo = matchingInfo;
          }
          // set the new renderer on the layer
          var renderer = matchingInfo.renderer;
          var layer = view.map.layers.getItemAt(0);
          layer.renderer = renderer;
        }
      }
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
</style>
