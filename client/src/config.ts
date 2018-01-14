import * as L from 'leaflet';

const config = {
  map: {
    defaultView: {
      center: ([50.45, 30.52] as L.LatLngExpression), // Kyiv
      zoom: 4,
    },
    tileLayerOptions: {
      // tslint:disable-next-line max-line-length
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
      minZoom: 2,
      maxZoom: 6,
      id: 'mapbox.light',
    },
  },
};

export default config;
