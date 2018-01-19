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

function getAreaStyle(area: Area) {
  const fillColor = getColorString(
    config.map.area.fillColor,
    colorOpacityScale(area.properties.playcount),
  );

  return {
    ...config.map.area.baseStyle,
    fillColor,
  };
}

const areasCollection = {
  type: 'FeatureCollection' as GeoJsonTypes,
  features: areas,
};

const tileLayer = L.tileLayer(config.map.tileLayer.urlTemplate, {
  ...config.map.tileLayer.options,
  accessToken,
});

const geojson = L.geoJSON(areasCollection, {style: getAreaStyle});

const map = L.map('map').setView(
  config.map.defaultView.center,
  config.map.defaultView.zoom,
);

tileLayer.addTo(map);
geojson.addTo(map);

(window as any).L = L;
(window as any).map = map;
