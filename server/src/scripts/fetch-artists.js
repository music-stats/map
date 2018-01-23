const fs = require('fs');
const {pick} = require('ramda');

const {fetchLibraryArtists} = require('../utils/lastfm');
const config = require('../config');

const argv = process.argv.slice(2);

const artistsCount = parseInt(argv[0], 10) || config.lastfm.artists.countDefault;
const artistFields = [
  'name',
  'playcount',
  'mbid', // musicbrainz id
];

if (artistsCount <= 0) {
  throw new Error(`Expected a number of artists greater then 0, got ${artistsCount}`);
}

fetchLibraryArtists(config.lastfm.username, artistsCount)
  .then((rawArtists) => rawArtists.map((artist) => pick(artistFields, artist)))
  .then((artists) => artists.map((artist) => ({
    ...artist,
    playcount: Number(artist.playcount),
    mbid: artist.mbid || null,
  })))
  .then((artists) => {
    console.log(artists, artists.length);

    fs.writeFileSync(
      config.lastfm.outputFilePath,
      JSON.stringify(artists, null, 2),
    );
  })
  .catch(console.error);
