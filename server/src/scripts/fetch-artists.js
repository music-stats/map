const fs = require('fs');
const {pick} = require('ramda');

const {fetchLibraryArtists} = require('../utils/lastfm');
const config = require('../config');

const argv = process.argv.slice(2);
const artistsCount = parseInt(argv[0], 10) || config.lastfm.artists.countDefault;

if (artistsCount <= 0) {
  throw new Error(`Expected a number of artists greater then 0, got ${artistsCount}`);
}

function convert(rawArtist) {
  const artist = pick([
    'name',
    'playcount',
    'mbid', // musicbrainz id
  ], rawArtist);

  return {
    ...artist,
    playcount: Number(artist.playcount),
    mbid: artist.mbid || null,
  };
}

function extract(count) {
  console.log(`fetching ${count} artists from last.fm...`);
  return fetchLibraryArtists(config.lastfm.username, count);
}

function transform(rawArtists) {
  return rawArtists.map(convert);
}

function load(artists) {
  console.log(artists, artists.length);

  fs.writeFileSync(
    config.lastfm.outputFilePath,
    JSON.stringify(artists, null, 2),
  );
}

extract(artistsCount)
  .then(transform)
  .then(load)
  .catch(console.error);
