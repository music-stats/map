import * as L from 'leaflet';
import {GeoJsonTypes} from 'geojson';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Color from 'd3-color';

import {Artist, Country, CountryProperties, WorldGeoJson} from 'src/types/models';
import {Animation} from 'src/types/elements';

import config from 'src/config';
import {getArtistsCountries, getCountryArtistCount, getCountryScrobbleCount} from 'src/utils/country';
import {convertToTitleCase} from 'src/utils/string';

import CountryInfo from 'src/components/controls/CountryInfo';
import CountryList, {CountryListItemProps, CountryListItemAnimatedProps} from 'src/components/controls/CountryList';
import ExternalLinkList from 'src/components/controls/ExternalLinkList';

import './PlaycountMap.scss';

// @see: https://webpack.js.org/guides/dependency-management/#require-context
// @todo:
//   * transform SVGs to PNGs (or see if it's possible to compress SVGs removing unnecessary details)
//   * load only flags for countries from the current "countries" dataset
const flagSvgContext = require.context('src/../assets/flags/1x1/', false, /\.svg$/);

type ColorScale = d3Scale.ScalePower<number, number>;
type WidthPercentScale = d3Scale.ScaleLinear<number, number>;

interface FlagDataUrlDict {
  [key: string]: string;
}

export default class PlaycountMap {
  private countries: Country[];
  private totalScrobbleCount: number;
  private isFirstRoute: boolean;
  private autoHighlightedCountryLayer: L.Layer | null;
  private defaultTitle: string;

  private colorScale: ColorScale;
  private artistCountBgWidthPercentScale: WidthPercentScale;
  private scrobbleCountBgWidthPercentScale: WidthPercentScale;

  private geojson: L.GeoJSON<CountryProperties>;
  private countryFlagDataUrlDict: FlagDataUrlDict;

  private countryInfo: CountryInfo;
  private countryList: CountryList;
  private externalLinkList: ExternalLinkList;

  constructor(
    public map: L.Map,
    private artists: Artist[],
    private world: WorldGeoJson,
    private isDarkMode: boolean,
  ) {
    const countries = getArtistsCountries(this.artists, this.world);
    const allArtistCounts = countries.map(getCountryArtistCount);
    const allScrobbleCounts = countries.map(getCountryScrobbleCount);
    const countriesCollection = {
      type: 'FeatureCollection' as GeoJsonTypes,
      features: countries,
    };

    this.countries = countries;
    this.totalScrobbleCount = allScrobbleCounts.reduce((sum, countryScrobbleCount) => sum + countryScrobbleCount, 0);
    this.isFirstRoute = true;
    this.autoHighlightedCountryLayer = null;
    this.defaultTitle = document.title;

    this.colorScale = this.getColorScale(allScrobbleCounts);
    this.artistCountBgWidthPercentScale = this.getWidthPercentScale(allArtistCounts);
    this.scrobbleCountBgWidthPercentScale = this.getWidthPercentScale(allScrobbleCounts);

    this.geojson = L.geoJSON(
      countriesCollection,
      {
        style: this.getCountryStyle.bind(this),
        onEachFeature: (_, layer) => this.subscribeLayer(layer),
      },
    );
    this.countryFlagDataUrlDict = this.getCountryFlagDataUrlDict();

    this.countryInfo = this.createCountryInfo();
    this.countryList = this.createCountryList();
    this.externalLinkList = this.createExternalLinkList();
  }

  public selectCountryByRoute(route: string) {
    const layer = this.getCountryLayer(this.convertRouteToCountryName(route));

    if (!layer) {
      console.warn(`no country matches "${route}"`);
      return;
    }

    const country = (layer as L.Polyline).feature as Country;

    this.geojson.getLayers().forEach((layer: L.Polyline) => {
      if (layer.feature === country) {
        this.updateCountryInfo(country);
        document.title = `${this.defaultTitle}: ${country.properties.name}`;

        if (this.isFirstRoute) {
          this.isFirstRoute = false;
          this.zoomToCountryLayer(layer);
          this.highlightCountry({
            type: 'mouseenter',
            target: layer,
          });
          this.autoHighlightedCountryLayer = layer;
        }
      } else {
        this.resetCountryHighlight({
          type: 'mouseleave',
          target: layer,
        });
      }
    });
  }

  public deselectCountry() {
    this.countryInfo.setState();
    document.title = this.defaultTitle;

    // if the map is initialized with an empty route,
    // it should not zoom to the next selected country
    if (this.isFirstRoute) {
      this.isFirstRoute = false;
    }
  }

  public render() {
    this.geojson.addTo(this.map);
    this.countryInfo.addTo(this.map);
    this.countryList.addTo(this.map);
    this.externalLinkList.addTo(this.map);
  }

  private subscribeLayer(layer: L.Layer) {
    layer.on({
      mouseover: this.highlightCountry.bind(this),
      mouseout: this.resetCountryHighlight.bind(this),
      click: this.selectCountry.bind(this),
    });
  }

  private convertRouteToCountryName(route: string): string {
    return convertToTitleCase(route.replace(/\+/g, ' '));
  }

  private convertCountryNameToRoute(countryName: string): string {
    return countryName.replace(/\s/g, '+');
  }

  private getCountryFlagDataUrlDict(): FlagDataUrlDict {
    const flagContextKeys = flagSvgContext.keys();
    const flagDataUrls = flagContextKeys.map(flagSvgContext) as [string];
    const flagContextKeyReducer = (flagDataUrlDict: FlagDataUrlDict, key: string, index: number) => {
      flagDataUrlDict[key.slice(2, 4)] = flagDataUrls[index];
      return flagDataUrlDict;
    };

    return flagContextKeys.reduce(flagContextKeyReducer, {});
  }

