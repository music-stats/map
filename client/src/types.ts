import * as L from 'leaflet';
import {Feature, GeometryObject} from 'geojson';

export interface Artist {
  name: string;
  playcount: number;
  area: string;
  rank?: number;
}

export interface AreaProperties {
  name: string;
  artists: Artist[];
}

export interface CustomControl extends L.Control {
  element: HTMLElement;
}

export type Area = Feature<GeometryObject, AreaProperties>;

export interface Animation {
  duration: number;
  delay: number;
}
