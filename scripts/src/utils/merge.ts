import {Artist, ArtistArea, MergedArtist} from 'src/types/artist';
import {Correction, CorrectionDataType} from 'src/types/config';

import config from 'src/config';
import {readJsonFile, readTxtMultilineFolder, TxtMultilineFolderContent} from 'src/utils/file';
import log, {warn, stripMultiline} from 'src/utils/log';

interface ArtistNameCorrection {
  [name: string]: string;
}

interface AreaCorrection {
  [city: string]: string;
}

interface ArtistAreaCorrection {
  [artist: string]: string;
}

interface ParsedCorrections {
  artistNameCorrection: ArtistNameCorrection;
  artistAreaCorrection: ArtistAreaCorrection;
  areaCorrection: AreaCorrection;
}

type AnyParsedCorrection = ArtistNameCorrection | AreaCorrection | ArtistAreaCorrection;
type ParsedCorrectionsList = [ArtistNameCorrection, AreaCorrection, ArtistAreaCorrection];

function upperCaseFirstLetter(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Converts "united-states" to "United States".
function convertFileBaseNameToArea(fileName: string): string {
  return fileName.split('-').map(upperCaseFirstLetter).join(' ');
}

function convertTxtMultilineFolderContentToCorrection(folderContent: TxtMultilineFolderContent): AnyParsedCorrection {
  const correction: AnyParsedCorrection = {};

  Object.entries(folderContent).forEach(([fileName, fileContent]) => {
    const area = convertFileBaseNameToArea(fileName);

    fileContent.forEach((fileString) => correction[fileString] = area);
  });

  return correction;
}

function loadCorrection({dataType, filePath}: Correction): Promise<AnyParsedCorrection> {
  if (dataType === CorrectionDataType.JsonFile) {
    return readJsonFile(filePath);
  }

  if (dataType === CorrectionDataType.TxtFolder) {
    return readTxtMultilineFolder(filePath)
      .then(convertTxtMultilineFolderContentToCorrection);
  }

  return Promise.reject('Data type is not supported');
}

export function loadAllCorrections(): Promise<ParsedCorrections> {
  return Promise.all([
    config.mergedArtists.corrections.artistName,
    config.mergedArtists.corrections.artistArea,
    config.mergedArtists.corrections.area,
  ].map(loadCorrection))
    .then(([artistNameCorrection, artistAreaCorrection, areaCorrection]: ParsedCorrectionsList) => ({
      artistNameCorrection,
      artistAreaCorrection,
      areaCorrection,
    }));
}

interface ArtistLookup {
  [name: string]: Artist;
}

function deduplicateArtists(
  artistList: Artist[],
  artistNameCorrection: ArtistNameCorrection,
): Artist[] {
  const artistLookup: ArtistLookup = {};

  artistList.forEach((artist) => artistLookup[artist.name] = artist);

  Object.entries(artistNameCorrection).forEach(([name, correctName]) => {
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
  corrections: ParsedCorrections,
): MergedArtist[] {
  const {artistNameCorrection, artistAreaCorrection, areaCorrection} = corrections;
  const artistAreaLookup: ArtistAreaLookup = {};

  artistAreaList.forEach(({artist, area}) => artistAreaLookup[artist] = area);

  return deduplicateArtists(artistList, artistNameCorrection)
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
    // log(`corrected area for "${artist}": "${area}" -> "${correctArea}"`);
    return correctArea;
  }

  if (area) {
    return area;
  }

  // @todo: add a check against registered areas (countries), to highlight unknown cities/regions
  warn(`area not found: ${artist} (${playcount})`);

  return null;
}
