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

interface MergedArtistsConfig {
  outputFilePath: string;
}

interface Config {
  userAgent: string;
  lastfm: LastfmConfig;
  musicbrainz: MusicbrainzConfig;
  mergedArtists: MergedArtistsConfig;
}

export default Config;
