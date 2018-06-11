import { loadModules } from 'esri-loader';
import featurelayer_configs from "./presentation_config.js";
const {symbols, popupTemplate} = featurelayer_configs;
// https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=draw-line
const ArcGISModules = {};

const select = {
  ready: new Promise((resolve, reject) => {
    loadModules(['esri/widgets/Sketch/SketchViewModel', 'esri/Graphic', 'esri/tasks/support/Query', 'esri/tasks/QueryTask', 'esri/geometry/geometryEngine']).then(([SketchViewModel, Graphic, Query, QueryTask, geometryEngine]) => {
      ArcGISModules.Graphic = Graphic;
      ArcGISModules.SketchViewModel = SketchViewModel;
      ArcGISModules.geometryEngine = geometryEngine;
      ArcGISModules.Query = Query;
      ArcGISModules.QueryTask = QueryTask;
      resolve('Ready');
    })
  }),
  init: function(view) {
    this.view = view;
    const sketchViewModel = new ArcGISModules.SketchViewModel({
      view: this.view,
      symbol: symbols.draw
    });
    return sketchViewModel;
  },

  // getselection call from Scene \\
  async makeSelection(geometry, url, buffer_distance){
      function makeGraphic(geometry, attributes, symbol){
        const graphic = new ArcGISModules.Graphic({
          attributes: attributes,
          geometry: geometry,
          symbol: symbol
        });
        return graphic;
      };

    // set query operation \\
    async function query(url){
      // initialize queryTask \\
      const queryTask = new ArcGISModules.QueryTask({
        url: url
      });
      // initialize query \\
      const query = new ArcGISModules.Query();
      query.returnGeometry = true;
      query.outFields = ["*"];
      query.geometry = geometry;
      return await queryTask.execute(query);
    }

    // run query \\
    let results = await query(url);

    // create graphics object which is ultimately returned in makeSelection() call \\
    const graphics = results.features.reduce((acc, ftr)=>{
        // push raw feature geometry into feature_geometries array for overall buffer area \\
        acc.feature_geometries.push(ftr.geometry);
        // push raw graphics \\
        acc.selected_points.push((makeGraphic(ftr.geometry, ftr.attributes, symbols.pointSelection)));
        // create buffer geometries - used as input for buffer graphics \\
        const bufferGeometry = ArcGISModules.geometryEngine.geodesicBuffer(ftr.geometry, buffer_distance, 'feet');
        // get full buffer geometry push into buffer array
        // acc.buffered_geometries.push(bufferedGeometries);
        // push feature attributes and buffered geometries into new features array \\
        acc.new_features.push({attributes: ftr.attributes, geometry: bufferGeometry});
        // push makegraphics for individual point buffers and push into buffered points array
        acc.buffered_point_graphics.push(makeGraphic(bufferGeometry,null, symbols.bufferSelection));
      return acc;
    },{new_features: [], feature_geometries: [], selected_points: [], buffered_point_graphics: [], buffered_geometries: []});

    const dissolve = ArcGISModules.geometryEngine.geodesicBuffer(graphics.feature_geometries, buffer_distance, 'feet', true);
    let full_buffer = makeGraphic(dissolve[0],null, symbols.bufferArea);

    // build featureSet for Crash Tool input \\
    const featureSet = {
      displayFieldName: results.displayFieldName,
      features: graphics.new_features,
      fields: results.fields,
      geometryType: 'esriGeometryPolygon',
      spatialReference: results.spatialReference
  };

    // return created object back to Scene \\
    return {graphics: {draw: makeGraphic(geometry), selected_points: graphics.selected_points, buffers: graphics.buffered_point_graphics, buffer: full_buffer}, featureset: featureSet};
  }
};
export default select