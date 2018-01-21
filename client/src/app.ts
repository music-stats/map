import * as L from 'leaflet';
import {GeoJsonTypes} from 'geojson';
import * as d3Scale from 'd3-scale';

import {Area} from 'src/types';
import {getArtistsAreas, getAreaSongCount} from 'src/utils/area';
import {getColorString} from 'src/utils/color';
import config from 'src/config';

import * as artists from 'data/artists.json';

import renderInfoBox from 'src/templates/InfoBox';
import renderLegend from 'src/templates/Legend';
import renderLinksBox from 'src/templates/LinksBox';

import 'leaflet/dist/leaflet.css';
import 'src/app.scss';

const {MAPBOX_ACCESS_TOKEN: accessToken} = process.env;

const areas = getArtistsAreas(artists as any);
const songCounts = areas.map(getAreaSongCount);
const totalArtistCount = (artists as any).length;
const totalSongCount = songCounts.reduce((sum, areaSongCount) => sum + areaSongCount, 0);

const colorOpacityScale = d3Scale.scaleLinear()
  .domain([
    Math.min(...songCounts),
    Math.max(...songCounts),
  ])
  .range([
    config.map.area.fillColorOpacity.min,
    config.map.area.fillColorOpacity.max,
  ]);

const map = L.map('map').setView(
  config.map.defaultView.center,
  config.map.defaultView.zoom,
);

function getAreaStyle(area: Area) {
  const fillColor = getColorString(
    config.map.area.fillColor,
    colorOpacityScale(getAreaSongCount(area)),
  );

  return {
    ...config.map.area.style.default,
    fillColor,
  };
}

function higlightArea(e: L.LeafletEvent) {
  const layer = e.target as L.Polyline;

  layer.setStyle(config.map.area.style.highlight);
  layer.bringToFront();

  infoBox.update(layer.feature);
}

function resetHighlight(e: L.LeafletEvent) {
  geojson.resetStyle(e.target);
}

function zoomToArea(e: L.LeafletEvent) {
  map.fitBounds(e.target.getBounds());
}

const areasCollection = {
  type: 'FeatureCollection' as GeoJsonTypes,
  features: areas,
};

const tileLayer = L.tileLayer(config.map.tileLayer.urlTemplate, {
  ...config.map.tileLayer.options,
  accessToken,
});

const geojson = L.geoJSON(areasCollection, {
  style: getAreaStyle,
  onEachFeature: (_, layer) => layer.on({
    mouseover: higlightArea,
    mouseout: resetHighlight,
    click: zoomToArea,
  }),
});

interface InfoBox extends L.Control {
  element: HTMLElement;
  update: (area?: Area) => void;
}

const infoBox: InfoBox = (L.control as any)();

infoBox.onAdd = function() {
  (this as InfoBox).element = L.DomUtil.create('aside', 'Map__control');
  (this as InfoBox).update();

  return (this as InfoBox).element;
};

infoBox.update = function(area = null) {
  (this as InfoBox).element.innerHTML = renderInfoBox({
    username: config.username,
    totalSongCount,
    totalArtistCount,
    areaSongCount: area
      ? getAreaSongCount(area)
      : null,
    ...(area
      ? area.properties
      : null),
  });
};

const legend: L.Control = (L.control as any)({
  position: 'bottomleft',
});

legend.onAdd = function() {
  const element = L.DomUtil.create('aside', 'Map__control');
  const areaList = areas.map((area) => {
    const songCount = getAreaSongCount(area);
    const songCountPersent = songCount / totalSongCount * 100;
    const color = getColorString(
      config.map.area.fillColor,
      colorOpacityScale(songCount),
    );

    return {
      name: area.properties.name,
      songCount,
      songCountPersent,
      color,
    };
  }).sort((a, b) => b.songCount - a.songCount);

  element.innerHTML = renderLegend({
    areaList,
  });

  return element;
};

const linksBox: L.Control = (L.control as any)({
  position: 'bottomright',
});

linksBox.onAdd = function() {
  const element = L.DomUtil.create('aside', 'Map__control');

  element.innerHTML = renderLinksBox({
    github: {
      url: config.links.github,
      text: 'music-stats',
    },
    twitter: {
      url: config.links.twitter,
      text: '@oleksmarkh',
    },
  });

  return element;
};

tileLayer.addTo(map);
geojson.addTo(map);
infoBox.addTo(map);
legend.addTo(map);
linksBox.addTo(map);

// debug
(window as any).L = L;
(window as any).map = map;
