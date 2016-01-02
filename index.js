'use strict';

var path = require('path');

var metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var assets = require('metalsmith-assets');
var browserSync = require('metalsmith-browser-sync');

// detect whether we want to launch a server or not
const args = require('minimist')(process.argv.slice(2));
function isServerMode() {
    return 'server' in args;
}


let metal = metalsmith(__dirname)
    .source(path.join('src', 'content'))
    .use(markdown())
    .use(layouts({
        engine: 'jade',
        default: 'layout.jade',
        pattern: '**/*.html',
        cache: false,
        pretty: true
    }))
    .use(assets({
        source: 'src/assets'
    }));

if (isServerMode()) {
    metal.use(browserSync({
        server: 'dist',
        files: ['src/content/**/*.md', 'layouts/**/*.jade', 'src/assets/**/*']
    }));
}

metal
    .destination(path.join(__dirname, 'dist'))
    .build(function (err) {
        if (err) console.error(err);
    });
