import * as fs from 'fs';
import {take} from 'ramda';

import {Artist as LastfmArtist} from 'src/types/lastfm';
import {Artist as MusicbrainzArtist} from 'src/types/musicbrainz';
import {ArtistArea} from 'src/types/artist';

import config from 'src/config';
import {readFile, sequence} from 'src/utils/promise';
import {fetchArtist} from 'src/connectors/musicbrainz';

const argv = process.argv.slice(2);
const artistsCount = parseInt(argv[0], 10) || config.musicbrainz.artists.countDefault;
const toBypassCache = argv.includes('--no-cache');

if (artistsCount <= 0) {
  throw new Error(`Expected a number of artists greater then 0, got ${artistsCount}`);
}

function extract(): Promise<MusicbrainzArtist[]> {
  return readFile(config.lastfm.outputFilePath)
    .then((data) => JSON.parse(data))
    .then((lastfmArtists: LastfmArtist[]) => take(artistsCount, lastfmArtists))
    .then((lastfmArtists) => lastfmArtists.map((lastfmArtist) => lastfmArtist.mbid))
    .then((mbids) => mbids.filter((mbid) => Boolean(mbid)))
    .then((mbids) => {
      console.log(`fetching ${mbids.length} artists from MusicBrainz...`);
      return mbids;
    })
    .then((mbids) => sequence(mbids.map((mbid) => fetchArtist.bind(null, mbid, toBypassCache))));
}

function transform(musicbrainzArtists: MusicbrainzArtist[]): ArtistArea[] {
  return musicbrainzArtists.map(convert);
}

function convert(musicbrainzArtist: MusicbrainzArtist): ArtistArea {
  return {
    artist: musicbrainzArtist.name,
    area: musicbrainzArtist.area
      ? musicbrainzArtist.area.name
      : null,
  };
}

function load(artistsAreas: ArtistArea[]) {
  console.log(artistsAreas, artistsAreas.length);

  fs.writeFileSync(
    config.musicbrainz.outputFilePath,
    JSON.stringify(artistsAreas, null, 2),
  );
}

extract()
  .then(transform)
  .then(load)
  .catch(console.error);
