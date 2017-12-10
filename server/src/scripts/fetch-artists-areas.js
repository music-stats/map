const fs = require('fs');

const {fetchArtist} = require('../utils/musicbrainz');
const config = require('../config');

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

readFile(config.lastfm.outputFilePath)
  .then((data) => JSON.parse(data))
  .then((lastfmArtists) => lastfmArtists.map((lastfmArtist) => lastfmArtist.mbid))
  .then((mbids) => mbids.filter((mbid) => Boolean(mbid)))
  .then((mbids) => fetchArtist(mbids[0]))
  .then((musicbrainzArtist) => ({
    artist: musicbrainzArtist.name,
    area: musicbrainzArtist.area.name,
  }))
  .then(console.log)
  .catch(console.error);

// @todo: fetch areas for all artists, not just for a single one
