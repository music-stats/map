import * as L from 'leaflet';

import {Artist} from 'src/types/models';
import config from 'src/config';
import PlaycountMap from 'src/components/PlaycountMap';

import 'src/app.scss';

const {MAPBOX_ACCESS_TOKEN: accessToken} = process.env;

const map = L.map('map').setView(
  config.map.defaultView.center,
  config.map.defaultView.zoom,
);

const tileLayer = L.tileLayer(
  config.map.tileLayer.urlTemplate,
  {
    ...config.map.tileLayer.options,
    accessToken,
  }
);

function fetchAndParseJson<DataType>(url: string): Promise<DataType> {
  return window.fetch(url)
    .then((response) => response.json());
}

function initializePlaycountMap(artists: Artist[], world: any): void {
  const playcountMap = new PlaycountMap(map, artists, world);

  playcountMap.render();

  // debug
  (window as any).L = L;
  (window as any).map = map;
  (window as any).playcountMap = playcountMap;
}

tileLayer.addTo(map);

Promise.all([
  fetchAndParseJson(config.dataUrls.artists) as Promise<Artist[]>,
  fetchAndParseJson(config.dataUrls.world),
])
  .then(([artists, world]) => initializePlaycountMap(artists, world));