  private getCountryFlagDataUrl(country: Country): string {
    return this.countryFlagDataUrlDict[country.properties.code.toLowerCase()];
  }

  private getCountryLayer(countryName: string): L.Layer {
    return this.geojson
      .getLayers()
      .find((layer) => ((layer as any).feature as Country).properties.name === countryName);
  }

  private getColorScale(allScrobbleCounts: number[]): ColorScale {
    return d3Scale.scalePow()
      .exponent(config.map.country.fillColorScale.powerExponent)
      .domain([
        Math.min(...allScrobbleCounts),
        Math.max(...allScrobbleCounts),
      ])
      .range([
        config.map.country.fillColorScale.minRange,
        config.map.country.fillColorScale.maxRange,
      ]);
  }

  private getWidthPercentScale(counts: number[]): WidthPercentScale {
    return d3Scale.scaleLinear()
      .domain([0, Math.max(...counts)])
      .range([0, 100]);
  }

  private getCountryColorString(scrobbleCount: number): string {
    return d3ScaleChromatic.interpolateYlOrRd(this.colorScale(scrobbleCount));
  }

  private getCountryBorderColorString(): string {
    return config.map.country.style.defaultModes[this.isDarkMode ? 'dark' : 'light'].color;
  }

  private getCountryStyle(country: Country): L.PathOptions {
    const color = this.getCountryBorderColorString();
    const fillColor = this.getCountryColorString(getCountryScrobbleCount(country));

    return {
      ...config.map.country.style.default,
      color,
      fillColor,
    };
  }

  private highlightCountry(e: Partial<L.LeafletEvent>) {
    const layer = e.target as L.Polyline;

    layer.setStyle({
      ...config.map.country.style.highlight,
      color: config.map.country.style.highlightModes[this.isDarkMode ? 'dark' : 'light'].color,
    });
    layer.bringToFront();

    if (this.autoHighlightedCountryLayer && this.autoHighlightedCountryLayer !== layer) {
      this.resetCountryHighlight({
        type: 'mouseleave',
        target: this.autoHighlightedCountryLayer,
      });
      this.autoHighlightedCountryLayer = null;
    }
  }

  private resetCountryHighlight(e: Partial<L.LeafletEvent>) {
    const layer = e.target as L.Polyline;
    this.geojson.resetStyle(layer);
  }

  private zoomToCountryLayer(layer: L.Layer) {
    this.map.fitBounds((layer as L.Polyline).getBounds());
  }

  private updateCountryInfo(country: Country) {
    this.countryInfo.setState({
      countryScrobbleCount: getCountryScrobbleCount(country),
      countryFlagDataUrl: this.getCountryFlagDataUrl(country),
      countryProperties: country.properties,
    });
  }

  private selectCountry(e: Partial<L.LeafletEvent>) {
    const country = (e.target as L.Polyline).feature as Country;
    const {name} = country.properties;

    // since it's URL that drives application state,
    // only a route update happens here and further logic follows it
    // (see "this.selectCountryByRoute()")
    document.location.hash = this.convertCountryNameToRoute(name);
  }

  private getCountryListItemProps(country: Country): CountryListItemProps {
    const {name, artists} = country.properties;
    const flagDataUrl = this.getCountryFlagDataUrl(country);
    const artistCount = artists.length;
    const artistCountBgWidthPercent = this.artistCountBgWidthPercentScale(artistCount);
    const scrobbleCount = getCountryScrobbleCount(country);
    const scrobbleCountPercent = scrobbleCount / this.totalScrobbleCount * 100;
    const scrobbleCountBgWidthPercent = this.scrobbleCountBgWidthPercentScale(scrobbleCount);
    const color = d3Color.color(this.getCountryColorString(scrobbleCount));
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

  private addAnimation(countryListItemProps: CountryListItemProps, index: number): CountryListItemAnimatedProps {
    const {duration, delay} = config.controls.countryList.itemScaleAnimation;
    const animation: Animation = {
      duration,
      delay: config.controls.toggleAnimationDuration + delay * index,
    };

    return {
      ...countryListItemProps,
      animation,
    };
  }

  private createCountryInfo(): CountryInfo {
    return new CountryInfo(
      config.controls.countryInfo.options,
      'article',
      'PlaycountMap__control CountryInfo',
      {
        username: config.controls.countryInfo.username,
        totalCountryCount: this.countries.length,
        totalScrobbleCount: this.totalScrobbleCount,
        totalArtistCount: this.artists.length,
      },
    );
  }

  private createCountryList(): CountryList {
    return new CountryList(
      config.controls.countryList.options,
      'aside',
      'PlaycountMap__control CountryList',
      {
        countryList: this.countries
          .map((country) => this.getCountryListItemProps(country))
          .sort((a, b) => b.scrobbleCount - a.scrobbleCount)
          .map((countryListItemProps, index) => this.addAnimation(countryListItemProps, index)),
        toggleAnimationDuration: config.controls.toggleAnimationDuration,
        onListItemMouseEnter: (countryName) => this.highlightCountry({
          type: 'mouseenter',
          target: this.getCountryLayer(countryName),
        }),
        onListItemMouseLeave: (countryName) => this.resetCountryHighlight({
          type: 'mouseleave',
          target: this.getCountryLayer(countryName),
        }),
        onListItemMouseClick: (countryName) => {
          const layer = this.getCountryLayer(countryName);
          const e = {
            type: 'click',
            target: layer,
          };

          this.selectCountry(e);
          this.zoomToCountryLayer(layer);
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
