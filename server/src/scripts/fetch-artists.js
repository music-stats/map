const {pick} = require('ramda');

const {fetchLibraryArtists} = require('../utils/lastfm');
const config = require('../config');

const {username} = config.lastfm;
const artistFields = [
  'name',
  'playcount',
  'mbid', // musicbrainz id
];

fetchLibraryArtists(username)
  .then((data) => data.artists.artist)
  .then((rawArtists) => rawArtists.map((artist) => pick(artistFields, artist)))
  .then((artists) => console.log(artists))
  .catch(console.error);
