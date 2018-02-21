# music-stats front-end

https://oleksmarkh.github.io/music-stats

## Tech stack

### dev deps

- [x] [typescript](https://www.typescriptlang.org/docs)
- [x] [webpack](https://webpack.js.org/api)
- [x] [jest](https://facebook.github.io/jest)

### deps

- [ ] [vue](https://vuejs.org/v2/guide)
- [ ] [normalizr](https://github.com/paularmstrong/normalizr)
- [x] [leaflet](http://leafletjs.com)
- [x] [d3-scale](https://github.com/d3/d3-scale)
- [x] [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic)
- [ ] [d3-color](https://github.com/d3/d3-color)

## Setup

### Environment variables

Create a `.env` file and fill its values according to [.env.template](.env.template):

* `MAPBOX_ACCESS_TOKEN` (see Mapbox [account](https://www.mapbox.com/account/access-tokens) and [docs](https://www.mapbox.com/help/how-access-tokens-work))

### Commands

```bash
$ yarn install     # install deps
$ yarn run:dev     # run a local dev server
$ yarn test        # run unit tests
$ yarn build:prod  # produce a build artifact
$ yarn deploy      # deploy to GitHub pages
```
