import Router, {parse} from 'micro-conductor';

import {Artist, PackedArtist, Area} from 'src/types/models';
import config from 'src/config';
import createMap from 'src/map';
import PlaycountMap from 'src/components/PlaycountMap';

import 'src/app.scss';

interface CountryCodeMapping {
  [code: string]: string;
}

function prepareArtists(packedArtists: PackedArtist[], world: any): Artist[] {
  const countryCodeToArea: CountryCodeMapping = world.features.reduce(
    (acc: CountryCodeMapping, {properties: {name, iso_a2}}: Area) => {
      acc[iso_a2] = name;
      return acc;
    },
    {},
  );

  return packedArtists
    .map(([name, playcount, countryCode]) => ({
      name,
      playcount,
      area: countryCodeToArea[countryCode],
    }))
    .sort((a, b) => b.playcount - a.playcount);
}

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
  const router = new Router(
    {
      '': playcountMap.deselectArea,
      [parse`${/[a-z,A-Z,+]+/}`]: playcountMap.selectAreaByRoute,
    },
    playcountMap,
  );

  router.start();

  getDarkModeMediaQuery().addEventListener('change', () => {
    playcountMap.map.remove();
    playcountMap = createPlaycountMap(artists, world);
    // @todo: check if routing and highlighting are not broken when an instance of playcount map is replaced
  });
}

Promise.all([
  fetchAndParseData(config.dataUrls.artists) as Promise<PackedArtist[]>,
  fetchAndParseData(config.dataUrls.world),
])
  .then(([packedArtists, world]) => initialize(
    prepareArtists(packedArtists, world),
    world,
  ));
