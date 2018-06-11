export default {
  symbols:{
  "2d": {
      type: "simple-fill",
      color: [115, 205, 241, 0.75],
      style: 'solid',
      outline:{
        color: '#FCFA3E',
        width: 0.75
      }
  },
  "3d": {
            type: "polygon-3d", // autocasts as new PolygonSymbol3D()
            symbolLayers: [{
              type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
              material: {
                color: [115, 205, 241, 0.75]
                // color: "#86CFE8"
              },
              edges: {        
              type: "solid",
            color: [0, 72, 131, 0.6],
            size: 1
            }}]
    }
  },
  popupTemplate:{
    title: "{DESCLU}",
    content: [{
      type: "fields",
      fieldInfos: [{
        fieldName: "ADDRESS",
        label: "Address"
      }, {
        fieldName: "DESCLU",
        label: "Type"
      }, {
        fieldName: "ELEVATION",
        label: "Height"
      }]
    }]
  }
}