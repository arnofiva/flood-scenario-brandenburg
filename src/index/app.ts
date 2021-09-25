import "./style.scss";

import Map = require("esri/Map");
import MapView = require("esri/views/MapView");
import ElevationLayer = require("esri/layers/ElevationLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");
import { SimpleRenderer } from "esri/renderers";
import { PolygonSymbol3D, FillSymbol3DLayer } from "esri/symbols";

const map = new Map({
  basemap: "topo-vector"
});

const view = new MapView({
  container: "viewDiv",
  map
});

const floodRisk = new FeatureLayer({
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

  const lv = await view.whenLayerView(floodRisk);

  const query = lv.createQuery();
  query.geometry = pointOnMap; // the point location of the pointer
  query.distance = 2;
  query.units = "miles";
  query.spatialRelationship = "intersects";

  const result = await lv.queryFeatures(query);

  console.log("Medium flood risks", result);

  await elevation.load();
  const elevationResult = await elevation.queryElevation(pointOnMap);

  console.log("Elevation", elevationResult);
});

view.popup.defaultPopupTemplateEnabled = true;