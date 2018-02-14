import * as L from 'leaflet';
import {GeoJsonTypes} from 'geojson';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

import {Artist, Area, AreaProperties, CustomControl, Animation} from 'src/types';
import config from 'src/config';
import {getArtistsAreas, getAreaArtistCount, getAreaScrobbleCount} from 'src/utils/area';

import renderInfoBox from 'src/templates/InfoBox';
import renderLegend, {AreaListItemProps, AreaListItemAnimatedProps} from 'src/templates/Legend';
import renderLinksBox from 'src/templates/LinksBox';

import 'leaflet/dist/leaflet.css';
import './PlaycountMap.scss';

type ColorScale = d3Scale.ScalePower<number, number>;
type WidthPercentScale = d3Scale.ScaleLinear<number, number>;

interface InfoBoxProps {
  area?: Area;
}

interface InfoBox extends CustomControl {
  render: (props?: InfoBoxProps) => void;
}

class PlaycountMap {
  private areas: Area[];
  private totalScrobbleCount: number;

  private colorScale: ColorScale;
  private artistCountBgWidthPercentScale: WidthPercentScale;
  private scrobbleCountBgWidthPercentScale: WidthPercentScale;

  private geojson: L.GeoJSON<AreaProperties>;

  private infoBox: InfoBox;
  private legend: CustomControl;
  private linksBox: CustomControl;

  constructor(
    private map: L.Map,
    private artists: Artist[],
  ) {
    const areas = getArtistsAreas(this.artists);
    const allArtistCounts = areas.map(getAreaArtistCount);
    const allScrobbleCounts = areas.map(getAreaScrobbleCount);
    const areasCollection = {
      type: 'FeatureCollection' as GeoJsonTypes,
      features: areas,
    };

    this.areas = areas;
    this.totalScrobbleCount = allScrobbleCounts.reduce((sum, areaScrobbleCount) => sum + areaScrobbleCount, 0);

    this.colorScale = this.getColorScale(allScrobbleCounts);
    this.artistCountBgWidthPercentScale = this.getWidthPercentScale(allArtistCounts);
    this.scrobbleCountBgWidthPercentScale = this.getWidthPercentScale(allScrobbleCounts);

    this.geojson = L.geoJSON(areasCollection, {
      style: this.getAreaStyle.bind(this),
      onEachFeature: (_, layer) => this.subscribeLayer(layer),
    });

    this.infoBox = this.createInfoBox({
      position: 'topright',
    });
    this.legend = this.createLegend({
      position: 'bottomleft',
    });
    this.linksBox = this.createLinksBox({
      position: 'bottomright',
    });
  }

  public render() {
    this.geojson.addTo(this.map);
    this.infoBox.addTo(this.map);
    this.legend.addTo(this.map);
    this.linksBox.addTo(this.map);
  }

  private subscribeLayer(layer: L.Layer) {
    layer.on({
      mouseover: this.highlightArea.bind(this),
      mouseout: this.resetAreaHighlight.bind(this),
      click: this.selectArea.bind(this),
    });
  }

  private subscribeLegendElement(legendElement: HTMLElement) {
    const onMouseEnter = () => {
      setTimeout(() => {
        legendElement.removeAttribute('disabled');
      }, config.controls.toggleAnimationDuration);
    };

    const onMouseLeave = () => {
      legendElement.setAttribute('disabled', 'disabled');
    };

    legendElement.addEventListener('mouseenter', onMouseEnter);
    legendElement.addEventListener('mouseleave', onMouseLeave);
  }

