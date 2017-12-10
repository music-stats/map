const fs = require('fs');
const {pick} = require('ramda');

const {fetchLibraryArtists} = require('../utils/lastfm');
const config = require('../config');

const {username, outputFilePath} = config.lastfm;
const artistFields = [
  'name',
  'playcount',
  'mbid', // musicbrainz id
];

fetchLibraryArtists(username)
  .then((data) => data.artists.artist)
  .then((rawArtists) => rawArtists.map((artist) => pick(artistFields, artist)))
  .then((artists) => artists.map((artist) => ({
    ...artist,
    playcount: Number(artist.playcount),
    mbid: artist.mbid || null,
  })))
  .then((artists) => {
    console.log(artists);

    fs.writeFileSync(
      outputFilePath,
      JSON.stringify(artists, null, 2),
    );
  })
  .catch(console.error);
