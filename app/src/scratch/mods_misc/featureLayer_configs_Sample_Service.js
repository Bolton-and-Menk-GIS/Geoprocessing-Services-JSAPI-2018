const symbols = {
  "2d": {
    resSym:{
      type: "simple-fill",
      color: "#FC921F",
      style: 'solid',
      outline:{
        color: '#FCFA3E',
        width: 0.75
      }
    },
    condoSym:{
      type: "simple-fill",
      color: "#4c294b",
      style: 'solid',
      outline:{
        color: "#A0FFFC",
        width: 0.75
      }
    }
  },
  "3d": {
    resSym:{
      type: "polygon-3d", // autocasts as new PolygonSymbol3D()
      symbolLayers: [{
        type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
        material: {
          color: "#FC921F"
        },
        edges: {
          type: "solid",
          color: "#72420d",
          size: 1.5
        }
      }]
    },
    condoSym:{
      type: "polygon-3d", // autocasts as new PolygonSymbol3D()
      symbolLayers: [{
        type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
        material: {
          color: "#9E559C"
        },
        edges: {
          type: "solid",
          color: "#4c294b",
          size: 1.5
        }
      }]
    }
  }
};

export default {
  symbols:{
    _2d: symbols["2d"],
    _3d: symbols["3d"]
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
  },
  renderers: {
    parc:{
      type: "simple",
      symbol:{
      type: "simple-fill",
      color: [115, 205, 241, 0.75],
      style: 'solid',
      outline:{
        color: '#FCFA3E',
        width: 1.25
      }
    }
    },
    _2d: {
      type: "unique-value",
      defaultLabel: "Other",
      field: "DESCLU",
      uniqueValueInfos: [{
        value: "Residential",
        symbol: symbols['2d'].resSym,
        label: "Residential"
      }, {
        value: "Residential Condominium",
        symbol: symbols['2d'].condoSym,
        label: "Condominium"
      }]
    },
    _3d: {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      defaultSymbol: {
        type: "polygon-3d", // autocasts as new PolygonSymbol3D()
        symbolLayers: [{
          type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
          material: {
            color: "#A7C636"
          },
          edges: {
            type: "solid",
            color: "#4d5b18",
            size: 1.5
          }
        }]
      },
      defaultLabel: "Other",
      field: "DESCLU",
      uniqueValueInfos: [{
        value: "Residential",
        symbol: symbols['3d'].resSym,
        label: "Residential"
      }, {
        value: "Residential Condominium",
        symbol: symbols['3d'].condoSym,
        label: "Condominium"
      }],
      visualVariables: [{
        type: "size",
        field: "ELEVATION",
        valueUnit: "feet" // Converts and extrudes all data values in feet
      }]
    }
  }
}