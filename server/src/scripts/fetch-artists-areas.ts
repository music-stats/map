import * as fs from 'fs';
import {take} from 'ramda';

import {Artist as LastfmArtist} from 'src/types/lastfm';
import {Artist as MusicbrainzArtist} from 'src/types/musicbrainz';
import {ArtistArea} from 'src/types/artist';

import {readFile, delay} from 'src/utils/promise';
import {fetchArtist} from 'src/utils/musicbrainz';
import config from 'src/config';

const argv = process.argv.slice(2);
const artistsCount = parseInt(argv[0], 10) || config.musicbrainz.artists.countDefault;

if (artistsCount <= 0) {
  throw new Error(`Expected a number of artists greater then 0, got ${artistsCount}`);
}

function extract(count: number): Promise<MusicbrainzArtist[]> {
  return readFile(config.lastfm.outputFilePath)
    .then((data) => JSON.parse(data))
    .then((lastfmArtists: LastfmArtist[]) => take(count, lastfmArtists))
    .then((lastfmArtists) => lastfmArtists.map((lastfmArtist) => lastfmArtist.mbid))
    .then((mbids) => mbids.filter((mbid) => Boolean(mbid)))
    .then((mbids) => {
      console.log(`fetching ${mbids.length} artists from musicbrainz...`);
      return mbids;
    })
    .then((mbids) => Promise.all(mbids.map((mbid, index) => delay(
      fetchArtist,
      index * config.musicbrainz.api.requestFrequency,
      mbid,
    ))));
}

function transform(musicbrainzArtists: MusicbrainzArtist[]): ArtistArea[] {
  return musicbrainzArtists.map(convert);
}

function convert(musicbrainzArtist: MusicbrainzArtist): ArtistArea {
  return {
    artist: musicbrainzArtist.name,
    area: musicbrainzArtist.area.name,
  };
}

function load(artistsAreas: ArtistArea[]) {
  console.log(artistsAreas, artistsAreas.length);

  fs.writeFileSync(
    config.musicbrainz.outputFilePath,
    JSON.stringify(artistsAreas, null, 2),
  );
}

extract(artistsCount)
  .then(transform)
  .then(load)
  .catch(console.error);
