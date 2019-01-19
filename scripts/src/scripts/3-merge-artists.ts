import {Artist, ArtistArea, MergedArtist} from 'src/types/artist';

import config from 'src/config';
import {readJsonFile, writeFile} from 'src/utils/file';
import {proxyLogLength} from 'src/utils/log';
import {loadAllCorrections, merge} from 'src/utils/merge';

interface InputLists {
  artistList: Artist[];
  artistAreaList: ArtistArea[];
}

function extract(): Promise<InputLists> {
  return Promise.all([
    config.lastfm.outputFilePath,
    config.musicbrainz.outputFilePath,
  ].map(readJsonFile))
    .then(([artistList, artistAreaList]: [Artist[], ArtistArea[]]) => ({
      artistList,
      artistAreaList,
    }));
}

function transform({artistList, artistAreaList}: InputLists): Promise<MergedArtist[]> {
  return loadAllCorrections()
    .then((corrections) => merge(artistList, artistAreaList, corrections));
}

function load(mergedArtistList: MergedArtist[]): Promise<MergedArtist[]> {
  return writeFile(config.mergedArtists.outputFilePath, mergedArtistList);
}

extract()
  .then(transform)
  .then(load)
  .then(proxyLogLength)
  .catch(console.error);
