import {Artist, ArtistArea, MergedArtist} from 'src/types/artist';

import config from 'src/config';
import {readFile} from 'src/utils/file';
import log, {warn, stripMultiline} from 'src/utils/log';

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
  artistAreaCorrection: ArtistAreaCorrection;
  areaCorrection: AreaCorrection;
}

type CorrectionsList = [ArtistCorrection, AreaCorrection, ArtistAreaCorrection];

export function loadCorrections(): Promise<Corrections> {
  return Promise.all([
    config.mergedArtists.correctionFilePaths.artist,
    config.mergedArtists.correctionFilePaths.artistArea,
    config.mergedArtists.correctionFilePaths.area,
  ].map(readFile))
    .then(([artistCorrection, artistAreaCorrection, areaCorrection]: CorrectionsList) => ({
      artistCorrection,
      artistAreaCorrection,
      areaCorrection,
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
    const artist = artistLookup[name];

    // it could be that artist name appears in the correction list
    // but doesn't appear in the artist list (e.g. a known correction for future or simply removes artist)
    if (!artist) {
      warn(stripMultiline(`
        merge correction not needed: "${name}" -> "${correctName}"
        (artist not found in the playcount list)
      `));
      return;
    }

    const {playcount, mbid} = artist;

    if (correctName in artistLookup) {
      const correctArtist = artistLookup[correctName];
      const oldPlaycount = correctArtist.playcount;

      correctArtist.playcount += playcount;

      log(stripMultiline(`
        merged "${name}" into "${correctName}"
        (${oldPlaycount} + ${playcount} = ${correctArtist.playcount})
      `));

      if (mbid && mbid !== correctArtist.mbid) {
        warn(stripMultiline(`
          mbid mismatch:
          ("${name}" - "${mbid}"),
          ("${correctName}" - "${correctArtist.mbid}")
        `));
      }
    } else {
      artistLookup[correctName] = {
        name: correctName,
        playcount,
        mbid,
      };

      log(`renamed "${name}" to "${correctName}" (${playcount})`);
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
  const {artistCorrection, artistAreaCorrection, areaCorrection} = corrections;
  const artistAreaLookup: ArtistAreaLookup = {};

  artistAreaList.forEach(({artist, area}) => artistAreaLookup[artist] = area);

  return deduplicateArtists(artistList, artistCorrection)
    .map(({name, playcount}) => ({
      name,
      playcount,
      area: getArtistArea(
        name,
        playcount,
        artistAreaLookup,
        artistAreaCorrection,
        areaCorrection,
      ),
    }))
    .filter(({area}) => Boolean(area));
}

function getArtistArea(
  artist: string,
  playcount: number,
  artistAreaLookup: ArtistAreaLookup,
  artistAreaCorrection: ArtistAreaCorrection,
  areaCorrection: AreaCorrection,
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

  // @todo: add a check against registered areas (countries), to highlight unknown cities/regions
  warn(`area not found: ${artist} (${playcount})`);

  return null;
}
