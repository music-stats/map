import * as path from 'path';

const tmpDir = path.resolve(__dirname, '../../tmp/');

const config = {
  userAgent: 'music-stats/0.0.0 (https://github.com/oleksmarkh/music-stats)',

  lastfm: {
    api: {
      root: 'https://ws.audioscrobbler.com/2.0',
    },
    username: 'markhovskiy',
    artists: {
      maxPageNumber: 5, // @see: https://www.last.fm/api/tos
      perPage: 50,
      countDefault: 50,
    },
    outputFilePath: path.resolve(tmpDir, 'lastfm-user-library.json'),
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
  },
};

export default config;
