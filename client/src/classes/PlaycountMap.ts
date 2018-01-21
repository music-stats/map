import * as L from 'leaflet';
import {GeoJsonTypes} from 'geojson';
import * as d3Scale from 'd3-scale';

import {Artist, Area, AreaProperties, CustomControl} from 'src/types';
import {getArtistsAreas, getAreaSongCount} from 'src/utils/area';
import {getColorString} from 'src/utils/color';
import config from 'src/config';

import renderInfoBox from 'src/templates/InfoBox';
import renderLegend from 'src/templates/Legend';
import renderLinksBox from 'src/templates/LinksBox';

import 'leaflet/dist/leaflet.css';
import './PlaycountMap.scss';

type ColorOpacityScale = d3Scale.ScaleLinear<number, number>;

interface InfoBoxProps {
  area?: Area;
}

interface InfoBox extends CustomControl {
  render: (props?: InfoBoxProps) => void;
}

class PlaycountMap {
  private areas: Area[];
  private totalSongCount: number;
  private colorOpacityScale: ColorOpacityScale;
  private geojson: L.GeoJSON<AreaProperties>;

  private infoBox: InfoBox;
  private legend: CustomControl;
  private linksBox: CustomControl;

  constructor(
    private map: L.Map,
    private artists: Artist[],
  ) {
    const areas = getArtistsAreas(this.artists);
    const songCounts = areas.map(getAreaSongCount);
    const areasCollection = {
      type: 'FeatureCollection' as GeoJsonTypes,
      features: areas,
    };

    this.areas = areas;
    this.totalSongCount = songCounts.reduce((sum, areaSongCount) => sum + areaSongCount, 0);
    this.colorOpacityScale = this.getColorOpacityScale(songCounts);
    this.geojson = L.geoJSON(areasCollection, {
      style: this.getAreaStyle.bind(this),
      onEachFeature: (_, layer) => layer.on({
        mouseover: this.higlightArea.bind(this),
        mouseout: this.resetHighlight.bind(this),
        click: this.zoomToArea.bind(this),
      }),
    });

    this.infoBox = this.createInfoBox();
    this.legend = this.createLegend();
    this.linksBox = this.createLinksBox();
  }

  public render() {
    this.geojson.addTo(this.map);
    this.infoBox.addTo(this.map);
    this.legend.addTo(this.map);
    this.linksBox.addTo(this.map);
  }

  private getColorOpacityScale(songCounts: number[]): ColorOpacityScale {
    return d3Scale.scaleLinear()
      .domain([
        Math.min(...songCounts),
        Math.max(...songCounts),
      ])
      .range([
        config.map.area.fillColorOpacity.min,
        config.map.area.fillColorOpacity.max,
      ]);
  }

  private getAreaStyle(area: Area): L.PathOptions {
    const fillColor = getColorString(
      config.map.area.fillColor,
      this.colorOpacityScale(getAreaSongCount(area)),
    );

    return {
      ...config.map.area.style.default,
      fillColor,
    };
  }

  private higlightArea(e: L.LeafletEvent) {
    const layer = e.target as L.Polyline;

    layer.setStyle(config.map.area.style.highlight);
    layer.bringToFront();

    this.infoBox.render({
      area: layer.feature,
    });
  }

  private resetHighlight(e: L.LeafletEvent) {
    this.geojson.resetStyle(e.target);
  }

  private zoomToArea(e: L.LeafletEvent) {
    this.map.fitBounds(e.target.getBounds());
  }

  private createInfoBox(): InfoBox {
    const infoBox: InfoBox = (L.control as any)({
      position: 'topright',
    });

    infoBox.onAdd = () => {
      infoBox.element = L.DomUtil.create('article', 'PlaycountMap__control');
      infoBox.render();

      return infoBox.element;
    };

    infoBox.render = ({area} = {}) => {
      infoBox.element.innerHTML = renderInfoBox({
        username: config.username,
        totalSongCount: this.totalSongCount,
        totalArtistCount: this.artists.length,
        areaSongCount: area
          ? getAreaSongCount(area)
          : null,
        ...(area
          ? area.properties
          : null),
      });
    };

    return infoBox;
  }

  private createLegend(): CustomControl {
    const legend: CustomControl = (L.control as any)({
      position: 'bottomleft',
    });

    const areaList = this.areas.map((area) => {
      const {name} = area.properties;
      const songCount = getAreaSongCount(area);
      const songCountPersent = songCount / this.totalSongCount * 100;
      const color = getColorString(
        config.map.area.fillColor,
        this.colorOpacityScale(songCount),
      );

      return {
        name,
        songCount,
        songCountPersent,
        color,
      };
    }).sort((a, b) => b.songCount - a.songCount);

    legend.onAdd = () => {
      legend.element = L.DomUtil.create('aside', 'PlaycountMap__control Legend');
      legend.element.innerHTML = renderLegend({
        areaList,
      });

      return legend.element;
    };

    return legend;
  }

  private createLinksBox(): CustomControl {
    const linksBox: CustomControl = (L.control as any)({
      position: 'bottomright',
    });

    linksBox.onAdd = () => {
      linksBox.element = L.DomUtil.create('aside', 'PlaycountMap__control LinksBox');
      linksBox.element.innerHTML = renderLinksBox({
        ...config.links,
      });

      return linksBox.element;
    };

    return linksBox;
  }
}

export default PlaycountMap;
