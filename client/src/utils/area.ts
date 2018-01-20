// generated by https://geojson-maps.ash.ms/
import * as worldData from 'data/world.geo.json';

import {Area, AreaProperties, Artist} from 'src/types';

function groupArtistsByArea(artists: Artist[]): {[areaName: string]: AreaProperties} {
  const areas = {};

  artists.forEach((artist) => {
    if (!(artist.area in areas)) {
      (areas[artist.area] as AreaProperties) = {
        name: artist.area,
        artists: [
          artist,
        ],
      };
    } else {
      (areas[artist.area] as AreaProperties).artists.push(artist);
    }
  });

  return areas;
}

export function getArtistsAreas(artists: Artist[]): Area[] {
  const artistsAreas = groupArtistsByArea(artists);
  const worldAreas = (worldData as any).features;

  return worldAreas
    .filter((area: Area) => area.properties.name in artistsAreas)
    .map((area: Area) => ({
      ...area,
      properties: {
        ...area.properties,
        ...artistsAreas[area.properties.name],
      },
    }));
}

export function getAreaSongCount(area: Area): number {
  return area.properties.artists.reduce((sum, artist) => sum + artist.playcount, 0);
}
