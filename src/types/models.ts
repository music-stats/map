import * as L from 'leaflet';
import {Feature, GeometryObject} from 'geojson';

export interface MapTileLayerOptions extends L.TileLayerOptions {
  accessToken: string;
  id: 'mapbox.light' | 'mapbox.dark';
  highResolution: '@2x' | '';
}

// [name, playcount, countryCode]
export type PackedArtist = [string, number, string];

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
