import * as L from 'leaflet';
import {GeoJsonTypes} from 'geojson';
import * as d3Scale from 'd3-scale';

import {Area} from 'src/types';
import {getArtistsAreas} from 'src/utils/artists';
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

function getAreaStyle(area: Area) {
  const {r, g, b} = config.map.area.fillColor;

  return {
    ...config.map.area.baseStyle,
    fillColor: `rgba(${r}, ${g}, ${b}, ${colorOpacityScale(area.properties.playcount)})`,
  };
}

const map = L.map('map').setView(config.map.defaultView.center, config.map.defaultView.zoom);
const tileLayerOptions = {
  ...config.map.tileLayer.options,
  accessToken,
};

const geojson = {
  type: 'FeatureCollection' as GeoJsonTypes,
  features: areas,
};

L.tileLayer(config.map.tileLayer.urlTemplate, tileLayerOptions).addTo(map);
L.geoJSON(geojson, {style: getAreaStyle}).addTo(map);

(window as any).L = L;
(window as any).map = map;
