"use strict";
exports.__esModule = true;
var fs = require("fs");
var lastfm_1 = require("src/utils/lastfm");
var config_1 = require("src/config");
var argv = process.argv.slice(2);
var artistsCount = parseInt(argv[0], 10) || config_1["default"].lastfm.artists.countDefault;
if (artistsCount <= 0) {
    throw new Error("Expected a number of artists greater then 0, got " + artistsCount);
}
function extract(count) {
    console.log("fetching " + count + " artists from last.fm...");
    return lastfm_1.fetchLibraryArtists(config_1["default"].lastfm.username, count);
}
function transform(rawArtists) {
    return rawArtists.map(convert);
}
function convert(rawArtist) {
    return {
        name: rawArtist.name,
        playcount: Number(rawArtist.playcount),
        mbid: rawArtist.mbid || null
    };
}
function load(artists) {
    console.log(artists, artists.length);
    fs.writeFileSync(config_1["default"].lastfm.outputFilePath, JSON.stringify(artists, null, 2));
}
extract(artistsCount)
    .then(transform)
    .then(load)["catch"](console.error);
