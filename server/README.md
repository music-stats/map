# music-stats back-end

An API gateway between the front-end and various data providers.

## Tech stack

- [x] [node](https://nodejs.org/dist/latest-v9.x/docs/api)
- [ ] [koa](http://koajs.com/#application)

## APIs

- [x] [last.fm](https://www.last.fm/api/intro)
- [x] [musicbrainz](https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2)
- [ ] [spotify](https://developer.spotify.com/web-api/endpoint-reference)
- [ ] [songkick](https://www.songkick.com/developer/upcoming-events)

## Setup

### Install dependencies

```bash
$ yarn install
```

### Provide environment variables

Create a `.env` file and fill its values according to [.env.template](.env.template):

* `LASTFM_API_KEY` (see last.fm [docs](https://www.last.fm/api/authentication))

## Scripts

### List top artists for a given last.fm user

```bash
$ yarn scripts:fetch-artists [number=50] # username is set in "./src/config.js"
```

Example output:

```js
[ { name: 'Dream Theater',
    playcount: 755,
    mbid: '28503ab7-8bf2-4666-a7bd-2644bfc7cb1d' }, // musicbrainz id
  { name: 'Queen',
    playcount: 738,
    mbid: '420ca290-76c5-41af-999e-564d7c71f1a7' },
  ...
  { name: 'Обійми Дощу',
    playcount: 199,
    mbid: 'fdafffec-3f14-442b-9700-1b52b89351ed' },
  { name: 'Epica',
    playcount: 197,
    mbid: 'dd5b4384-84ae-4d04-a27c-4d79a74757a1' } ]
```

### List areas for a given set of artists

Expects an output of `scripts:fetch-artists` to be located at `config.lastfm.outputFilePath`.

```bash
$ yarn scripts:fetch-artists-areas [number=10]
```

Example output:

```js
[ { artist: 'Dream Theater', area: 'New York' },
  { artist: 'Queen', area: 'Japan' }, // Japan? "mbid" from last.fm must be wrong
  ...
  { artist: 'Обійми Дощу', area: 'Ukraine' },
  { artist: 'Epica', area: 'Netherlands' } ]
```
