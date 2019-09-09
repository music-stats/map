import * as L from 'leaflet';
import {GeoJsonTypes} from 'geojson';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Color from 'd3-color';

import {Artist, Area, AreaProperties} from 'src/types/models';
import {Animation} from 'src/types/elements';

import config from 'src/config';
import {getArtistsAreas, getAreaArtistCount, getAreaScrobbleCount} from 'src/utils/area';
import {convertToTitleCase} from 'src/utils/string';

import AreaInfo from 'src/components/controls/AreaInfo';
import AreaList, {AreaListItemProps, AreaListItemAnimatedProps} from 'src/components/controls/AreaList';
import ExternalLinkList from 'src/components/controls/ExternalLinkList';

import './PlaycountMap.scss';

// @see: https://webpack.js.org/guides/dependency-management/#require-context
// @todo:
//   * transform SVGs to PNGs (or see if it's possible to compress SVGs removing unnecessary details)
//   * load only flags for countries from the current "areas" dataset
const flagSvgContext = require.context('src/../assets/flags/1x1/', false, /\.svg$/);

type ColorScale = d3Scale.ScalePower<number, number>;
type WidthPercentScale = d3Scale.ScaleLinear<number, number>;

interface FlagDataUrlDict {
  [key: string]: string;
}

export default class PlaycountMap {
  private areas: Area[];
  private totalScrobbleCount: number;
  private isFirstRoute: boolean;
  private autoHighlightedAreaLayer: L.Layer | null;
  private defaultTitle: string;

  private colorScale: ColorScale;
  private artistCountBgWidthPercentScale: WidthPercentScale;
  private scrobbleCountBgWidthPercentScale: WidthPercentScale;

  private geojson: L.GeoJSON<AreaProperties>;
  private areaFlagDataUrlDict: FlagDataUrlDict;

  private areaInfo: AreaInfo;
  private areaList: AreaList;
  private externalLinkList: ExternalLinkList;

  constructor(
    public map: L.Map,
    private artists: Artist[],
    private world: any,
    private isDarkMode: boolean,
  ) {
    const areas = getArtistsAreas(this.artists, this.world);
    const allArtistCounts = areas.map(getAreaArtistCount);
    const allScrobbleCounts = areas.map(getAreaScrobbleCount);
    const areasCollection = {
      type: 'FeatureCollection' as GeoJsonTypes,
      features: areas,
    };

    this.areas = areas;
    this.totalScrobbleCount = allScrobbleCounts.reduce((sum, areaScrobbleCount) => sum + areaScrobbleCount, 0);
    this.isFirstRoute = true;
    this.autoHighlightedAreaLayer = null;
    this.defaultTitle = document.title;

    this.colorScale = this.getColorScale(allScrobbleCounts);
    this.artistCountBgWidthPercentScale = this.getWidthPercentScale(allArtistCounts);
    this.scrobbleCountBgWidthPercentScale = this.getWidthPercentScale(allScrobbleCounts);

    this.geojson = L.geoJSON(
      areasCollection,
      {
        style: this.getAreaStyle.bind(this),
        onEachFeature: (_, layer) => this.subscribeLayer(layer),
      }
    );
    this.areaFlagDataUrlDict = this.getAreaFlagDataUrlDict();

    this.areaInfo = this.createAreaInfo();
    this.areaList = this.createAreaList();
    this.externalLinkList = this.createExternalLinkList();
  }

  public selectAreaByRoute(route: string) {
    const layer = this.getAreaLayer(this.convertRouteToAreaName(route));

    if (!layer) {
      console.warn(`no area matches "${route}"`);
      return;
    }

    const area = (layer as L.Polyline).feature as Area;

    this.geojson.getLayers().forEach((layer: L.Polyline) => {
      if (layer.feature === area) {
        this.updateAreaInfo(area);
        document.title = `${this.defaultTitle}: ${area.properties.name}`;

        if (this.isFirstRoute) {
          this.isFirstRoute = false;
          this.zoomToAreaLayer(layer);
          this.highlightArea({
            type: 'mouseenter',
            target: layer,
          });
          this.autoHighlightedAreaLayer = layer;
        }
      } else {
        this.resetAreaHighlight({
          type: 'mouseleave',
          target: layer,
        });
      }
    });
  }

