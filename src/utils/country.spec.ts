import {WorldGeoJson} from 'src/types/models';
import * as worldData from 'data/world.geo.json';
import {unpackArtists, groupArtistsByCountryName, getArtistsCountries, getCountryScrobbleCount} from './country';

const world = worldData as unknown as WorldGeoJson;

describe('country utils', () => {
  const dreamTheater =     {name: 'Dream Theater',     playcount: 755, countryName: 'United States'};
  const queen =            {name: 'Queen',             playcount: 738, countryName: 'United Kingdom'};
  const rammstein =        {name: 'Rammstein',         playcount: 693, countryName: 'Germany'};
  const darkTranquillity = {name: 'Dark Tranquillity', playcount: 626, countryName: 'Sweden'};
  const inFlames =         {name: 'In Flames',         playcount: 626, countryName: 'Sweden'};
  const opeth =            {name: 'Opeth',             playcount: 583, countryName: 'Sweden'};
  const him =              {name: 'Him',               playcount: 572, countryName: 'Finland'};
  const korn =             {name: 'Korn',              playcount: 474, countryName: 'United States'};
  const nightwish =        {name: 'Nightwish',         playcount: 461, countryName: 'Finland'};
  const deftones =         {name: 'Deftones',          playcount: 450, countryName: 'United States'};

  test('unpackArtists()', () => {
    expect(unpackArtists(
      [
        ['-deTach-',           19,  'UA'],
        ['1000mods',           5,   'GR'],
        ['1914',               15,  'UA'],
        ['30 Seconds to Mars', 1,   'US'],
        ['40 Watt Sun',        3,   'GB'],
        ['5 vymir',            8,   'UA'],
        ['65daysofstatic',     119, 'GB'],
        ['8x8',                9,   'UA'],
        ['A Lot Like Birds',   3,   'US'],
        ['A Perfect Circle',   180, 'US']
      ],
      world,
    )).toEqual([
      {name: 'A Perfect Circle',   playcount: 180, countryName: 'United States'},
      {name: '65daysofstatic',     playcount: 119, countryName: 'United Kingdom'},
      {name: '-deTach-',           playcount: 19,  countryName: 'Ukraine'},
      {name: '1914',               playcount: 15,  countryName: 'Ukraine'},
      {name: '8x8',                playcount: 9,   countryName: 'Ukraine'},
      {name: '5 vymir',            playcount: 8,   countryName: 'Ukraine'},
      {name: '1000mods',           playcount: 5,   countryName: 'Greece'},
      {name: '40 Watt Sun',        playcount: 3,   countryName: 'United Kingdom'},
      {name: 'A Lot Like Birds',   playcount: 3,   countryName: 'United States'},
      {name: '30 Seconds to Mars', playcount: 1,   countryName: 'United States'},
    ]);
  });

  test('groupArtistsByCountryName()', () => {
    const artists = [
      dreamTheater, queen, rammstein, darkTranquillity, inFlames, opeth, him, korn, nightwish, deftones,
    ];

    expect(groupArtistsByCountryName(artists)).toEqual({
      'Finland': {
        name: 'Finland',
        artists: [
          {...him,       rank: 7},
          {...nightwish, rank: 9},
        ],
      },

      'Germany': {
        name: 'Germany',
        artists: [
          {...rammstein, rank: 3},
        ],
      },

      'Sweden': {
        name: 'Sweden',
        artists: [
          {...darkTranquillity, rank: 4},
          {...inFlames,         rank: 5},
          {...opeth,            rank: 6},
        ],
      },

      'United Kingdom': {
        name: 'United Kingdom',
        artists: [
          {...queen, rank: 2},
        ],
      },

      'United States': {
        name: 'United States',
        artists: [
          {...dreamTheater, rank: 1},
          {...korn,         rank: 8},
          {...deftones,     rank: 10},
        ],
      },
    });
  });

  test('getArtistsCountries()', () => {
    const artists = [
      dreamTheater, queen, rammstein, darkTranquillity, inFlames, opeth, him, korn, nightwish, deftones,
    ];

    expect(getArtistsCountries(artists, world)).toMatchObject([
      {
        type: 'Feature',
        properties: {
          name: 'United States',
          artists: [
            {...dreamTheater, rank: 1},
            {...korn,         rank: 8},
            {...deftones,     rank: 10},
          ],
        },
      },

      {
        type: 'Feature',
        properties: {
          name: 'Germany',
          artists: [
            {...rammstein, rank: 3},
          ],
        },
      },

      {
        type: 'Feature',
        properties: {
          name: 'Finland',
          artists: [
            {...him,       rank: 7},
            {...nightwish, rank: 9},
          ],
        },
      },

      {
        type: 'Feature',
        properties: {
          name: 'United Kingdom',
          artists: [
            {...queen, rank: 2},
          ],
        },
      },

      {
        type: 'Feature',
        properties: {
          name: 'Sweden',
          artists: [
            {...darkTranquillity, rank: 4},
            {...inFlames,         rank: 5},
            {...opeth,            rank: 6},
          ],
        },
      },
    ]);
  });

  test('getCountryScrobbleCount()', () => {
    expect(getCountryScrobbleCount({
      type: 'Feature',
      geometry: null,
      properties: {
        name: 'Sweden',
        artists: [
          darkTranquillity,
          inFlames,
          opeth,
        ],
      },
    })).toBe(1835);

    expect(getCountryScrobbleCount({
      type: 'Feature',
      geometry: null,
      properties: {
        name: 'United Kingdom',
        artists: [
          queen,
        ],
      },
    })).toBe(738);
  });
});
