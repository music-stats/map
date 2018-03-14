import * as path from 'path';

import Config from 'src/types/config';

const rootDir = path.resolve(__dirname, '../../');
const dataDir = path.resolve(rootDir, 'data/');
const tmpDir = path.resolve(rootDir, 'tmp/');
const cacheDir = path.resolve(rootDir, 'cache/');

const config: Config = {
  userAgent: 'music-stats/0.0.0 (https://github.com/oleksmarkh/music-stats)',

  lastfm: {
    api: {
      root: 'https://ws.audioscrobbler.com/2.0',
    },
    username: 'markhovskiy',
    artists: {
      maxPageNumber: 10, // @see: https://www.last.fm/api/tos
      perPage: 50,
      countDefault: 50,
    },
    outputFilePath: path.resolve(tmpDir, 'lastfm-user-library.json'),
    cache: {
      ttl: 60 * 60 * 1000,
      dir: path.resolve(cacheDir, 'lastfm/'),
    },
  },

  musicbrainz: {
    api: {
      root: 'https://musicbrainz.org/ws/2',
      requestFrequency: 1000, // @see: https://wiki.musicbrainz.org/XML_Web_Service/Rate_Limiting
    },
    artists: {
      countDefault: 10,
    },
    outputFilePath: path.resolve(tmpDir, 'musicbrainz-artists-areas.json'),
    cache: {
      ttl: 30 * 24 * 60 * 60 * 1000,
      dir: path.resolve(cacheDir, 'musicbrainz/'),
    },
  },

  mergedArtists: {
    correctionFilePaths: {
      area: path.resolve(dataDir, 'area-correction.json'),
      artistArea: path.resolve(dataDir, 'artist-area-correction.json'),
    },
    outputFilePath: path.resolve(tmpDir, 'merged-artists.json'),
  },
};

export default config;
