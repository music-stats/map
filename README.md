# music-stats

A playground for fetching and rendering music-related data.


## Front-end

```bash
$ cd ./client/
```

### Tech stack

- [ ] [vue](https://vuejs.org/v2/guide)
- [ ] [normalizr](https://github.com/paularmstrong/normalizr)
- [ ] [leaflet](http://leafletjs.com)
- [ ] [d3](https://github.com/d3/d3/wiki)

### Setup

TBD


## Back-end

```bash
$ cd ./server/
```

### Tech stack

- [x] [node](https://nodejs.org/dist/latest-v9.x/docs/api)
- [ ] [koa](http://koajs.com/#application)

### APIs

- [x] [lastfm](https://www.last.fm/api/intro)
- [ ] [musicbrainz](https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2)
- [ ] [spotify](https://developer.spotify.com/web-api/endpoint-reference)
- [ ] [songkick](https://www.songkick.com/developer/upcoming-events)

### Setup

```bash
$ yarn install
```

### Scripts

#### List top 50 artists for a given lastfm user

```bash
$ yarn scripts:fetch-artists # username is set in "./server/src/config.js"
```

Example output:

```js
[ { name: 'Dream Theater',
    playcount: 749,
    mbid: '28503ab7-8bf2-4666-a7bd-2644bfc7cb1d' }, // musicbrainz id
  { name: 'Queen',
    playcount: 716,
    mbid: '420ca290-76c5-41af-999e-564d7c71f1a7' },
  ...
  { name: 'Обійми Дощу',
    playcount: 192,
    mbid: 'fdafffec-3f14-442b-9700-1b52b89351ed' },
  { name: 'Animal Джаz',
    playcount: 181,
    mbid: '973d7c4c-11b6-4424-980a-eb9262a08589' } ]
```
