import * as L from 'leaflet';

import {MapTileLayerOptions, Artist} from 'src/types/models';
import config from 'src/config';
import PlaycountMap from 'src/components/PlaycountMap';

import 'leaflet/dist/leaflet.css';
import 'src/app.scss';

const {MAPBOX_ACCESS_TOKEN: accessToken} = process.env;
const {defaultView: {center, zoom}, tileLayer: {urlTemplate, options}} = config.map;
const darkModeMediaQueryString = '(prefers-color-scheme: dark)';

function fetchAndParseData<DataType>(url: string): Promise<DataType> {
  return window.fetch(url)
    .then((response) => response.json());
}

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

function getDarkModeMediaQuery(): MediaQueryList {
  return window.matchMedia(darkModeMediaQueryString);
}

function createPlaycountMap(artists: Artist[], world: any): PlaycountMap {
  const isDarkMode = getDarkModeMediaQuery().matches;
  const map = L.map('map').setView(center, zoom);
  const tileLayer = L.tileLayer(urlTemplate, getTileLayerOptions(isDarkMode));
  const playcountMap = new PlaycountMap(map, artists, world, isDarkMode);

  tileLayer.addTo(map);
  playcountMap.render();

  return playcountMap;
}

function initialize(artists: Artist[], world: any): void {
  let playcountMap = createPlaycountMap(artists, world);

  getDarkModeMediaQuery().addEventListener('change', () => {
    playcountMap.map.remove();
    playcountMap = createPlaycountMap(artists, world);
  });
}

Promise.all([
  fetchAndParseData(config.dataUrls.artists) as Promise<Artist[]>,
  fetchAndParseData(config.dataUrls.world),
])
  .then(([artists, world]) => initialize(artists, world));
