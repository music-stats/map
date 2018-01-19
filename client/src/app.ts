import * as L from 'leaflet';
import {GeoJsonTypes} from 'geojson';
import * as d3Scale from 'd3-scale';

import {Area} from 'src/types';
import {getArtistsAreas} from 'src/utils/area';
import {getColorString} from 'src/utils/color';
import config from 'src/config';

import * as artists from 'data/artists.json';

import 'leaflet/dist/leaflet.css';
import 'src/app.scss';

const {MAPBOX_ACCESS_TOKEN: accessToken} = process.env;

const areas = getArtistsAreas(artists as any);
const playcounts = areas.map((area) => area.properties.playcount);

const colorOpacityScale = d3Scale.scaleLinear()
  .domain([
    Math.min(...playcounts),
    Math.max(...playcounts),
  ])
  .range([
    config.map.area.fillColorOpacity.min,
    config.map.area.fillColorOpacity.max,
  ]);

const map = L.map('map').setView(
  config.map.defaultView.center,
  config.map.defaultView.zoom,
);

function getAreaStyle(area: Area) {
  const fillColor = getColorString(
    config.map.area.fillColor,
    colorOpacityScale(area.properties.playcount),
  );

  return {
    ...config.map.area.style.default,
    fillColor,
  };
}

function higlightArea(e: L.LeafletEvent) {
  const layer = e.target as L.Path;

  layer.setStyle(config.map.area.style.highlight);
  layer.bringToFront();
}

function resetHighlight(e: L.LeafletEvent) {
  geojson.resetStyle(e.target);
}

function zoomToArea(e: L.LeafletEvent) {
  map.fitBounds(e.target.getBounds());
}

const areasCollection = {
  type: 'FeatureCollection' as GeoJsonTypes,
  features: areas,
};

const tileLayer = L.tileLayer(config.map.tileLayer.urlTemplate, {
  ...config.map.tileLayer.options,
  accessToken,
});

const geojson = L.geoJSON(areasCollection, {
  style: getAreaStyle,
  onEachFeature: (_, layer) => layer.on({
    mouseover: higlightArea,
    mouseout: resetHighlight,
    click: zoomToArea,
  }),
});

tileLayer.addTo(map);
geojson.addTo(map);

(window as any).L = L;
(window as any).map = map;
