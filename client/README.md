# music-stats front-end

https://oleksmarkh.github.io/music-stats

## Tech stack

dev deps:
[`typescript`](https://www.typescriptlang.org/docs),
[`sass`](https://sass-lang.com/documentation/file.SASS_REFERENCE.html),
[`webpack`](https://webpack.js.org/api),
[`jest`](https://facebook.github.io/jest).

deps:
[`leaflet`](http://leafletjs.com),
[`d3-scale`](https://github.com/d3/d3-scale),
[`d3-scale-chromatic`](https://github.com/d3/d3-scale-chromatic),
[`d3-color`](https://github.com/d3/d3-color).

Flags (1x1) are taken from [flag-icon-css](https://github.com/lipis/flag-icon-css/tree/master/flags/1x1).

## Implementation details

No rendering/templating framework is used, though UI consists of several component-like (React-inspired) classes.

You can always find a `.render()` method there - in `<PlaycountMap />` it assembles children components together,
in other (presentational) components it returns HTML as a string
(using [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates))
and relying on `.props` + `.state`.

DOM event handlers are bound through `.subscribe()` methods.

Presentational components actually extend Leaflet's [`Control`](https://leafletjs.com/reference-1.3.4.html#control),
so `.onAdd()` is implemented there (responsible for `.element` rendering).

Styles are organized as SASS files alongside the components. BEM methodology is used for naming.

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
