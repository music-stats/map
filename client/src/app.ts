import * as L from 'leaflet';

import * as artists from 'data/artists.json';
import config from 'src/config';

import PlaycountMap from 'src/classes/PlaycountMap';

import 'src/app.scss';

const {MAPBOX_ACCESS_TOKEN: accessToken} = process.env;

const map = L.map('map').setView(
  config.map.defaultView.center,
  config.map.defaultView.zoom,
);

const tileLayer = L.tileLayer(config.map.tileLayer.urlTemplate, {
  ...config.map.tileLayer.options,
  accessToken,
});

const playcountMap = new PlaycountMap(map, artists as any);

tileLayer.addTo(map);
playcountMap.render();

// debug
(window as any).L = L;
(window as any).map = map;
(window as any).playcountMap = playcountMap;
