# music-stats front-end

https://oleksmarkh.github.io/music-stats

## Tech stack

- [ ] [vue](https://vuejs.org/v2/guide)
- [ ] [normalizr](https://github.com/paularmstrong/normalizr)
- [x] [leaflet](http://leafletjs.com)
- [x] [d3-scale](https://github.com/d3/d3-scale)
- [x] [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic)
- [ ] [d3-color](https://github.com/d3/d3-color)
- [x] [jest](https://facebook.github.io/jest)

## Setup

### Install dependencies

```bash
$ yarn install
```

### Provide environment variables

Create a `.env` file and fill its values according to [.env.template](.env.template):

* `MAPBOX_ACCESS_TOKEN` (see Mapbox [account](https://www.mapbox.com/account/access-tokens) and [docs](https://www.mapbox.com/help/how-access-tokens-work))

### Run a local dev server

```bash
$ yarn run:dev
```

### Run unit tests

```bash
$ yarn test
```

### Build and deploy to GitHub pages

```bash
$ yarn build:prod
$ yarn deploy
```
