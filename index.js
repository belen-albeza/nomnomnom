'use strict';

var path = require('path');

var metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var assets = require('metalsmith-assets');
var i18n = require('metalsmith-i18n');
var multiLanguage = require('metalsmith-multi-language');
var permalinks = require('metalsmith-permalinks');
var browserSync = require('metalsmith-browser-sync');
var collections = require('metalsmith-collections');

// detect whether we want to launch a server or not
const args = require('minimist')(process.argv.slice(2));
function isServerMode() {
    return 'server' in args;
}

const DEFAULT_LOCALE = 'en';
const LOCALES = ['en', 'es'];

let metal = metalsmith(__dirname)
    .source(path.join('src', 'content'))
    .use(collections({
        englishRecipes: {
            pattern: 'recipes/*_en.md',
            sortBy: 'title'
        },
        spanishRecipes: {
            pattern: 'recipes/*_es.md',
            sortBy: 'title'
        }
    }))
    .use(multiLanguage({
        default: DEFAULT_LOCALE,
        locales: LOCALES
    }))
    .use(i18n({
        default: DEFAULT_LOCALE,
        locales: LOCALES,
        directory: 'src/locales'
    }))
    .use(markdown())
    .use(permalinks({
        relative: false,
        pattern: '/:locale/:title/',
        linksets: [{
            match: { collection: 'spanishRecipes'},
            pattern: ':locale/recetas/:title/'
        }, {
            match: { collection: 'englishRecipes'},
            pattern: ':locale/recipes/:title/'
        }]
    }))
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
