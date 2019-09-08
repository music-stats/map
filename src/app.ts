import {Artist} from 'src/types/models';
import config from 'src/config';
import createMap from 'src/map';
import PlaycountMap from 'src/components/PlaycountMap';

import 'src/app.scss';

function fetchAndParseData<DataType>(url: string): Promise<DataType> {
  return window.fetch(url)
    .then((response) => response.json());
}

function getDarkModeMediaQuery(): MediaQueryList {
  return window.matchMedia('(prefers-color-scheme: dark)');
}

function createPlaycountMap(artists: Artist[], world: any): PlaycountMap {
  const isDarkMode = getDarkModeMediaQuery().matches;
  const map = createMap(isDarkMode);
  const playcountMap = new PlaycountMap(map, artists, world, isDarkMode);

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
