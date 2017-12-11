const fs = require('fs');
const {take} = require('ramda');

const {fetchArtist} = require('../utils/musicbrainz');
const config = require('../config');

const {lastfm: {outputFilePath: inputFilePath}, musicbrainz: {outputFilePath}} = config;

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

function delay(promise, wait, ...args) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      promise(...args)
        .then(resolve)
        .catch(reject);
    }, wait);
  });
}

readFile(inputFilePath)
  .then((data) => JSON.parse(data))
  .then((lastfmArtists) => take(8, lastfmArtists))
  .then((lastfmArtists) => lastfmArtists.map((lastfmArtist) => lastfmArtist.mbid))
  .then((mbids) => mbids.filter((mbid) => Boolean(mbid)))
  .then((mbids) => Promise.all(mbids.map((mbid, index) => delay(
    fetchArtist,
    index * config.musicbrainz.api.requestFrequency,
    mbid,
  ))))
  .then((musicbrainzArtists) => musicbrainzArtists.map((musicbrainzArtist) => ({
    artist: musicbrainzArtist.name,
    area: musicbrainzArtist.area.name,
  })))
  .then((artistsAreas) => {
    console.log(artistsAreas);

    fs.writeFileSync(
      outputFilePath,
      JSON.stringify(artistsAreas, null, 2),
    );
  })
  .catch(console.error);
