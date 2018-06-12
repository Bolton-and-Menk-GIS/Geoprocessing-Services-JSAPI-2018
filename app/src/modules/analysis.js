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
    const sketchViewModel = new ArcGISModules.SketchViewModel({
      view: view,
      symbol: symbols.draw
    });
    return sketchViewModel;
  },

  // getselection call from add() function in @Scene
  async makeSelection(geometry, url, buffer_distance){
    // normalize ArcGIS Module variable names
    const {QueryTask, Query, geometryEngine } = ArcGISModules;

      // makeGraphic() helper function
      function makeGraphic(geometry, attributes, symbol){
        const graphic = new ArcGISModules.Graphic({
          attributes: attributes,
          geometry: geometry,
          symbol: symbol
        });
        return graphic;
      };

    // set up query operation
    async function query(url){
      // initialize queryTask
      const queryTask = new QueryTask({
        // intersection url passed into makeSelection()
        url: url
      });
      // initialize query
      const query = new Query();
      query.returnGeometry = true;
      query.outFields = ["*"];
      // set geometry being passed in from draw graphic
      query.geometry = geometry;
      return await queryTask.execute(query);
    }

    // run query
    let results = await query(url);

    // create graphics object which is ultimately returned in makeSelection() call
    const graphics = results.features.reduce((acc, ftr)=>{

        // push raw feature geometry into feature_geometries array to be used to generate the overall buffer area graphic \\
        acc.feature_geometries.push(ftr.geometry);

        // created the individual intersection point selection graphics and pusth into selected_points \\
        acc.selected_points.push((makeGraphic(ftr.geometry, ftr.attributes, symbols.pointSelection)));

        // create buffer geometries - used as input for buffered_point_graphics \\
        const bufferGeometry = geometryEngine.geodesicBuffer(ftr.geometry, buffer_distance, 'feet');

        // push feature attributes and buffered geometries into the new_features array to add to our featureSet we will create \\
        acc.new_features.push({attributes: ftr.attributes, geometry: bufferGeometry});

        // push graphics for individual intersection buffers - push into buffered_point_graphics array
        acc.buffered_point_graphics.push(makeGraphic(bufferGeometry,null, symbols.bufferSelection));

      return acc;
    },{feature_geometries: [], selected_points: [], new_features: [], buffered_point_graphics: []});

    // create full buffer area geometry by creating a new buffer using graphic.feature_geometries and dissolving it
    const dissolve = geometryEngine.geodesicBuffer(graphics.feature_geometries, buffer_distance, 'feet', true);

    // create full buffer graphic pass in dissolve geometry
    let full_buffer = makeGraphic(dissolve[0],null, symbols.bufferArea);

    // build featureSet for Crash Tool input  \\
    const featureSet = {
      displayFieldName: results.displayFieldName,
      features: graphics.new_features,
      fields: results.fields,
      geometryType: 'esriGeometryPolygon',
      spatialReference: results.spatialReference
    };

    return {
      // return created data structure object back to selection in Scene component - selected intersection points, intersection buffers, full buffer
      graphics: {
          // selected points
          selected_points: graphics.selected_points,
          // individual buffers
          buffers: graphics.buffered_point_graphics,
          // full buffer
          buffer: full_buffer
      },
      featureset: featureSet
    };
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