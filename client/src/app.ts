import * as L from 'leaflet';
import {GeoJsonTypes} from 'geojson';

import {getArtistsAreas} from 'src/utils/artists';
import config from 'src/config';

import * as artists from 'data/artists.json';

import 'leaflet/dist/leaflet.css';
import 'src/app.scss';

const {MAPBOX_ACCESS_TOKEN: accessToken} = process.env;

const areas = getArtistsAreas(artists as any);
const geojson = {
  type: 'FeatureCollection' as GeoJsonTypes,
  features: areas,
};

const map = L.map('map').setView(config.map.defaultView.center, config.map.defaultView.zoom);
const tileLayerOptions = {
  ...config.map.tileLayer.options,
  accessToken,
};

L.tileLayer(config.map.tileLayer.urlTemplate, tileLayerOptions).addTo(map);
L.geoJSON(geojson).addTo(map);

(window as any).L = L;
(window as any).map = map;
