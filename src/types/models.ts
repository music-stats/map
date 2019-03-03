import {Feature, GeometryObject} from 'geojson';

export interface Artist {
  name: string;
  playcount: number;
  area: string;
  rank?: number;
}

export interface AreaProperties {
  name: string;
  iso_a2?: string; // "ISO 3166-1-alpha-2" code, underscore_case because it comes directly from GeoJSON data
  artists: Artist[];
}

export type Area = Feature<GeometryObject, AreaProperties>;
