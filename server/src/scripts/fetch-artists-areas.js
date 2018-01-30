const fs = require('fs');
const {take} = require('ramda');

const {readFile, delay} = require('../utils/promise');
const {fetchArtist} = require('../utils/musicbrainz');
const config = require('../config');

const argv = process.argv.slice(2);
const artistsCount = parseInt(argv[0], 10) || config.musicbrainz.artists.countDefault;

if (artistsCount <= 0) {
  throw new Error(`Expected a number of artists greater then 0, got ${artistsCount}`);
}

function convert(musicbrainzArtist) {
  return {
    artist: musicbrainzArtist.name,
    area: musicbrainzArtist.area.name,
  };
}

function extract(count) {
  return readFile(config.lastfm.outputFilePath)
    .then((data) => JSON.parse(data))
    .then((lastfmArtists) => take(count, lastfmArtists))
    .then((lastfmArtists) => lastfmArtists.map((lastfmArtist) => lastfmArtist.mbid))
    .then((mbids) => mbids.filter((mbid) => Boolean(mbid)))
    .then((mbids) => {
      console.log(`fetching ${mbids.length} artists from musicbrainz...`);
      return mbids;
    })
    .then((mbids) => Promise.all(mbids.map((mbid, index) => delay(
      fetchArtist,
      index * config.musicbrainz.api.requestFrequency,
      mbid,
    ))));
}

function transform(musicbrainzArtists) {
  return musicbrainzArtists.map(convert);
}

function load(artistsAreas) {
  console.log(artistsAreas, artistsAreas.length);

  fs.writeFileSync(
    config.musicbrainz.outputFilePath,
    JSON.stringify(artistsAreas, null, 2),
  );
}

extract(artistsCount)
  .then(transform)
  .then(load)
  .catch(console.error);
