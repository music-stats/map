const querystring = require('querystring');
const axios = require('axios');

const config = require('../config');

require('dotenv').config();

function buildApiUrl(method, params = {}) {
  const {LASTFM_API_KEY} = process.env;
  const {api} = config.lastfm;
  const defaultParams = {
    api_key: LASTFM_API_KEY,
    format: 'json',
  };

  return `${api.root}?${querystring.stringify({
    method,
    ...defaultParams,
    ...params,
  })}`;
}

function fetchLibraryArtists(username) {
  const url = buildApiUrl('library.getartists', {
    user: username,
  });

  return new Promise((resolve, reject) => {
    axios.get(url)
      .then((response) => {
        resolve(response.data);
      })
      .catch(reject);
  });
}

module.exports = {
  buildApiUrl,
  fetchLibraryArtists,
};
