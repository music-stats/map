# music-stats front-end

https://oleksmarkh.github.io/music-stats/

## Tech stack

- [ ] [vue](https://vuejs.org/v2/guide)
- [ ] [normalizr](https://github.com/paularmstrong/normalizr)
- [x] [leaflet](http://leafletjs.com)
* [d3](https://github.com/d3/d3/wiki) utils
  - [x] [d3-scale](https://github.com/d3/d3-scale)
  - [ ] [d3-color](https://github.com/d3/d3-color)

## Setup

1. Install dependencies

```bash
$ yarn install
```

2. Provide environment variables

Create a `.env` file and fill its values according to [.env.template](.env.template).

3. Run a local dev server

```bash
$ yarn run:dev
```

4. Build and deploy to GitHub pages

```bash
$ yarn build:prod
$ yarn deploy
```
