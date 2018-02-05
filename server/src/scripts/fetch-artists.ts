import * as fs from 'fs';

import {Artist as LastfmArtist} from 'src/types/lastfm';
import {Artist} from 'src/types/artist';

import config from 'src/config';
import {fetchLibraryArtists} from 'src/connectors/lastfm';

const argv = process.argv.slice(2);
const artistsCount = parseInt(argv[0], 10) || config.lastfm.artists.countDefault;

if (artistsCount <= 0) {
  throw new Error(`Expected a number of artists greater then 0, got ${artistsCount}`);
}

function extract(count: number): Promise<LastfmArtist[]> {
  console.log(`fetching ${count} artists from last.fm...`);
  return fetchLibraryArtists(config.lastfm.username, count);
}

function transform(rawArtists: LastfmArtist[]): Artist[] {
  return rawArtists.map(convert);
}

function convert(rawArtist: LastfmArtist): Artist {
  return {
    name: rawArtist.name,
    playcount: Number(rawArtist.playcount),
    mbid: rawArtist.mbid || null,
  };
}

function load(artists: Artist[]) {
  console.log(artists, artists.length);

  fs.writeFileSync(
    config.lastfm.outputFilePath,
    JSON.stringify(artists, null, 2),
  );
}

extract(artistsCount)
  .then(transform)
  .then(load)
  .catch(console.error);
