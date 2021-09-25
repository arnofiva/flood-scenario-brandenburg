import "./style.scss";

import Map = require("esri/Map");
import MapView = require("esri/views/MapView");
import ElevationLayer = require("esri/layers/ElevationLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");
import { SimpleRenderer } from "esri/renderers";
import { PolygonSymbol3D, FillSymbol3DLayer } from "esri/symbols";
import GroupLayer = require("esri/layers/GroupLayer");
import SceneView = require("esri/views/SceneView");
import SceneLayer = require("esri/layers/SceneLayer");
import Expand = require("esri/widgets/Expand");
import LayerList = require("esri/widgets/LayerList");
import Point = require("esri/geometry/Point");
import SpatialReference = require("esri/geometry/SpatialReference");
import Collection = require("esri/core/Collection");

const map = new Map({
  basemap: "topo-vector",
  ground: "world-elevation"
});

const view = new MapView({
  container: "viewDiv",
  map,
  center: new Point({
    spatialReference: SpatialReference.WebMercator,
    x: 1597215.573864947,
    y: 6757642.803992274
  }),
  zoom: 15
});

// const view = new SceneView({
//   camera: {
//     position: {
//       longitude: 14.35284935,
//       latitude: 51.7228776,
//       z: 2300.04277
//     },
//     heading: 346.95,
//     tilt: 60.7
//   },
//   container: "viewDiv",
//   map
// });

const buildings = new FeatureLayer({
  portalItem: {
    id: "4fec8c45d6294e3a9cdaa20b8ec4df3d"
  },
  minScale: 0,
  maxScale: 0
});
map.add(buildings);

const floodRisk = new GroupLayer({
  portalItem: {
    id: "7b18fa3bae7d47d1ad3344a8d52eb295"
  }
});
map.add(floodRisk);

const lakes = new FeatureLayer({
  portalItem: {
    id: "f1b50ae2711c4699b34b485030cfe7ef"
  }
});
map.add(lakes);

const elevation = new ElevationLayer({
  portalItem: {
    id: "7029fb60158543ad845c7e1527af11e4"
  }
});

view.on("click", async (e) => {
  const pointOnMap = view.toMap(e);

  const riskLayers = floodRisk.layers as Collection<FeatureLayer>;

  const promises = riskLayers.map(async (layer) => {
    const layerView = await view.whenLayerView(layer);

    const query = layerView.createQuery();
    query.geometry = pointOnMap; // the point location of the pointer
    // query.distance = 2;
    // query.units = "meters";
    query.spatialRelationship = "intersects";

    const result = await layerView.queryFeatures(query);

    console.log("Risk", layer.title, result.features);
  });
  await Promise.all(promises);

  await elevation.load();
  const elevationResult = await elevation.queryElevation(pointOnMap);

  console.log("Elevation", elevationResult);
});

view.ui.add(
  new Expand({
    view,
    expanded: true,
    content: new LayerList({
      view
    })
  }),
  "bottom-left"
);

window["view"] = view;

view.popup.defaultPopupTemplateEnabled = true;
view.popup.autoOpenEnabled = false;