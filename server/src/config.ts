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
      maxPageNumber: 30, // @see: https://www.last.fm/api/tos
      perPage: 50,
      countDefault: 50,
    },
    outputFilePath: path.resolve(tmpDir, '1-lastfm-user-library.json'),
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
    outputFilePath: path.resolve(tmpDir, '2-musicbrainz-artists-areas.json'),
    cache: {
      ttl: 365 * 24 * 60 * 60 * 1000,
      dir: path.resolve(cacheDir, 'musicbrainz/'),
    },
  },

  mergedArtists: {
    correctionFilePaths: {
      artist: path.resolve(dataDir, '1-artist-correction.json'),
      artistArea: path.resolve(dataDir, '2-artist-area-correction.json'),
      area: path.resolve(dataDir, '3-area-correction.json'),
    },
    outputFilePath: path.resolve(tmpDir, '3-merged-artists.json'),
  },
};

export default config;
