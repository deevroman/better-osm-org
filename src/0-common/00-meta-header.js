// ==UserScript==
// @name            Better osm.org
// @name:ru         Better osm.org
// @version         1.4.9.3
// @changelog       v1.4.8: Highlight changesets with review_requested=yes
// @changelog       v1.4.6: Copy coordinates button in map context menu, copy coordinates button for relations
// @changelog       v1.4.0: More links in Edit menu, the ability to add custom links (like OSM Smart Menu)
// @changelog       v1.4.0: A button for quickly opening the links list and shortening the map attribution on phones
// @changelog       v1.3.7: Add '=' when pasting tag into iD raw tags editor, big script refactor
// @changelog       v1.3.2: Add OSM Perfect Intersection Editor into Edit menu, add statistics on the proposal voting
// @changelog       v1.3.0: Mapki, Pewu, Relation Analizer, Osmlab links on relation history, keyO for open links list
// @changelog       v1.3.0: link to ptna.openstreetmap.de and OSM Relatify editor for Public Transport routes
// @changelog       v1.3.0: Linkify Node/Way/Relation on tag page in taginfo,
// @changelog       v1.2.0: Colorblind-friendly palette in settings
// @changelog       v1.2.0: Osmcha review tags, links to waymarkedtrails.org for type=route, alt + E to click Edits tags
// @changelog       v1.2.0: notes word also check comments text, filter by notes comments count and anon authors
// @changelog       v1.1.9: badges for corporate cartographers, ability to press the Z key several times for nodes/notes
// @changelog       v1.1.8: show gpx tracks in current map view, copy coordinates for ways, alt + C for copy map center
// @changelog       v1.1.8: more filters for notes, alt + click for hide note, initial support for KML/KMZ files
// @changelog       v1.1.6: copy coordinates for nodes, autoexpand wikidata preview, Shift + M for send message to user
// @changelog       v1.0.0: type=restriction render, user ID in profile, profile for deleted user
// @changelog       v1.0.0: notes filter, Overpass link in taginfo for key values, ruler, nodes mover
// @changelog       v0.9.9: Button for 3D view building in OSMBuilding, F4map and other viewers
// @changelog       v0.9.9: Key1 for open first user's changeset, add poweruser=true in Rapid link
// @changelog       v0.9.9: Restore navigation links on changeset page of deleted user
// @changelog       v0.9.9: KeyR select object for partial revert or open in JOSM/Level0 (KeyJ)
// @changelog       v0.9.9: You can replace iD with JOSM (click on extension icon)
// @changelog       v0.9.8: Hover for nodes/members in nodes way or relation members list, better RTL support
// @changelog       v0.9.8: Show past usernames of user, click for copy ID from header, adoption to updates osm.org
// @changelog       v0.9.6: Filter by editor for edits heatmap
// @changelog       v0.9.5: Adoption to updates osm.org, render camera:direction=*
// @changelog       v0.9.1: script should work more stably in Chrome
// @changelog       v0.9.1: display prev value in history diff cell
// @changelog       v0.9.1: Alt + click by <time> for open augmented diffs
// @changelog       v0.9.1: adapting to changes on the page /history
// @changelog       v0.8.9: Satellite layer in Chrome
// @changelog       v0.8.9: Support Mapillary images in tags
// @changelog       v0.8.9: KeyJ — open in JOSM current state of objects from changeset, alt + J — in Level0
// @changelog       v0.8.9: Ctrl + click by <time> for open  state of the map as of the selected date
// @changelog       v0.8.9: Shift + / for simple search and editor via Overpass
// @changelog       v0.8: https://osm.org/user/TrickyFoxy/diary/406061
// @changelog       v0.8: Images from Panoramax, StreetComplete, Wikipedia Commons in changeset and notes
// @changelog       v0.8: GPX-tracks render (also in StreetComplete notes)
// @changelog       v0.8: Show first comment in changesets history, user badge for your friends
// @changelog       v0.8: T — toggle between compact and full tags diff mode, U — open user profile from changeset, note, ...
// @changelog       v0.8: Hotkeys on user profile Page (H — user changesets, T — tracks, D — Diary, C — comments, N — notes)
// @changelog       v0.8: Drag&Drop for geotagged photos, GeoJSON and GPX files
// @changelog       New: Comments templates, support ways render in relation members list
// @changelog       New: Q for close sidebar, shift + Z for real bbox of changeset
// @changelog       New: displaying the full history of ways (You can disable it in settings)
// @changelog       https://c.osm.org/t/better-osm-org-a-script-that-adds-useful-little-things-to-osm-org/121670/196
// @description     Several improvements for advanced users of openstreetmap.org
// @description:ru  Скрипт, добавляющий на openstreetmap.org полезные картографам функции
// @author       deevroman
// @match        https://www.openstreetmap.org/*
// @exclude      https://www.openstreetmap.org/api*
// @exclude      https://www.openstreetmap.org/diary/new
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
// @license      WTFPL
// @namespace    https://github.com/deevroman/better-osm-org
// @updateURL    https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @downloadURL  https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @supportURL   https://github.com/deevroman/better-osm-org/issues
// @icon         https://www.openstreetmap.org/favicon.ico
// @require      https://raw.githubusercontent.com/deevroman/GM_config/fixed-for-chromium/gm_config.js#sha256=ea04cb4254619543f8bca102756beee3e45e861077a75a5e74d72a5c131c580b
// @require      https://raw.githubusercontent.com/deevroman/osm-auth/d83736efcbec64a87d2c31ffdca3e3efc255f823/dist/osm-auth.iife.js#sha256=f9f85ed6209aa413097a5a4e1a4b6870d3a9ee94f267ac7c3ec35cee99b7dec9
// @require      https://raw.githubusercontent.com/deevroman/exif-js/53b0c7c1951a23d255e37ed0a883462218a71b6f/exif.js#sha256=2235967d47deadccd9976244743e3a9be5ca5e41803cda65a40b8686ec713b74
// @require      https://raw.githubusercontent.com/deevroman/osmtogeojson/c97381a0c86c0a021641dd47d7bea01fb5514716/osmtogeojson.js#sha256=663bb5bbae47d5d12bff9cf1c87b8f973e85fab4b1f83453810aae99add54592
// @require      https://raw.githubusercontent.com/deevroman/better-osm-org/5a949d7b1b0897472396758dd5c1aaa514bba6c6/misc/assets/snow-animation.js#sha256=3b6cd76818c5575ea49aceb7bf4dc528eb8a7cb228b701329a41bb50f0800a5d
// @require      https://raw.githubusercontent.com/deevroman/opening_hours.js/f70889c71fcfd6e3ef7ba8df3b1263d8295b3dec/opening_hours+deps.min.js#sha256=e9a3213aba77dcf79ff1da9f828532acf1ebf7107ed1ce5f9370b922e023baff
// @require      https://raw.githubusercontent.com/deevroman/unzipit/refs/heads/master/dist/unzipit.min.js#sha256=13a41f257bc1fd90adeaf6731e02838cf740299235ece90634f12e117e22e2ff
// @require      https://raw.githubusercontent.com/deevroman/bz2/342be4403bf5ba835bb2c9ba54ad008bba428d60/index.js#sha256=8c19861a31e7fb403824e513e1afd23f75c5024f610671490ebc86f2eca61845
// @incompatible safari https://github.com/deevroman/better-osm-org/issues/13
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_registerMenuCommand
// @grant        GM_listValues
// @grant        GM_deleteValue
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
// @connect      westnordost.de
// @connect      streetcomplete.app
// @comment      for downloading gps-tracks — osm stores tracks in AWS
// @connect      amazonaws.com
// @comment      for satellite images
// @connect      server.arcgisonline.com
// @connect      services.arcgisonline.com
// @connect      clarity.maptiles.arcgis.com
// @connect      wayback.maptiles.arcgis.com
// @connect      vector.openstreetmap.org
// @connect      vtiles.openhistoricalmap.org
// @connect      api.maptiler.com
// @connect      map.atownsend.org.uk
// @connect      tiles.openfreemap.org
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
