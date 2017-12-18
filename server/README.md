# music-stats server

an API gateway between the front-end and various data providers

## Tech stack

- [x] [node](https://nodejs.org/dist/latest-v9.x/docs/api)
- [ ] [koa](http://koajs.com/#application)

## APIs

- [x] [lastfm](https://www.last.fm/api/intro)
- [x] [musicbrainz](https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2)
- [ ] [spotify](https://developer.spotify.com/web-api/endpoint-reference)
- [ ] [songkick](https://www.songkick.com/developer/upcoming-events)

## Setup

1. Install dependencies

```bash
$ yarn install
```

2. Provide environment variables

Create a `.env` file and fill its values according to [.env.template](server/.env.template).

## Scripts

### List top 50 artists for a given lastfm user

```bash
$ yarn scripts:fetch-artists # username is set in "./src/config.js"
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

### List areas for a given set of artists

Expects an output of `scripts:fetch-artists` to be located at `config.lastfm.outputFilePath`.

```bash
$ yarn scripts:fetch-artists-areas
```

Example output:

```js
[ { artist: 'Dream Theater', area: 'New York' },
  { artist: 'Queen', area: 'Japan' }, // Japan? "mbid" from lastfm must be wrong
  ...
  { artist: 'Обійми Дощу', area: 'Ukraine' },
  { artist: 'Animal ДжаZ', area: 'Russia' } ]
```
