import { loadModules } from 'esri-loader';
import featurelayer_configs from "./presentation_config.js";
const { symbols } = featurelayer_configs;
const { getColorForPercentage } = symbols;

const ArcGISModules = {};

const init = new Promise((resolve, reject) => {
  loadModules(['esri/widgets/Sketch/SketchViewModel', 'esri/Graphic', 'esri/tasks/support/Query', 'esri/tasks/QueryTask', 'esri/geometry/geometryEngine']).then(([SketchViewModel, Graphic, Query, QueryTask, geometryEngine]) => {
    ArcGISModules.Graphic = Graphic;
    ArcGISModules.SketchViewModel = SketchViewModel;
    ArcGISModules.geometryEngine = geometryEngine;
    ArcGISModules.Query = Query;
    ArcGISModules.QueryTask = QueryTask;
    resolve('Ready');
  })
});

const Select = {
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
    // normalize ArcGIS Module variable names
    const {QueryTask, Query, geometryEngine } = ArcGISModules;
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
      const queryTask = new QueryTask({
        url: url
      });
      // initialize query \\
      const query = new Query();
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
        const bufferGeometry = geometryEngine.geodesicBuffer(ftr.geometry, buffer_distance, 'feet');
        // get full buffer geometry push into buffer array

        // push feature attributes and buffered geometries into new features array \\
        acc.new_features.push({attributes: ftr.attributes, geometry: bufferGeometry});

        // push makegraphics for individual point buffers and push into buffered points array
        acc.buffered_point_graphics.push(makeGraphic(bufferGeometry,null, symbols.bufferSelection));
      return acc;
    },{new_features: [], feature_geometries: [], selected_points: [], buffered_point_graphics: []});

    const dissolve = geometryEngine.geodesicBuffer(graphics.feature_geometries, buffer_distance, 'feet', true);
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

const extrude_data = (points, field, view) => {
  view.graphics.removeAll();

  // get filtered list of values
  let values = points.features.map(ft => {
    return ft.attributes[field] || 0
  });

  // find min and max of values
  let max = Math.max(...values);
  let min = Math.min(...values);

  // function to normalize
  const normalize = (v) => {
    return v ? (v - min) / (max - min) : 0
  };

  // iterate through points and set graphics
  points.features.map(ft => {
    ft.geometry.type = 'point';
    ft.geometry.spatialReference = points.spatialReference;

    // normalize value between 0-1
    let value = normalize(ft.attributes[field]);

    // add graphic with symbol autocasting as ObjectSymbol3DLayer with cylinder type
    view.graphics.add(new ArcGISModules.Graphic({
      geometry: ft.geometry,
      attributes: ft.attributes,
      symbol: {
        type: 'point-3d',
        symbolLayers: [{
          type: 'object',
          width: 25,
          depth: 25,
          height: value * 200, // apply an exaggeration to height (max will be 200)
          resource: {
            primitive: 'cylinder'
          },
          material: {
            color: getColorForPercentage(1 - value)
          } //subtract 1 value from one to reverse the color ramp (red is bad!)
        }]
      }
    }));
  })
};

export default {init, Select, extrude_data}