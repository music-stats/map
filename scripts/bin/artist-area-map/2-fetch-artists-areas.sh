#!/usr/local/bin/bash
export NODE_PATH=./dist/
node ./dist/src/scripts/artist-area-map/2-fetch-artists-areas $@