  private subscribeLegendListItemElement(legendListItemElement: HTMLElement) {
    const {name: areaName} = legendListItemElement.dataset;
    const areaLayer = this.getAreaLayer(areaName);

    const onMouseEnter = () => {
      this.highlightArea({
        type: 'mouseenter',
        target: areaLayer,
      });
    };

    const onMouseLeave = () => {
      this.resetAreaHighlight({
        type: 'mouseleave',
        target: areaLayer,
      });
    };

    const onClick = () => {
      this.selectArea({
        type: 'click',
        target: areaLayer,
      });
    };

    legendListItemElement.addEventListener('mouseenter', onMouseEnter);
    legendListItemElement.addEventListener('mouseleave', onMouseLeave);
    legendListItemElement.addEventListener('click', onClick);
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

  private getArtistCountBgWidthPercent(artistCount: number): number {
    return this.artistCountBgWidthPercentScale(artistCount);
  }

  private getScrobbleCountBgWidthPercent(scrobbleCount: number): number {
    return this.scrobbleCountBgWidthPercentScale(scrobbleCount);
  }

  private getAreaColorString(scrobbleCount: number): string {
    return d3ScaleChromatic.interpolateBlues(this.colorScale(scrobbleCount));
  }

  private getAreaStyle(area: Area): L.PathOptions {
    const fillColor = this.getAreaColorString(getAreaScrobbleCount(area));

    return {
      ...config.map.area.style.default,
      fillColor,
    };
  }

  private highlightArea(e: L.LeafletEvent) {
    const layer = e.target as L.Polyline;
    const area = layer.feature as Area;

    layer.setStyle(config.map.area.style.highlight);
    layer.bringToFront();

    this.infoBox.render({
      area,
    });
  }

  private resetAreaHighlight(e: L.LeafletEvent) {
    const layer = e.target as L.Polyline;
    this.geojson.resetStyle(layer);
  }

  private zoomToArea(e: L.LeafletEvent) {
    const layer = e.target as L.Polyline;
    this.map.fitBounds(layer.getBounds());
  }

  private selectArea(e: L.LeafletEvent) {
    const layer = e.target as L.Polyline;
    const area = layer.feature as Area;

    this.geojson.getLayers().forEach((l: L.Polyline) => {
      if (l.feature === area) {
        this.zoomToArea(e);
        this.highlightArea(e);
      } else {
        this.resetAreaHighlight({
          type: 'mouseleave',
          target: l,
        });
      }
    });
  }

  private createInfoBox(options: L.ControlOptions): InfoBox {
    const infoBox: InfoBox = (L.control as any)(options);

    infoBox.onAdd = () => {
      infoBox.element = L.DomUtil.create('article', 'PlaycountMap__control');
      infoBox.render();

      L.DomEvent.disableScrollPropagation(infoBox.element);

      return infoBox.element;
    };

    infoBox.render = ({area} = {}) => {
      infoBox.element.innerHTML = renderInfoBox({
        username: config.controls.infoBox.username,
        totalCountriesCount: this.areas.length,
        totalScrobbleCount: this.totalScrobbleCount,
        totalArtistCount: this.artists.length,
        areaScrobbleCount: area
          ? getAreaScrobbleCount(area)
          : null,
        ...(area
          ? area.properties
          : null),
      });
    };

    return infoBox;
  }

  private getAreaListItemProps(area: Area): AreaListItemProps {
    const {name, artists} = area.properties;
    const artistCount = artists.length;
    const artistCountBgWidthPercent = this.getArtistCountBgWidthPercent(artistCount);
    const scrobbleCount = getAreaScrobbleCount(area);
    const scrobbleCountPercent = scrobbleCount / this.totalScrobbleCount * 100;
    const scrobbleCountBgWidthPercent = this.getScrobbleCountBgWidthPercent(scrobbleCount);
    const color = this.getAreaColorString(scrobbleCount);

    return {
      name,
      artistCount,
      artistCountBgWidthPercent,
      scrobbleCount,
      scrobbleCountPercent,
      scrobbleCountBgWidthPercent,
      color,
    };
  }

  private addAnimation(areaListItemProps: AreaListItemProps, index: number): AreaListItemAnimatedProps {
    const {duration, delay} = config.controls.legend.itemScaleAnimation;
    const animation: Animation = {
      duration,
      delay: config.controls.toggleAnimationDuration + delay * index,
    };

    return {
      ...areaListItemProps,
      animation,
    };
  }

  private createLegend(options: L.ControlOptions): CustomControl {
    const legend: CustomControl = (L.control as any)(options);

    const areaList = this.areas
      .map((area) => this.getAreaListItemProps(area))
      .sort((a, b) => b.scrobbleCount - a.scrobbleCount)
      .map((areaListItemProps, index) => this.addAnimation(areaListItemProps, index));

    legend.onAdd = () => {
      legend.element = L.DomUtil.create('aside', 'PlaycountMap__control Legend');
      legend.element.innerHTML = renderLegend({
        areaList,
      });

      legend.element.style.transitionDuration = `${config.controls.toggleAnimationDuration}ms`;
      legend.element.setAttribute('disabled', 'disabled');
      this.subscribeLegendElement(legend.element);
      L.DomEvent.disableScrollPropagation(legend.element);

      Array.prototype.forEach.call(
        legend.element.querySelectorAll('.Legend__area'),
        this.subscribeLegendListItemElement.bind(this),
      );

      return legend.element;
    };

    return legend;
  }

  private createLinksBox(options: L.ControlOptions): CustomControl {
    const linksBox: CustomControl = (L.control as any)(options);

    linksBox.onAdd = () => {
      linksBox.element = L.DomUtil.create('aside', 'PlaycountMap__control LinksBox');
      linksBox.element.innerHTML = renderLinksBox({
        ...config.controls.linksBox.links,
      });

      linksBox.element.style.transitionDuration = `${config.controls.toggleAnimationDuration}ms`;

      return linksBox.element;
    };

    return linksBox;
  }
}

export default PlaycountMap;
