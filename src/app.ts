import Router, {parse} from 'micro-conductor';

import {Artist, PackedArtist, WorldGeoJson} from 'src/types/models';
import config from 'src/config';
import createMap from 'src/map/map';
import {unpackArtists} from 'src/utils/country';
import PlaycountMap from 'src/components/PlaycountMap';

import 'src/app.scss';

function fetchAndParseJson<DataType>(url: string): Promise<DataType> {
  return window.fetch(url)
    .then((response) => response.json());
}

function getDarkModeMediaQuery(): MediaQueryList {
  return window.matchMedia('(prefers-color-scheme: dark)');
}

function createPlaycountMap(artists: Artist[], world: WorldGeoJson): PlaycountMap {
  const isDarkMode = getDarkModeMediaQuery().matches;
  const map = createMap(isDarkMode);

  return new PlaycountMap(map, artists, world, isDarkMode);
}

function initialize(artists: Artist[], world: WorldGeoJson): void {
  let playcountMap = createPlaycountMap(artists, world);
  const getPlaycountMap = () => playcountMap;
  const router = new Router({
    '': () => getPlaycountMap().deselectCountry(),
    [parse`${/[a-z,A-Z,+]+/}`]: (route) => getPlaycountMap().selectCountryByRoute(route),
  });
  const onDarkModeChange = () => {
    playcountMap.map.remove();
    playcountMap = createPlaycountMap(artists, world);
    playcountMap.render();
    router.navigate();
  };

  playcountMap.render();
  router.start();
  getDarkModeMediaQuery().addEventListener('change', onDarkModeChange);
}

Promise.all<PackedArtist[], WorldGeoJson>([
  fetchAndParseJson(config.dataUrls.artists),
  fetchAndParseJson(config.dataUrls.world),
])
  .then(([packedArtists, world]) => initialize(
    unpackArtists(packedArtists, world),
    world,
  ));
