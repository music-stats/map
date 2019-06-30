import * as L from 'leaflet';

import {Animation} from 'src/types/elements';

// @todo: remove the "Config" part from names

interface DataUrlsConfig {
  artists: string;
  world: string;
}

interface ControlConfig {
  options: L.ControlOptions;
}

interface AreaInfoControlConfig extends ControlConfig {
  username: string;
}

interface AreaListControlConfig extends ControlConfig {
  itemScaleAnimation: Animation;
}

interface ExternalLinkConfig {
  url: string;
  text: string;
}

export interface ExternalLinkListConfig {
  github: ExternalLinkConfig;
  twitter: ExternalLinkConfig;
}

interface ExternalLinkListControlConfig extends ControlConfig {
  links: ExternalLinkListConfig;
}

interface ControlsConfig {
  toggleAnimationDuration: number;
  areaInfo: AreaInfoControlConfig;
  areaList: AreaListControlConfig;
  externalLinkList: ExternalLinkListControlConfig;
}

interface MapConfig {
  defaultView: {
    center: L.LatLngExpression;
    zoom: number;
  };

  tileLayer: {
    urlTemplate: string;
    options: L.TileLayerOptions;
  };

  area: {
    style: {
      default: L.PathOptions;
      defaultModes: {
        light: L.PathOptions;
        dark: L.PathOptions;
      };
      highlight: L.PathOptions;
      highlightModes: {
        light: L.PathOptions;
        dark: L.PathOptions;
      };
    };

    fillColorScale: {
      powerExponent: number;
      minRange: number;
      maxRange: number;
    };
  };
}

export interface Config {
  dataUrls: DataUrlsConfig;
  controls: ControlsConfig;
  map: MapConfig;
}
