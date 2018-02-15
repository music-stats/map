import * as L from 'leaflet';

export interface CustomControl extends L.Control {
  element: HTMLElement;
}

export interface Animation {
  duration: number;
  delay: number;
}
