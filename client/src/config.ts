import * as L from 'leaflet';

const config = {
  map: {
    defaultView: {
      center: ([50.45, 30.52] as L.LatLngExpression), // Kyiv
      zoom: 4,
    },

    tileLayer: {
      urlTemplate: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
      options: {
        // tslint:disable-next-line max-line-length
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
        minZoom: 2,
        maxZoom: 6,
        id: 'mapbox.light',
      },
    },

    area: {
      baseStyle: {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
      },

      // http://colorbrewer2.org
      fillColor: {
        r: 43,
        g: 140,
        b: 190,
      },

      fillColorOpacity: {
        min: 0.1,
        max: 1,
      },
    },
  },
};

export default config;
