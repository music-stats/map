interface ConnectorApiConfig {
  root: string;
  requestFrequency?: number;
}

export interface ConnectorCacheConfig {
  ttl: number; // ms
  dir: string;
}

interface ConnectorConfig {
  api: ConnectorApiConfig;
  outputFilePath: string;
  cache: ConnectorCacheConfig;
}

interface LastfmConfig extends ConnectorConfig {
  username: string;
  artists: {
    maxPageNumber: number;
    perPage: number;
    countDefault: number;
  };
}

interface MusicbrainzConfig extends ConnectorConfig {
  artists: {
    countDefault: number;
  };
}

export enum CorrectionDataType {
  JsonFile = 'JsonFile',
  TxtFolder = 'TxtFolder',
}

export interface Correction {
  dataType: CorrectionDataType;
  filePath: string;
}

interface MergedArtistsConfig {
  corrections: {
    artistName: Correction;
    artistArea: Correction;
    area: Correction;
  };
  outputFilePath: string;
}

interface Config {
  userAgent: string;
  lastfm: LastfmConfig;
  musicbrainz: MusicbrainzConfig;
  mergedArtists: MergedArtistsConfig;
}

export default Config;
