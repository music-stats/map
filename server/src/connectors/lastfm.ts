import * as querystring from 'querystring';
import {times, take} from 'ramda';
import axios, {AxiosResponse} from 'axios';
import * as dotenv from 'dotenv';

import {LibraryResponseData, Artist} from 'src/types/lastfm';
import config from 'src/config';
import {retrieveResponseDataCache, storeResponseDataCache} from 'src/utils/cache';

const {parsed: {LASTFM_API_KEY}} = dotenv.config();

export function buildApiUrl(method: string, params = {}): string {
  const defaultParams = {
    method,
    api_key: LASTFM_API_KEY,
    format: 'json',
  };

  return `${config.lastfm.api.root}?${querystring.stringify({
    ...defaultParams,
    ...params,
  })}`;
}

function fetchPage(username: string, pageNumber: number): Promise<LibraryResponseData> {
  const url = buildApiUrl('library.getartists', {
    user: username,
    page: pageNumber + 1, // bounds: 1-1000000
  });
  const headers = {
    'User-Agent': config.userAgent,
  };

  console.log(url);

  function retrieveLastfmLibraryCache(): Promise<LibraryResponseData> {
    return retrieveResponseDataCache<LibraryResponseData>(
      url,
      config.lastfm.cache,
    );
  }

  function storeLastfmLibraryCache(response: AxiosResponse): Promise<LibraryResponseData> {
    return storeResponseDataCache<LibraryResponseData>(
      url,
      response.data,
      config.lastfm.cache,
    );
  }

  return new Promise((resolve, reject) => {
    retrieveLastfmLibraryCache()
      .then((libraryCache) => {
        if (libraryCache) {
          resolve(libraryCache);
          return;
        }

        axios.get(url, {headers})
          .then(storeLastfmLibraryCache)
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  });
}

function concatPages(pagesData: LibraryResponseData[]): Artist[] {
  return pagesData.reduce(
    (rawArtists: Artist[], pageData) => rawArtists.concat(pageData.artists.artist),
    [],
  );
}

export function fetchLibraryArtists(username: string, artistsCount: number): Promise<Artist[]> {
  const pagesCount = Math.min(
    Math.ceil(artistsCount / config.lastfm.artists.perPage),
    config.lastfm.artists.maxPageNumber,
  );

  const fetchAllPages = times((pageNumber) => fetchPage(username, pageNumber), pagesCount);
  const cutExtraArtists = (rawArtists: Artist[]) => take(artistsCount, rawArtists);

  console.log('pages:', pagesCount);

  // @todo: set delays (or use a generic queue) instead of firing simultaneous requests
  return Promise.all(fetchAllPages)
    .then(concatPages)
    .then(cutExtraArtists);
}
