import * as L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import './app.scss';

const {MAPBOX_ACCESS_TOKEN} = process.env;

const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  // tslint:disable-next-line max-line-length
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: MAPBOX_ACCESS_TOKEN,
}).addTo(map);

(window as any).L = L;
(window as any).map = map;
