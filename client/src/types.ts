import {Feature, GeometryObject} from 'geojson';

export interface Artist {
  name: string;
  playcount: number;
  area: string;
}

export interface AreaProperties {
  name: string;
  artists: Artist[];
}

export type Area = Feature<GeometryObject, AreaProperties>;
