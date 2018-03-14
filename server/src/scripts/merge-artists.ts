import {Artist, ArtistArea, MergedArtist} from 'src/types/artist';

import config from 'src/config';
import {readFile, writeFile} from 'src/utils/promise';
import {warn, proxyLog} from 'src/utils/log';

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

interface ArtistAreaLookup {
  [artist: string]: string;
}

function makeArtistAreaLookup(artistAreaList: ArtistArea[]): ArtistAreaLookup {
  const lookup: ArtistAreaLookup = {};
  artistAreaList.forEach(({artist, area}) => lookup[artist] = area);

  return lookup;
}

interface AreaCorrection {
  [city: string]: string;
}

interface ArtistAreaCorrection {
  [artist: string]: string;
}

interface Corrections {
  areaCorrection: AreaCorrection;
  artistAreaCorrection: ArtistAreaCorrection;
}

function loadCorrections(): Promise<Corrections> {
  return Promise.all([
    config.mergedArtists.correctionFilePaths.area,
    config.mergedArtists.correctionFilePaths.artistArea,
  ].map(readFile))
    .then(([areaCorrection, artistAreaCorrection]: [AreaCorrection, ArtistAreaCorrection]) => ({
      areaCorrection,
      artistAreaCorrection,
    }));
}

function getArtistArea(
  artist: string,
  artistAreaLookup: ArtistAreaLookup,
  areaCorrection: AreaCorrection,
  artistAreaCorrection: ArtistAreaCorrection,
): string {
  const correctArtistArea = artistAreaCorrection[artist];

  if (correctArtistArea) {
    return correctArtistArea;
  }

  const area = artistAreaLookup[artist];
  const correctArea = areaCorrection[area];

  if (correctArea) {
    return correctArea;
  }

  if (area) {
    return area;
  }

  warn(`area not found: ${artist}`);

  return null;
}

function transform({artistList, artistAreaList}: InputLists): Promise<MergedArtist[]> {
  const artistAreaLookup = makeArtistAreaLookup(artistAreaList);

  return loadCorrections()
    .then(({areaCorrection, artistAreaCorrection}) => artistList.map(({name, playcount}) => ({
      name,
      playcount,
      area: getArtistArea(name, artistAreaLookup, areaCorrection, artistAreaCorrection),
    })));
}

function load(mergedArtistList: MergedArtist[]): Promise<MergedArtist[]> {
  return writeFile(config.mergedArtists.outputFilePath, mergedArtistList);
}

extract()
  .then(transform)
  .then(load)
  .then(proxyLog)
  .catch(console.error);
