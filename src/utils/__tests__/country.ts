import {WorldGeoJson} from 'src/types/models';
import * as worldData from 'data/world.geo.json';
import {groupArtistsByCountryName, getArtistsCountries, getCountryScrobbleCount} from '../country';

const dreamTheater = {
  name: 'Dream Theater',
  playcount: 755,
  countryName: 'United States',
};

const queen = {
  name: 'Queen',
  playcount: 738,
  countryName: 'United Kingdom',
};

const rammstein = {
  name: 'Rammstein',
  playcount: 693,
  countryName: 'Germany',
};

const darkTranquillity = {
  name: 'Dark Tranquillity',
  playcount: 626,
  countryName: 'Sweden',
};

const inFlames = {
  name: 'In Flames',
  playcount: 626,
  countryName: 'Sweden',
};

const opeth = {
  name: 'Opeth',
  playcount: 583,
  countryName: 'Sweden',
};

const him = {
  name: 'Him',
  playcount: 572,
  countryName: 'Finland',
};

const korn = {
  name: 'Korn',
  playcount: 474,
  countryName: 'United States',
};

const nightwish = {
  name: 'Nightwish',
  playcount: 461,
  countryName: 'Finland',
};

const deftones = {
  name: 'Deftones',
  playcount: 450,
  countryName: 'United States',
};

describe('country utils', () => {
  test('groupArtistsByCountryName()', () => {
    const artists = [
      dreamTheater,
      queen,
      rammstein,
      darkTranquillity,
      inFlames,
      opeth,
      him,
      korn,
      nightwish,
      deftones,
    ];

    expect(groupArtistsByCountryName(artists)).toEqual({
      'Finland': {
        name: 'Finland',
        artists: [
          {
            ...him,
            rank: 7,
          },
          {
            ...nightwish,
            rank: 9,
          },
        ],
      },

      'Germany': {
        name: 'Germany',
        artists: [
          {
            ...rammstein,
            rank: 3,
          },
        ],
      },

      'Sweden': {
        name: 'Sweden',
        artists: [
          {
            ...darkTranquillity,
            rank: 4,
          },
          {
            ...inFlames,
            rank: 5,
          },
          {
            ...opeth,
            rank: 6,
          },
        ],
      },

      'United Kingdom': {
        name: 'United Kingdom',
        artists: [
          {
            ...queen,
            rank: 2,
          },
        ],
      },

      'United States': {
        name: 'United States',
        artists: [
          {
            ...dreamTheater,
            rank: 1,
          },
          {
            ...korn,
            rank: 8,
          },
          {
            ...deftones,
            rank: 10,
          },
        ],
      },
    });
  });

  test('getArtistsCountries()', () => {
    const artists = [
      dreamTheater,
      queen,
      rammstein,
      darkTranquillity,
      inFlames,
      opeth,
      him,
      korn,
      nightwish,
      deftones,
    ];

    expect(getArtistsCountries(artists, worldData as unknown as WorldGeoJson)).toMatchObject([
      {
        type: 'Feature',
        properties: {
          name: 'United States',
          artists: [
            {
              ...dreamTheater,
              rank: 1,
            },
            {
              ...korn,
              rank: 8,
            },
            {
              ...deftones,
              rank: 10,
            },
          ],
        },
      },

      {
        type: 'Feature',
        properties: {
          name: 'Germany',
          artists: [
            {
              ...rammstein,
              rank: 3,
            },
          ],
        },
      },

      {
        type: 'Feature',
        properties: {
          name: 'Finland',
          artists: [
            {
              ...him,
              rank: 7,
            },
            {
              ...nightwish,
              rank: 9,
            },
          ],
        },
      },

      {
        type: 'Feature',
        properties: {
          name: 'United Kingdom',
          artists: [
            {
              ...queen,
              rank: 2,
            },
          ],
        },
      },

      {
        type: 'Feature',
        properties: {
          name: 'Sweden',
          artists: [
            {
              ...darkTranquillity,
              rank: 4,
            },
            {
              ...inFlames,
              rank: 5,
            },
            {
              ...opeth,
              rank: 6,
            },
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
