import {Artist, ArtistArea, MergedArtist} from 'src/types/artist';

import config from 'src/config';
import {readFile, writeFile} from 'src/utils/promise';
import {proxyLog} from 'src/utils/log';
import {loadCorrections, merge} from 'src/utils/merge';

interface InputLists {
  artistList: Artist[];
  artistAreaList: ArtistArea[];
}

function extract(): Promise<InputLists> {
  return Promise.all([
    config.lastfm.outputFilePath,
    config.musicbrainz.outputFilePath,
  ].map(readFile))
    .then(([artistList, artistAreaList]: [Artist[], ArtistArea[]]) => ({
      artistList,
      artistAreaList,
    }));
}

function transform({artistList, artistAreaList}: InputLists): Promise<MergedArtist[]> {
  return loadCorrections()
    .then((corrections) => merge(artistList, artistAreaList, corrections));
}

function load(mergedArtistList: MergedArtist[]): Promise<MergedArtist[]> {
  return writeFile(config.mergedArtists.outputFilePath, mergedArtistList);
}

extract()
  .then(transform)
  .then(load)
  .then(proxyLog)
  .catch(console.error);
