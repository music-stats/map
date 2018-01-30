const querystring = require('querystring');
const axios = require('axios');
const {times, take} = require('ramda');
const dotenv = require('dotenv');

const config = require('../config');

const {parsed: {LASTFM_API_KEY}} = dotenv.config();

function buildApiUrl(method, params = {}) {
  const queryParamsString = querystring.stringify({
    method,
    api_key: LASTFM_API_KEY,
    format: 'json',
    ...params,
  });

  return `${config.lastfm.api.root}?${queryParamsString}`;
}

function fetchPage(username, pageNumber) {
  const url = buildApiUrl('library.getartists', {
    user: username,
    page: pageNumber + 1, // bounds: 1-1000000
  });
  const headers = {
    'User-Agent': config.userAgent,
  };

  console.log(url);

  return new Promise((resolve, reject) => {
    axios.get(url, {headers})
      .then((response) => {
        resolve(response.data);
      })
      .catch(reject);
  });
}

function fetchLibraryArtists(username, artistsCount) {
  const pagesCount = Math.min(
    Math.ceil(artistsCount / config.lastfm.artists.perPage),
    config.lastfm.artists.maxPageNumber,
  );

  console.log('pages:', pagesCount);

  // this fires simultaneous requests
  // @todo: set delays or use a generic queue
  return Promise.all(times((pageNumber) => fetchPage(username, pageNumber), pagesCount))
    .then((pagesData) => pagesData.reduce((rawArtists, pageData) => (
      rawArtists.concat(pageData.artists.artist)
    ), []))
    .then((rawArtists) => take(artistsCount, rawArtists));
}

module.exports = {
  buildApiUrl,
  fetchLibraryArtists,
};
