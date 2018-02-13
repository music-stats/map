import {Artist, ArtistArea, MergedArtist} from 'src/types/artist';

import config from 'src/config';
import {readFile, writeFile} from 'src/utils/promise';
import {proxyLog} from 'src/utils/log';

interface InputLists {
  artistList: Artist[];
  artistAreaList: ArtistArea[];
}

function extract(): Promise<InputLists> {
  const inputFilePathList = [
    config.lastfm.outputFilePath,
    config.musicbrainz.outputFilePath,
  ];

  return Promise.all(inputFilePathList.map((inputFilePath) => readFile(inputFilePath)))
    .then(([artistList, artistAreaList]: [Artist[], ArtistArea[]]) => ({
      artistList,
      artistAreaList,
    }));
}

interface ArtistAreaLookup {
  [artist: string]: string;
}

function makeArtistAreaLookup(artistAreaList: ArtistArea[]): ArtistAreaLookup {
  const lookup: ArtistAreaLookup = {};
  artistAreaList.forEach(({artist, area}) => lookup[artist] = area);

  return lookup;
}

function transform({artistList, artistAreaList}: InputLists): MergedArtist[] {
  const artistAreaLookup = makeArtistAreaLookup(artistAreaList);

  return artistList.map(({name, playcount}) => ({
    name,
    playcount,
    area: artistAreaLookup[name] || null,
  }));
}

function load(mergedArtistList: MergedArtist[]): Promise<MergedArtist[]> {
  return writeFile(config.mergedArtists.outputFilePath, mergedArtistList);
}

extract()
  .then(transform)
  .then(load)
  .then(proxyLog)
  .catch(console.error);
