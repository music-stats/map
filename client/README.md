# music-stats front-end

https://oleksmarkh.github.io/music-stats

## Tech stack

- [ ] [vue](https://vuejs.org/v2/guide)
- [ ] [normalizr](https://github.com/paularmstrong/normalizr)
- [x] [leaflet](http://leafletjs.com)
- [x] [d3-scale](https://github.com/d3/d3-scale)
- [ ] [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic)
- [ ] [d3-color](https://github.com/d3/d3-color)
- [x] [jest](https://facebook.github.io/jest)

## Setup

1. Install dependencies

```bash
$ yarn install
```

2. Provide environment variables

Create a `.env` file and fill its values according to [.env.template](.env.template):

* `MAPBOX_ACCESS_TOKEN` (see Mapbox [account](https://www.mapbox.com/account/access-tokens) and [docs](https://www.mapbox.com/help/how-access-tokens-work))

3. Run a local dev server

```bash
$ yarn run:dev
```

4. Run unit tests

```bash
$ yarn test
```

5. Build and deploy to GitHub pages

```bash
$ yarn build:prod
$ yarn deploy
```
