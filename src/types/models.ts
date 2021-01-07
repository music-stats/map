import * as L from 'leaflet';
import {Feature, GeometryObject} from 'geojson';

// @see: https://docs.mapbox.com/api/maps/styles/
export interface MapTileLayerOptions extends L.TileLayerOptions {
  accessToken: string;
  id: 'mapbox/light-v10' | 'mapbox/dark-v10';
  highResolution: '@2x' | '';
}

export type PackedArtist = [
  string, // name
  number, // playcount
  string, // countryCode
];

export interface Artist {
  name: string;
  playcount: number;
  countryName: string;
  rank?: number;
}

interface CountryGeoJsonProperties {
  name_long: string;
  iso_a2: string; // "ISO 3166-1-alpha-2" code
}

export type CountryGeoJson = Feature<GeometryObject, CountryGeoJsonProperties>;

export interface CountryProperties {
  name: string;
  code?: string;
  artists: Artist[];
}

export type Country = Feature<GeometryObject, CountryProperties>;

export interface WorldGeoJson {
  type: 'FeatureCollection';
  features: CountryGeoJson[];
}
