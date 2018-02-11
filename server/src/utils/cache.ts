import * as fs from 'fs';
import * as path from 'path';

import {LibraryResponse} from 'src/types/lastfm';
import config from 'src/config';

function getFilePath(dir: string, url: string, format: string = 'json'): string {
  return path.resolve(dir, `${encodeURIComponent(url)}.${format}`);
}

export function getResponseDataCache(dir: string, url: string): Promise<LibraryResponse> {
  const filePath = getFilePath(dir, url);

  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log(`response is not cached, file not found: ${filePath}`);
          resolve(null);
          return;
        }

        reject(err);
        return;
      }

      console.log(stats);

      if (Date.now() - stats.mtimeMs > config.lastfm.cache.ttl) {
        console.log(`response cache is outdated, mtime: ${stats.mtime}, ttl: ${config.lastfm.cache.ttl}ms`);
        resolve(null);
        return;
      }

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        console.log('response cache is valid');
        resolve(JSON.parse(data));
      });
    });
  });
}

export function cacheResponseData(dir: string, url: string, responseData: LibraryResponse): Promise<LibraryResponse> {
  const filePath = getFilePath(dir, url);
  const responseDataSerialized = JSON.stringify(responseData, null, 2);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, responseDataSerialized, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(responseData);
    });
  });
}
