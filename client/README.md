# music-stats front-end

https://oleksmarkh.github.io/music-stats

## Tech stack

dev deps:
[`typescript`](https://www.typescriptlang.org/docs),
[`webpack`](https://webpack.js.org/api),
[`jest`](https://facebook.github.io/jest).

deps:
[`leaflet`](http://leafletjs.com),
[`d3-scale`](https://github.com/d3/d3-scale),
[`d3-scale-chromatic`](https://github.com/d3/d3-scale-chromatic),
[`d3-color`](https://github.com/d3/d3-color).

## Setup

### Environment variables

Create a `.env` file and fill its values according to [.env.template](.env.template):

* `MAPBOX_ACCESS_TOKEN` (see Mapbox [account](https://www.mapbox.com/account/access-tokens) and [docs](https://www.mapbox.com/help/how-access-tokens-work))

### Commands

```bash
$ yarn install     # install deps
$ yarn lint        # lint scripts and styles
$ yarn test        # run unit tests
$ yarn run:dev     # run a local dev server
$ yarn build:prod  # produce a build artifact
$ yarn deploy      # deploy to GitHub pages
```
