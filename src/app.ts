import * as L from 'leaflet';

import {Artist} from 'src/types/models';
import config from 'src/config';
import PlaycountMap from 'src/components/PlaycountMap';

import 'leaflet/dist/leaflet.css';
import 'src/app.scss';

const {MAPBOX_ACCESS_TOKEN: accessToken} = process.env;
const {defaultView: {center, zoom}, tileLayer: {urlTemplate, options}} = config.map;
const tileLayerOptions = {
  ...options,
  accessToken,
};

function fetchAndParseData<DataType>(url: string): Promise<DataType> {
  return window.fetch(url)
    .then((response) => response.json());
}

function initialize(artists: Artist[], world: any): void {
  const map = L.map('map').setView(center, zoom);
  const tileLayer = L.tileLayer(urlTemplate, tileLayerOptions);
  const playcountMap = new PlaycountMap(map, artists, world);

  tileLayer.addTo(map);
  playcountMap.render();

  // debug
  (window as any).L = L;
  (window as any).map = map;
  (window as any).playcountMap = playcountMap;
}

Promise.all([
  fetchAndParseData(config.dataUrls.artists) as Promise<Artist[]>,
  fetchAndParseData(config.dataUrls.world),
])
  .then(([artists, world]) => initialize(artists, world));
