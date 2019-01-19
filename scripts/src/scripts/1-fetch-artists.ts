import {Artist as LastfmArtist} from 'src/types/lastfm';
import {Artist} from 'src/types/artist';

import config from 'src/config';
import {writeFile} from 'src/utils/file';
import {proxyLogLength} from 'src/utils/log';
import {fetchLibraryArtists} from 'src/connectors/lastfm';

const argv = process.argv.slice(2);
const artistsCount = parseInt(argv[0], 10) || config.lastfm.artists.countDefault;
const toBypassCache = argv.includes('--no-cache');

if (artistsCount <= 0) {
  throw new Error(`Expected a number of artists greater then 0, got ${artistsCount}`);
}

function extract(): Promise<LastfmArtist[]> {
  console.log(`fetching ${artistsCount} artists from last.fm...`);
  return fetchLibraryArtists(config.lastfm.username, artistsCount, toBypassCache);
}

function transform(rawArtistList: LastfmArtist[]): Artist[] {
  return rawArtistList.map(convert);
}

function convert({name, playcount, mbid}: LastfmArtist): Artist {
  return {
    name,
    playcount: Number(playcount),
    mbid: mbid || null,
  };
}

function load(artistList: Artist[]): Promise<Artist[]> {
  return writeFile(config.lastfm.outputFilePath, artistList);
}

extract()
  .then(transform)
  .then(load)
  .then(proxyLogLength)
  .catch(console.error);
