import * as fs from 'fs';
import * as path from 'path';

import {ConnectorCacheConfig} from 'src/types/config';
import log from 'src/utils/log';

function constructCacheFilePath(dir: string, url: string, format: string = 'json'): string {
  return path.resolve(dir, `${encodeURIComponent(url)}.${format}`);
}

export function retrieveResponseDataCache<ResponseData>(
  url: string,
  connectorCacheConfig: ConnectorCacheConfig,
): Promise<ResponseData> {
  const filePath = constructCacheFilePath(connectorCacheConfig.dir, url);

  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          log(`
            response is not cached, file not found:
            - file: ${filePath}
          `);
          resolve(null);
          return;
        }

        reject(err);
        return;
      }

      // console.log(stats);

      if (Date.now() - stats.mtimeMs > connectorCacheConfig.ttl) {
        log(`
          response cache is outdated:
          - file: ${filePath}
          - mtime: ${stats.mtime}
          - ttl: ${connectorCacheConfig.ttl}ms
        `);
        resolve(null);
        return;
      }

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        log(`
          response cache is valid:
          - file: ${filePath}
        `);
        resolve(JSON.parse(data));
      });
    });
  });
}

export function storeResponseDataCache<ResponseData>(
  url: string,
  responseData: ResponseData,
  connectorCacheConfig: ConnectorCacheConfig,
): Promise<string> {
  const filePath = constructCacheFilePath(connectorCacheConfig.dir, url);
  const responseDataSerialized = JSON.stringify(responseData, null, 2);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, responseDataSerialized, (err) => {
      if (err) {
        reject(err);
        return;
      }

      log(`
        response cache is stored:
        - file: ${filePath}
      `);
      resolve(filePath);
    });
  });
}
