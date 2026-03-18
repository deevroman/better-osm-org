// ==UserScript==
// @name            Better osm.org
// @name:ru         Better osm.org
// @version         1.5.9.3
// @changelog       v1.5.9: memorizing the last satellite layer, simple vector style editor
// @changelog       v1.5.7: filter notes by creation date, Panoramax uploader (you need to enable it in the settings)
// @changelog       v1.5.5: render child relations on relation page by hover
// @changelog       v1.5.0: Shift + S: custom map layers, Shift + V: custom vector map styles, date for ESRI layer
// @changelog       v1.5.0: KeyV: switch between raster and vector styles, render light:direction=* and direction=12-34
// @changelog       v1.5.0: Initial OpenHistoricalMap support: changeset viewer
// @changelog       v1.4.8: Highlight changesets with review_requested=yes
// @changelog       v1.4.6: Copy coordinates button in map context menu, copy coordinates button for relations
// @changelog       v1.4.0: More links in Edit menu, the ability to add custom links (like OSM Smart Menu)
// @changelog       Changelog archive: https://github.com/deevroman/better-osm-org/blob/master/misc/CHANGELOG.md
// @changelog       Changelog with illustrations: https://c.osm.org/t/121670/207
// @changelog       OSM Wiki: https://osm.wiki/Better-osm-org
// @description     Several improvements for advanced users of openstreetmap.org
// @description:ru  Скрипт, добавляющий на openstreetmap.org полезные картографам функции
// @author       deevroman
// @match        https://www.openstreetmap.org/*
// @exclude      https://www.openstreetmap.org/api*
// @exclude      https://www.openstreetmap.org/message/new/*
// @exclude      https://www.openstreetmap.org/reports/new/*
// @exclude      https://www.openstreetmap.org/profile/*
// @exclude      https://www.openstreetmap.org/messages/*
// @exclude      https://www.openstreetmap.org/diary/*
// @exclude      https://www.openstreetmap.org/account*
// @exclude      https://www.openstreetmap.org/oauth2/*
// @exclude      https://www.openstreetmap.org/login*
// @match        https://www.openhistoricalmap.org/*
// @match        https://master.apis.dev.openstreetmap.org/*
// @exclude      https://master.apis.dev.openstreetmap.org/api/*
// @exclude      https://master.apis.dev.openstreetmap.org/account*
// @exclude      https://master.apis.dev.openstreetmap.org/messages/*
// @exclude      https://master.apis.dev.openstreetmap.org/diary/*
// @exclude      https://master.apis.dev.openstreetmap.org/oauth2/*
// @match        http://localhost:3000/*
// @match        https://taginfo.openstreetmap.org/*
// @match        https://taginfo.geofabrik.de/*
// @match        https://www.hdyc.neis-one.org/*
// @match        https://hdyc.neis-one.org/*
// @match        https://osmcha.org/*
// @match        https://osmcha.openhistoricalmap.org/*
// @exclude      https://www.openhistoricalmap.org/api*
// @exclude      https:///www.openhistoricalmap.org/account*
// @exclude      https:///www.openhistoricalmap.org/messages/*
// @exclude      https:///www.openhistoricalmap.org/diary/*
// @exclude      https:///www.openhistoricalmap.org/oauth2/*
// @match        https://wiki.openstreetmap.org/wiki/Proposal:*
// @exclude      https://taginfo.openstreetmap.org/embed/*
// @match        https://github.com/openstreetmap/openstreetmap-website/issues/new*
// @match        https://github.com/deevroman/better-osm-org/issues/new*
// @license      WTFPL
// @namespace    https://github.com/deevroman/better-osm-org
// @updateURL    https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @downloadURL  https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @supportURL   https://github.com/deevroman/better-osm-org/issues
// @icon         https://www.openstreetmap.org/favicon.ico
// @require      https://raw.githubusercontent.com/deevroman/GM_config/fixed-for-chromium/gm_config.js#sha256=ea04cb4254619543f8bca102756beee3e45e861077a75a5e74d72a5c131c580b
// @require      https://raw.githubusercontent.com/deevroman/osm-auth/d83736efcbec64a87d2c31ffdca3e3efc255f823/dist/osm-auth.iife.js#sha256=f9f85ed6209aa413097a5a4e1a4b6870d3a9ee94f267ac7c3ec35cee99b7dec9
// @require      https://raw.githubusercontent.com/deevroman/exif-js/aad22d0e24726efd1440a008ad08ab704731fcfd/exif.js#sha256=79c449a11e9e485318ca8eff108e1cbcc0ec8b8aa3f0a40294021a2898319147
// @require      https://raw.githubusercontent.com/deevroman/osmtogeojson/c97381a0c86c0a021641dd47d7bea01fb5514716/osmtogeojson.js#sha256=663bb5bbae47d5d12bff9cf1c87b8f973e85fab4b1f83453810aae99add54592
// @require      https://raw.githubusercontent.com/deevroman/better-osm-org/5a949d7b1b0897472396758dd5c1aaa514bba6c6/misc/assets/snow-animation.js#sha256=3b6cd76818c5575ea49aceb7bf4dc528eb8a7cb228b701329a41bb50f0800a5d
// @require      https://raw.githubusercontent.com/deevroman/opening_hours.js/f70889c71fcfd6e3ef7ba8df3b1263d8295b3dec/opening_hours+deps.min.js#sha256=e9a3213aba77dcf79ff1da9f828532acf1ebf7107ed1ce5f9370b922e023baff
// @require      https://raw.githubusercontent.com/deevroman/unzipit/refs/heads/master/dist/unzipit.min.js#sha256=13a41f257bc1fd90adeaf6731e02838cf740299235ece90634f12e117e22e2ff
// @require      https://raw.githubusercontent.com/deevroman/bz2/342be4403bf5ba835bb2c9ba54ad008bba428d60/index.js#sha256=8c19861a31e7fb403824e513e1afd23f75c5024f610671490ebc86f2eca61845
// @incompatible safari https://github.com/deevroman/better-osm-org/issues/13
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.listValues
// @grant        GM.deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceURL
// @grant        GM_getResourceText
// @grant        GM_addElement
// @grant        GM.xmlHttpRequest
// @grant        GM.fetch
// @grant        GM_info
// @comment      for get diffs for finding deleted users
// @connect      planet.openstreetmap.org
// @connect      planet.maps.mail.ru
// @comment      overpass instances
// @connect      maps.mail.ru
// @connect      overpass.private.coffee
// @connect      turbo.overpass.private.coffee
// @connect      overpass-api.openhistoricalmap.org
// @connect      overpass-api.de
// @connect      www.hdyc.neis-one.org
// @connect      hdyc.neis-one.org
// @connect      resultmaps.neis-one.org
// @connect      www.openstreetmap.org
// @connect      osmcha.org
// @connect      raw.githubusercontent.com
// @comment      for images preview from Wikimedia Commons, Panoramax, Mapillary, StreetComplete
// @connect      en.wikipedia.org
// @connect      graph.mapillary.com
// @connect      fbcdn.net
// @connect      api.panoramax.xyz
// @connect      panoramax.openstreetmap.fr
// @connect      panoramax.ign.fr
// @connect      panoramax.mapcomplete.org
// @connect      panoramax.multimob.be
// @connect      panoramax.liswu.me
// @connect      panoramax.osm-hr.org
// @connect      westnordost.de
// @connect      streetcomplete.app
// @comment      for downloading gps-tracks — osm stores tracks in AWS
// @connect      amazonaws.com
// @comment      for satellite images and custom tiles
// @connect      server.arcgisonline.com
// @connect      services.arcgisonline.com
// @connect      clarity.maptiles.arcgis.com
// @connect      wayback.maptiles.arcgis.com
// @connect      apps.kontur.io
// @connect      vector.openstreetmap.org
// @connect      vtiles.openhistoricalmap.org
// @connect      openhistoricalmap.org
// @connect      api.maptiler.com
// @connect      api.jawg.io
// @connect      tile.jawg.io
// @connect      map.atownsend.org.uk
// @connect      tiles.openfreemap.org
// @connect      tiles.openrailwaymap.org
// @connect      frexosm.ru
// @connect      static-tiles-lclu.s3.us-west-1.amazonaws.com
// @connect      demotiles.maplibre.org
// @connect      router.project-osrm.org
// @connect      tiles.indoorequal.org
// @connect      tile.openstreetmap.org
// @connect      a.tile-cyclosm.openstreetmap.fr
// @connect      b.tile-cyclosm.openstreetmap.fr
// @connect      c.tile-cyclosm.openstreetmap.fr
// @connect      tile-a.openstreetmap.fr
// @connect      tile-b.openstreetmap.fr
// @connect      tile-c.openstreetmap.fr
// @connect      api.thunderforest.com
// @connect      tile.tracestrack.com
// @comment      * for custom layers. ViolentMonkey ignores @connect by default,
// @comment      Tampermonkey will show a warning before connecting to a host that is not listed above
// @connect      *
// @connect      geoscribble.osmz.ru
// @connect      geoportal.dgu.hr
// @comment      geocoder
// @connect      photon.komoot.io
// @connect      whosthat.osmz.ru
// @connect      content-a.strava.com
// @sandbox      JavaScript
// @resource     OAUTH_HTML https://raw.githubusercontent.com/deevroman/better-osm-org/master/misc/assets/finish-oauth.html?bypass_cache
// @resource     DARK_THEME_FOR_ID_CSS https://gist.githubusercontent.com/deevroman/55f35da68ab1efb57b7ba4636bdf013d/raw/1e91d589ca8cb51c693a119424a45d9f773c265e/dark.css
// @run-at       document-start
// ==/UserScript==
