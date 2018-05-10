import {Artist, ArtistArea, MergedArtist} from 'src/types/artist';

import config from 'src/config';
import {readFile} from 'src/utils/promise';
import log, {warn} from 'src/utils/log';

interface ArtistCorrection {
  [name: string]: string;
}

interface AreaCorrection {
  [city: string]: string;
}

interface ArtistAreaCorrection {
  [artist: string]: string;
}

interface Corrections {
  artistCorrection: ArtistCorrection;
  areaCorrection: AreaCorrection;
  artistAreaCorrection: ArtistAreaCorrection;
}

type CorrectionsList = [ArtistCorrection, AreaCorrection, ArtistAreaCorrection];

export function loadCorrections(): Promise<Corrections> {
  return Promise.all([
    config.mergedArtists.correctionFilePaths.artist,
    config.mergedArtists.correctionFilePaths.area,
    config.mergedArtists.correctionFilePaths.artistArea,
  ].map(readFile))
    .then(([artistCorrection, areaCorrection, artistAreaCorrection]: CorrectionsList) => ({
      artistCorrection,
      areaCorrection,
      artistAreaCorrection,
    }));
}

interface ArtistLookup {
  [name: string]: Artist;
}

function deduplicateArtists(
  artistList: Artist[],
  artistCorrection: ArtistCorrection,
): Artist[] {
  const artistLookup: ArtistLookup = {};

  artistList.forEach((artist) => artistLookup[artist.name] = artist);

  Object.entries(artistCorrection).forEach(([name, correctName]) => {
    const {playcount, mbid} = artistLookup[name];

    if (correctName in artistLookup) {
      const correctArtist = artistLookup[correctName];

      correctArtist.playcount += playcount;

      log(`merged "${name}" into "${correctName}", increased playcount by ${playcount}`);

      if (mbid && mbid !== correctArtist.mbid) {
        warn(`mbid mismatch: ("${name}" - "${mbid}"), ("${correctName}" - "${correctArtist.mbid}")`);
      }
    } else {
      artistLookup[correctName] = {
        name: correctName,
        playcount,
        mbid,
      };

      log(`renamed "${name}" to "${correctName}"`);
    }

    delete artistLookup[name];
  });

  return Object.values(artistLookup).sort((a, b) => b.playcount - a.playcount);
}

interface ArtistAreaLookup {
  [name: string]: string;
}

export function merge(
  artistList: Artist[],
  artistAreaList: ArtistArea[],
  corrections: Corrections,
): MergedArtist[] {
  const {artistCorrection, areaCorrection, artistAreaCorrection} = corrections;
  const artistAreaLookup: ArtistAreaLookup = {};

  artistAreaList.forEach(({artist, area}) => artistAreaLookup[artist] = area);

  return deduplicateArtists(artistList, artistCorrection).map(({name, playcount}) => ({
    name,
    playcount,
    area: getArtistArea(
      name,
      artistAreaLookup,
      areaCorrection,
      artistAreaCorrection,
    ),
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

  // @todo: add a check against registered areas (countries), to avoid unknown areas and cities/regions
  warn(`area not found: ${artist}`);

  return null;
}