  public deselectArea() {
    this.areaInfo.setState();
    document.title = this.defaultTitle;

    // if the map is initialized with an empty route,
    // it should not zoom to the next selected area
    if (this.isFirstRoute) {
      this.isFirstRoute = false;
    }
  }

  public render() {
    this.geojson.addTo(this.map);
    this.areaInfo.addTo(this.map);
    this.areaList.addTo(this.map);
    this.externalLinkList.addTo(this.map);
  }

  private subscribeLayer(layer: L.Layer) {
    layer.on({
      mouseover: this.highlightArea.bind(this),
      mouseout: this.resetAreaHighlight.bind(this),
      click: this.selectArea.bind(this),
    });
  }

  private convertRouteToAreaName(route: string): string {
    return convertToTitleCase(route.replace(/\+/g, ' '));
  }

  private convertAreaNameToRoute(areaName: string): string {
    return areaName.replace(/\s/g, '+');
  }

  private getAreaFlagDataUrlDict(): FlagDataUrlDict {
    const flagContextKeys = flagSvgContext.keys();
    const flagDataUrls = flagContextKeys.map(flagSvgContext) as [string];
    const flagContextKeyReducer = (flagDataUrlDict: FlagDataUrlDict, key: string, index: number) => {
      flagDataUrlDict[key.slice(2, 4)] = flagDataUrls[index];
      return flagDataUrlDict;
    };

    return flagContextKeys.reduce(flagContextKeyReducer, {});
  }

  private getAreaFlagDataUrl(area: Area): string {
    return this.areaFlagDataUrlDict[area.properties.iso_a2.toLowerCase()];
  }

  private getAreaLayer(areaName: string): L.Layer {
    return this.geojson
      .getLayers()
      .find((layer) => ((layer as any).feature as Area).properties.name === areaName);
  }

  private getColorScale(allScrobbleCounts: number[]): ColorScale {
    return d3Scale.scalePow()
      .exponent(config.map.area.fillColorScale.powerExponent)
      .domain([
        Math.min(...allScrobbleCounts),
        Math.max(...allScrobbleCounts),
      ])
      .range([
        config.map.area.fillColorScale.minRange,
        config.map.area.fillColorScale.maxRange,
      ]);
  }

  private getWidthPercentScale(counts: number[]): WidthPercentScale {
    return d3Scale.scaleLinear()
      .domain([0, Math.max(...counts)])
      .range([0, 100]);
  }

  private getAreaColorString(scrobbleCount: number): string {
    return d3ScaleChromatic.interpolateYlOrRd(this.colorScale(scrobbleCount));
  }

  private getAreaBorderColorString(): string {
    return config.map.area.style.defaultModes[this.isDarkMode ? 'dark' : 'light'].color;
  }

  private getAreaStyle(area: Area): L.PathOptions {
    const color = this.getAreaBorderColorString();
    const fillColor = this.getAreaColorString(getAreaScrobbleCount(area));

    return {
      ...config.map.area.style.default,
      color,
      fillColor,
    };
  }

  private highlightArea(e: L.LeafletEvent) {
    const layer = e.target as L.Polyline;

    layer.setStyle({
      ...config.map.area.style.highlight,
      color: config.map.area.style.highlightModes[this.isDarkMode ? 'dark' : 'light'].color,
    });
    layer.bringToFront();

    if (this.autoHighlightedAreaLayer && this.autoHighlightedAreaLayer !== layer) {
      this.resetAreaHighlight({
        type: 'mouseleave',
        target: this.autoHighlightedAreaLayer,
      });
      this.autoHighlightedAreaLayer = null;
    }
  }

  private resetAreaHighlight(e: L.LeafletEvent) {
    const layer = e.target as L.Polyline;
    this.geojson.resetStyle(layer);
  }

