import * as L from 'leaflet';

export interface CustomControl extends L.Control {
  element: HTMLElement;
  tagName: string;
  className: string;
}

export interface Animation {
  duration: number;
  delay: number;
}
