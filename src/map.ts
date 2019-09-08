import * as L from 'leaflet';

import {MapTileLayerOptions} from 'src/types/models';
import config from 'src/config';

import 'leaflet/dist/leaflet.css';
import 'src/map.scss';

const {MAPBOX_ACCESS_TOKEN: accessToken} = process.env;
const {defaultView: {center, zoom}, tileLayer: {urlTemplate, options}} = config.map;

function getTileLayerOptions(isDarkMode: boolean): MapTileLayerOptions {
  return {
    ...options,
    accessToken,
    id: isDarkMode
      ? 'mapbox.dark'
      : 'mapbox.light',
    highResolution: window.devicePixelRatio === 1
      ? ''
      : '@2x',
  };
}

export default function createMap(isDarkMode: boolean): L.Map {
  const map = L.map('map').setView(center, zoom);
  const tileLayer = L.tileLayer(urlTemplate, getTileLayerOptions(isDarkMode));

  tileLayer.addTo(map);

  return map;
}
