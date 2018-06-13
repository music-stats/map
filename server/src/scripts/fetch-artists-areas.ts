import {take, pluck} from 'ramda';

import {Artist as LastfmArtist} from 'src/types/lastfm';
import {Artist as MusicbrainzArtist} from 'src/types/musicbrainz';
import {ArtistArea} from 'src/types/artist';

import config from 'src/config';
import {readFile, writeFile, sequence} from 'src/utils/promise';
import {proxyLog} from 'src/utils/log';
import {fetchArtist} from 'src/connectors/musicbrainz';

const argv = process.argv.slice(2);
const artistsCount = parseInt(argv[0], 10) || config.musicbrainz.artists.countDefault;
const toBypassCache = argv.includes('--no-cache');

if (artistsCount <= 0) {
  throw new Error(`Expected a number of artists greater then 0, got ${artistsCount}`);
}

function proxyLogMbids(mbids: string[]): string[] {
  console.log(`fetching ${mbids.length} artists from MusicBrainz...`);
  return mbids;
}

function extract(): Promise<MusicbrainzArtist[]> {
  return readFile<LastfmArtist[]>(config.lastfm.outputFilePath)
    .then(take(artistsCount))
    .then(pluck('mbid'))
    .then((mbids) => mbids.filter((mbid) => Boolean(mbid))) // "mbid" is missing for some artists
    .then(proxyLogMbids)
    .then((mbids) => sequence(mbids.map((mbid, index) => fetchArtist.bind(
      null,
      mbid,
      index,
      mbids.length,
      toBypassCache,
    ))));
}

function transform(musicbrainzArtistList: MusicbrainzArtist[]): ArtistArea[] {
  return musicbrainzArtistList.map(convert);
}

function convert({name, area}: MusicbrainzArtist): ArtistArea {
  return {
    artist: name,
    area: area
      ? area.name
      : null,
  };
}

function load(artistAreaList: ArtistArea[]): Promise<ArtistArea[]> {
  return writeFile(config.musicbrainz.outputFilePath, artistAreaList);
}

extract()
  .then(transform)
  .then(load)
  .then(proxyLog)
  .catch(console.error);
