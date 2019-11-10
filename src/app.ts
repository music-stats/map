import Router, {parse} from 'micro-conductor';

import {Artist, PackedArtist, CountryGeoJson} from 'src/types/models';
import config from 'src/config';
import createMap from 'src/map';
import PlaycountMap from 'src/components/PlaycountMap';

import 'src/app.scss';

interface CountryCodeMapping {
  [code: string]: string;
}

function prepareArtists(packedArtists: PackedArtist[], world: any): Artist[] {
  const countryCodeToCountry: CountryCodeMapping = world.features.reduce(
    (acc: CountryCodeMapping, {properties: {name_long, iso_a2}}: CountryGeoJson) => {
      acc[iso_a2] = name_long;
      return acc;
    },
    {},
  );

  return packedArtists
    .map(([name, playcount, countryCode]) => ({
      name,
      playcount,
      countryName: countryCodeToCountry[countryCode],
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
      '': playcountMap.deselectCountry,
      [parse`${/[a-z,A-Z,+]+/}`]: playcountMap.selectCountryByRoute,
    },
    playcountMap,
  );

  router.start();

  // @todo: fix routing and highlighting when an instance of playcount map is replaced
  getDarkModeMediaQuery().addEventListener('change', () => {
    playcountMap.map.remove();
    playcountMap = createPlaycountMap(artists, world);
  });
}

Promise.all([
  fetchAndParseData(config.dataUrls.artists),
  fetchAndParseData(config.dataUrls.world),
])
  .then(([packedArtists, world]) => initialize(
    prepareArtists(packedArtists as PackedArtist[], world),
    world,
  ));
