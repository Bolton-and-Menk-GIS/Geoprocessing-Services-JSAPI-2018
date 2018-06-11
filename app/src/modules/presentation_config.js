export default {
  symbols:{
    draw: {
      type: "simple-fill", // autocasts as new SimpleFillSymbol()
      color: [0, 255, 242, 0.3],
      style: "solid",
      outline: {
        color: [31, 112, 108],
        width: 1.5
      }
    },
    pointSelection:{
        type: "simple-marker",
        size: 15,
        color: [65, 255, 255, 0.5],
        outline: {
          color: [112, 112, 112, 1],
          width: 1.5
        }
    },
    bufferSelection:{
      type: "simple-fill",
      size: 15,
      color: [255, 181, 71, 0.1],
      outline: {
        color: [255, 181, 71, 0.5],
        width: 0
      }
    },
    bufferArea:{
      type: "simple-fill",
      size: 15,
      color: [255, 181, 71, 0.1],
      outline: {
        color: [255, 71, 71, 1],
        width: 1.25
      }
    },
    getColorForPercentage: (pct) => {
      // intersection/crash symbology definition
      // I stole this from stack overflow:
      //   https://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage
      const percentColors = [
        {pct: 0.0, color: {r: 0xff, g: 0x00, b: 0}},
        {pct: 0.5, color: {r: 0xff, g: 0xff, b: 0}},
        {pct: 1.0, color: {r: 0x00, g: 0xff, b: 0}}
      ];

      let i;
      for (i = 1; i < percentColors.length - 1; i++) {
        if (pct <= percentColors[i].pct) {
          break;
        }
      }
      const lower = percentColors[i - 1];
      const upper = percentColors[i];
      const range = upper.pct - lower.pct;
      const rangePct = (pct - lower.pct) / range;
      const pctLower = 1 - rangePct;
      const pctUpper = rangePct;
      return {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
      };
    }
  },
    renderers: {
      // custom renderer for parcels layer
      parcels: {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [115, 205, 241, 0.75],
          style: 'solid',
          outline: {
            color: '#FCFA3E',
            width: 1.25
          }
        }
      }
    },
  popupTemplate: {
    parcels:{
    title: 'Parcels',
    content: [{
      type: 'fields',
      fieldInfos: [{ fieldName: 'formatted_pin', label: 'Parcel ID' },
        { fieldName: 'address', label: 'Property Address' },
        { fieldName: 'taxpayer_name', label: 'Taxpayer Name' },
        { fieldName: 'taxpayer_addr', label: 'Taxpayer Address' },
        { fieldName: 'taxpayer_csz', label: 'Taxpayer City, St Zip' },
        { fieldName: 'nbhd_assoc', label: 'Subdivision' },
        { fieldName: 'legal', label: 'Legal Description' },
        { fieldName: 'acres', label: 'Deeded Acres' },
        { fieldName: 'gis_acres', label: 'GIS Acres' },
        { fieldName: 'sf', label: 'Building Sq Ft' },
        { fieldName: 'class_desc', label: 'Parcel Class' },
        { fieldName: 'land_full', label: 'Land Value' },
        { fieldName: 'bldg_full', label: 'Building Value' },
        { fieldName: 'total_full', label: 'Total Value' },
        { fieldName: 'year_built', label: 'Year Built'},
        { fieldName: 'city', label: 'City' },
        { fieldName: 'state', label: 'State' },
        { fieldName: 'zip', label: 'Zip' },
        { fieldName: 'OBJECTID', label: 'ObjectId' }
      ]
    }],
    actions: [{
      // Popup Action definition - build in custom popup behavior
      title: 'Property Export',
      id: 'export-property-report',
      className: 'esri-icon-documentation'
    }]
  },
    intersections: {
      title: "Intersections",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "Intersections",
          label: "Intersections"
        }, {
          fieldName: "Count_",
          label: "Count"
        }, {
          fieldName: "BMI_IntID",
          label: "BMI Int ID"
        }]
      }]
    }
  },
  WebMap_Json: (view, parcels, oid) => {
    return {
      mapOptions: {
        extent: view.extent.toJSON(),
      },
      basemap: {
        title: 'ESRI Imagery',
        baseMapLayers: [{
          url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        }]
      },
      operationalLayers: [{
        opacity: parcels.sublayers.items[0].layer.opacity,
        title: parcels.title || 'Parcels',
        url: parcels.sublayers.items[0].url,
        selectionSymbol: {
          "type": "esriSFS",
          "color": [
            112,
            112,
            112,
            0
          ],
          "outline": {
            "type": "esriSLS",
            "color": [
              255,
              255,
              0,
              255
            ],
            "width": 2.5,
            "style": "esriSLSSolid"
          },
          "style": "esriSFSSolid"
        },
        layerDefinition: {
          definitionExpression: parcels.sublayers.items[0].definitionExpression,
          drawingInfo: {
            renderer: parcels.sublayers.items[0].renderer.toJSON()
          }
        },
        selectionObjectIds: [oid]
      }]
    };
  }
}