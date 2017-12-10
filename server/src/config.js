const path = require('path');

const tmpDir = path.resolve(__dirname, '../tmp/');

const config = {
  userAgent: 'music-stats/0.0.0 (https://github.com/oleksmarkh/music-stats)',

  lastfm: {
    api: {
      root: 'https://ws.audioscrobbler.com/2.0',
    },
    username: 'markhovskiy',
    outputFilePath: path.resolve(tmpDir, 'lastfm-user-library.json'),
  },

  musicbrainz: {
    api: {
      root: 'https://musicbrainz.org/ws/2',
    },
  },
};

module.exports = config;
