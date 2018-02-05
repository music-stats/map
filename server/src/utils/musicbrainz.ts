import * as querystring from 'querystring';
import axios from 'axios';

import {Artist} from 'src/types/musicbrainz';
import config from 'src/config';

export function buildApiLookupUrl(entity: string, mbid: string): string {
  const params = {
    fmt: 'json',
  };

  return `${config.musicbrainz.api.root}/${entity}/${mbid}?${querystring.stringify(params)}`;
}

export function fetchArtist(mbid: string): Promise<Artist> {
  const url = buildApiLookupUrl('artist', mbid);
  const headers = {
    'User-Agent': config.userAgent,
  };

  console.log(url);

  return new Promise((resolve, reject) => {
    axios.get(url, {headers})
      .then((response) => resolve(response.data))
      .catch(reject);
  });
}
