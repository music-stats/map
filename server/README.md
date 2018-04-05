# music-stats back-end

An API gateway between the front-end and various data providers.

## Tech stack

dev deps:
[`typescript`](https://www.typescriptlang.org/docs).

deps:
[`node`](https://nodejs.org/dist/latest-v9.x/docs/api),
[`ramda`](http://ramdajs.com/docs),
[`axios`](https://github.com/axios/axios),
[`koa`](http://koajs.com/#application).

## APIs, datasets

- [x] [last.fm](https://www.last.fm/api/intro)
- [x] [musicbrainz](https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2)
- [ ] [spotify](https://developer.spotify.com/web-api/endpoint-reference)
- [ ] [songkick](https://www.songkick.com/developer/upcoming-events)
- [ ] [FMA (Free Music Archive)](https://github.com/mdeff/fma)
- [ ] [DuckDuckGo Instant Answers](https://duckduckgo.com/api)

## Setup

### Environment variables

Create a `.env` file and fill its values according to [.env.template](.env.template):

* `LASTFM_API_KEY` (see last.fm [docs](https://www.last.fm/api/authentication))

### Commands

```bash
$ yarn install      # install deps
$ yarn build        # compile TypeScript
$ yarn build:watch  # compile with watch
```

## Scripts

### List top artists for a given last.fm user

```bash
$ yarn script:fetch-artists [50] [--no-color] [--no-cache] # username is set in "./src/config.js"
```

Example output:

```js
[ { name: 'Dream Theater',
    playcount: 755,
    mbid: '28503ab7-8bf2-4666-a7bd-2644bfc7cb1d' }, // MusicBrainz id
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

Expects an output of `script:fetch-artists` to be located at `config.lastfm.outputFilePath`.

```bash
$ yarn script:fetch-artists-areas [10] [--no-color] [--no-cache]
```

Example output:

```js
[ { artist: 'Dream Theater', area: 'New York' },
  { artist: 'Queen', area: 'Japan' }, // Japan? "mbid" from last.fm must be wrong
  ...
  { artist: 'Обійми Дощу', area: 'Ukraine' },
  { artist: 'Epica', area: 'Netherlands' } ]
```

### Merge results of two scripts above

Expects both input files (`.json`) to be located at `tmp/`.

```bash
$ yarn script:merge-artists
```

Example output:

```js
[ { name: 'Dream Theater',
    playcount: 755,
    area: 'United States' },
  { name: 'Queen',
    playcount: 738,
    area: 'United Kingdom' },
  ...
  { name: 'Обійми Дощу',
    playcount: 199,
    area: 'Ukraine' },
  { name: 'Epica',
    playcount: 197,
    area: 'Netherlands' } ]
```
