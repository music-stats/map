import * as L from 'leaflet';

import {Animation} from 'src/types/elements';

interface LinkConfig {
  url: string;
  text: string;
}

interface ControlConfig {
  options: L.ControlOptions;
}

interface InfoBoxControlConfig extends ControlConfig {
  username: string;
}

interface LegendControlConfig extends ControlConfig {
  itemScaleAnimation: Animation;
}

interface LinksBoxConfig extends ControlConfig {
  links: {
    github: LinkConfig;
    twitter: LinkConfig;
  };
}

interface ControlsConfig {
  toggleAnimationDuration: number;
  infoBox: InfoBoxControlConfig;
  legend: LegendControlConfig;
  linksBox: LinksBoxConfig;
}

interface TileLayerOptions extends L.TileLayerOptions {
  id: string;
}

interface MapConfig {
  defaultView: {
    center: L.LatLngExpression;
    zoom: number;
  };
  tileLayer: {
    urlTemplate: string;
    options: TileLayerOptions;
  };
  area: {
    style: {
      default: L.PathOptions;
      highlight: L.PathOptions;
    };
    fillColorScale: {
      powerExponent: number;
      minRange: number;
      maxRange: number;
    };
  };
}

export interface Config {
  controls: ControlsConfig;
  map: MapConfig;
}