  private zoomToAreaLayer(layer: L.Layer) {
    this.map.fitBounds((layer as L.Polyline).getBounds());
  }

  private updateAreaInfo(area: Area) {
    this.areaInfo.setState({
      areaScrobbleCount: getAreaScrobbleCount(area),
      areaFlagDataUrl: this.getAreaFlagDataUrl(area),
      areaProperties: area.properties,
    });
  }

  private selectArea(e: L.LeafletEvent) {
    const area = (e.target as L.Polyline).feature as Area;
    const {name} = area.properties;

    // since it's URL that drives application state,
    // only a route update happens here and further logic follows it
    // (see "this.selectAreaByRoute()")
    document.location.hash = this.convertAreaNameToRoute(name);
  }

  private getAreaListItemProps(area: Area): AreaListItemProps {
    const {name, artists} = area.properties;
    const flagDataUrl = this.getAreaFlagDataUrl(area);
    const artistCount = artists.length;
    const artistCountBgWidthPercent = this.artistCountBgWidthPercentScale(artistCount);
    const scrobbleCount = getAreaScrobbleCount(area);
    const scrobbleCountPercent = scrobbleCount / this.totalScrobbleCount * 100;
    const scrobbleCountBgWidthPercent = this.scrobbleCountBgWidthPercentScale(scrobbleCount);
    const color = d3Color.color(this.getAreaColorString(scrobbleCount));
    const rankColor = this.isDarkMode
      ? color.brighter(1)
      : color.darker(2);

    return {
      name,
      flagDataUrl,
      artistCount,
      artistCountBgWidthPercent,
      scrobbleCount,
      scrobbleCountPercent,
      scrobbleCountBgWidthPercent,
      color: color.toString(),
      rankColor: rankColor.toString(),
    };
  }

  private addAnimation(areaListItemProps: AreaListItemProps, index: number): AreaListItemAnimatedProps {
    const {duration, delay} = config.controls.areaList.itemScaleAnimation;
    const animation: Animation = {
      duration,
      delay: config.controls.toggleAnimationDuration + delay * index,
    };

    return {
      ...areaListItemProps,
      animation,
    };
  }

  private createAreaInfo(): AreaInfo {
    return new AreaInfo(
      config.controls.areaInfo.options,
      'article',
      'PlaycountMap__control AreaInfo',
      {
        username: config.controls.areaInfo.username,
        totalAreaCount: this.areas.length,
        totalScrobbleCount: this.totalScrobbleCount,
        totalArtistCount: this.artists.length,
      },
    );
  }

  private createAreaList(): AreaList {
    return new AreaList(
      config.controls.areaList.options,
      'aside',
      'PlaycountMap__control AreaList',
      {
        areaList: this.areas
          .map((area) => this.getAreaListItemProps(area))
          .sort((a, b) => b.scrobbleCount - a.scrobbleCount)
          .map((areaListItemProps, index) => this.addAnimation(areaListItemProps, index)),
        toggleAnimationDuration: config.controls.toggleAnimationDuration,
        onListItemMouseEnter: (areaName) => this.highlightArea({
          type: 'mouseenter',
          target: this.getAreaLayer(areaName),
        }),
        onListItemMouseLeave: (areaName) => this.resetAreaHighlight({
          type: 'mouseleave',
          target: this.getAreaLayer(areaName),
        }),
        onListItemMouseClick: (areaName) => {
          const layer = this.getAreaLayer(areaName);
          const e = {
            type: 'click',
            target: layer,
          };

          this.selectArea(e);
          this.zoomToAreaLayer(layer);
        },
      }
    );
  }

  private createExternalLinkList(): ExternalLinkList {
    return new ExternalLinkList(
      config.controls.externalLinkList.options,
      'aside',
      'PlaycountMap__control ExternalLinkList',
      {
        links: config.controls.externalLinkList.links,
        toggleAnimationDuration: config.controls.toggleAnimationDuration,
      }
    );
  }
}
