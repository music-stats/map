import * as L from 'leaflet';
import {GeoJsonTypes} from 'geojson';
import * as d3Scale from 'd3-scale';

import {Area} from 'src/types';
import {getArtistsAreas, getAreaSongCount} from 'src/utils/area';
import {getColorString} from 'src/utils/color';
import config from 'src/config';

import * as artists from 'data/artists.json';

import renderInfoBox from 'src/templates/InfoBox';

import 'leaflet/dist/leaflet.css';
import 'src/app.scss';

const {MAPBOX_ACCESS_TOKEN: accessToken} = process.env;

const areas = getArtistsAreas(artists as any);
const songCounts = areas.map(getAreaSongCount);
const totalArtistCount = (artists as any).length;
const totalSongCount = songCounts.reduce((sum, areaSongCount) => sum + areaSongCount, 0);

const colorOpacityScale = d3Scale.scaleLinear()
  .domain([
    Math.min(...songCounts),
    Math.max(...songCounts),
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
    colorOpacityScale(getAreaSongCount(area)),
  );

  return {
    ...config.map.area.style.default,
    fillColor,
  };
}

function higlightArea(e: L.LeafletEvent) {
  const layer = e.target as L.Polyline;

  layer.setStyle(config.map.area.style.highlight);
  layer.bringToFront();

  info.update(layer.feature);
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

interface InfoBox extends L.Control {
  element: HTMLElement;
  update: (area?: Area) => void;
}

const info: InfoBox = (L.control as any)();

info.onAdd = function() {
  (this as InfoBox).element = L.DomUtil.create('article', 'InfoBox');
  (this as InfoBox).update();

  return (this as InfoBox).element;
};

info.update = function(area = null) {
  (this as InfoBox).element.innerHTML = renderInfoBox({
    username: config.username,
    totalSongCount,
    totalArtistCount,
    areaSongCount: area
      ? getAreaSongCount(area)
      : null,
    ...(area
      ? area.properties
      : null),
  });
};

tileLayer.addTo(map);
geojson.addTo(map);
info.addTo(map);

// debug
(window as any).L = L;
(window as any).map = map;
