import {Area, AreaProperties, Artist} from 'src/types/models';

interface AreasGroupping {
  [areaName: string]: AreaProperties;
}

export function groupArtistsByArea(artists: Artist[]): AreasGroupping {
  const areas: AreasGroupping = {};

  artists.forEach((artist, index) => {
    const rankedArtist = {
      ...artist,
      rank: index + 1, // assuming that "artists" are already ordered by "playcount" (descending)
    };

    if (!(artist.area in areas)) {
      (areas[artist.area] as AreaProperties) = {
        name: artist.area,
        artists: [
          rankedArtist,
        ],
      };
    } else {
      (areas[artist.area] as AreaProperties).artists.push(rankedArtist);
    }
  });

  return areas;
}

export function getArtistsAreas(artists: Artist[], world: any): Area[] {
  const artistsAreas = groupArtistsByArea(artists);
  const worldAreas = world.features;

  return worldAreas
    .filter((area: Area) => area.properties.name in artistsAreas)
    .map((area: Area) => ({
      ...area,
      properties: {
        ...artistsAreas[area.properties.name],
        iso_a2: area.properties.iso_a2,
      },
    }));
}

export function getAreaArtistCount(area: Area): number {
  return area.properties.artists.length;
}

export function getAreaScrobbleCount(area: Area): number {
  return area.properties.artists.reduce((sum, artist) => sum + artist.playcount, 0);
}
