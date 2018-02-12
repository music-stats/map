import * as querystring from 'querystring';
import axios, {AxiosResponse} from 'axios';

import {Artist} from 'src/types/musicbrainz';

import config from 'src/config';
import {delay} from 'src/utils/promise';
import {logRequest} from 'src/utils/log';
import {retrieveResponseDataCache, storeResponseDataCache} from 'src/utils/cache';

type ArtistResponse = AxiosResponse<Artist>;

export function buildApiLookupUrl(entity: string, mbid: string): string {
  const params = {
    fmt: 'json',
  };

  return `${config.musicbrainz.api.root}/${entity}/${mbid}?${querystring.stringify(params)}`;
}

export function fetchArtist(mbid: string, toBypassCache: boolean): Promise<Artist> {
  const url = buildApiLookupUrl('artist', mbid);
  const headers = {
    'User-Agent': config.userAgent,
  };

  function requestMusicbrainzArtist(): Promise<ArtistResponse> {
    logRequest(url);
    return axios.get(url, {headers});
  }

  function retrieveMusicbrainzArtistCache(): Promise<Artist> {
    return retrieveResponseDataCache<Artist>(url, config.musicbrainz.cache);
  }

  function storeMusicbrainzArtistCache(response: ArtistResponse): Promise<ArtistResponse> {
    return storeResponseDataCache<Artist>(url, response.data, config.musicbrainz.cache)
      .then(() => response);
  }

  if (toBypassCache) {
    return requestMusicbrainzArtist()
      .then((response) => response.data);
  }

  return retrieveMusicbrainzArtistCache()
    .then((artistCache) => {
      if (artistCache) {
        return artistCache;
      }

      return delay(requestMusicbrainzArtist, config.musicbrainz.api.requestFrequency)
        .then(storeMusicbrainzArtistCache)
        .then((response) => response.data);
    });
}
