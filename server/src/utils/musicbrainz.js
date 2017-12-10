const querystring = require('querystring');
const axios = require('axios');

const config = require('../config');

const {api} = config.musicbrainz;

function buildApiLookupUrl(entity, mbid) {
  const queryParamsString = querystring.stringify({
    fmt: 'json',
  });

  return `${api.root}/${entity}/${mbid}?${queryParamsString}`;
}

function fetchArtist(mbid) {
  const url = buildApiLookupUrl('artist', mbid);
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

module.exports = {
  buildApiLookupUrl,
  fetchArtist,
};
