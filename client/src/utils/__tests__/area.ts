import * as worldData from 'data/world.geo.json';

import {groupArtistsByArea, getArtistsAreas, getAreaScrobbleCount} from '../area';

const dreamTheater = {
  name: 'Dream Theater',
  playcount: 755,
  area: 'United States',
};

const queen = {
  name: 'Queen',
  playcount: 738,
  area: 'United Kingdom',
};

const rammstein = {
  name: 'Rammstein',
  playcount: 693,
  area: 'Germany',
};

const darkTranquillity = {
  name: 'Dark Tranquillity',
  playcount: 626,
  area: 'Sweden',
};

const inFlames = {
  name: 'In Flames',
  playcount: 626,
  area: 'Sweden',
};

const opeth = {
  name: 'Opeth',
  playcount: 583,
  area: 'Sweden',
};

const him = {
  name: 'Him',
  playcount: 572,
  area: 'Finland',
};

const korn = {
  name: 'Korn',
  playcount: 474,
  area: 'United States',
};

const nightwish = {
  name: 'Nightwish',
  playcount: 461,
  area: 'Finland',
};

const deftones = {
  name: 'Deftones',
  playcount: 450,
  area: 'United States',
};

describe('area utils', () => {
  test('groupArtistsByArea()', () => {
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

    expect(groupArtistsByArea(artists)).toEqual({
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

  test('getArtistsAreas()', () => {
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

    expect(getArtistsAreas(artists, worldData)).toMatchObject([
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

  test('getAreaScrobbleCount()', () => {
    expect(getAreaScrobbleCount({
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

    expect(getAreaScrobbleCount({
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
