# better-osm-org

Userscript adding several improvements for experienced osm.org users

1. Install [Tampermonkey](https://www.tampermonkey.net) or [Violentmonkey](https://violentmonkey.github.io/)
2. [Install](https://raw.githubusercontent.com/deevroman/better-osm-org/master/better-osm-org.user.js) script

Also works in Firefox for Android

### Tags diff in object history

  <img src="img/diff.png" width="50%">

### QuickLook for simple changesets

  <img src="img/changeset-quicklook.jpg">

### Improved history tab

- Changesets filters
- Show users roles and status

<img src="img/changesets-filter.png">

### Node deletion

  <img src="img/delete.png" width="50%">

### Satelite layer ([Firefox only](https://github.com/deevroman/better-osm-org/issues/33))

  <img src="img/notes-sat.jpg" width="50%">

### Stat HDYC in profile (Firefox only)

  <img src="img/hdyc.jpg" width="50%">

### Dark mode for map and iD

<img src="img/dark-map.png" width="50%">

<img src="img/dark-id.png" width="50%">

Based on [OpenStreetMap Dark Theme by AlexPS](https://userstyles.world/style/15596/openstreetmap-dark-theme)

### Edit war detector

<img src="img/edit-war-detector.png" width="50%">


### Hotkeys

- `<` `>` for user changesets
- `N` — on/off notes layer
- `D` — on/off Map Data layer
- `G` — on/off GPS tracks layer
- `S` — on/off satellite layer (Firefox only)
- `H` — open object history
- `1` — open first version of object
- `Z` — zoom to changeset/object bbox
- `E` — Open editor
- `8`/`9` — prev/next map position
- `O`— open OSMCha
- `shift` + `O` — open Achavi

Experimental hotkeys:
- `K` `L` — navigation between changeset elements
- `shift` + `L` — pan to current location
- `shift` + `H` — open My changesets
- `Y` — open Yandex.Panoramas
- `shift` + `E` — open second editor
- `shift` + `N` — create new note

### Other

- [x] Changeset revert button
- [x] OSMCha dis/likes
- [x] Display way/relation versions

- [x] Search deleted author of changeset
- [ ] Template responses when closing notes/changeset
-
    + [x] 👌

+ [x] Add Rapid & geo: links into Edit menu

- Mass actions with changesets
-
    + [x] mass revert via osm-revert
-
    + [x] copy ids for JOSM
-
    + [x] via remote control JOSM
-
    + [x] load 300 changeset
- [x] Settings
- [x] Hide active note highlight
- [x] Click on time for show ISO-time
- [x] Open external links in new tab 
- [x] Highlight `fixme=*`
- [x] Resizable sidebar
- Clickable:
- + [x] Hashtags in changeset comment
- + [x] Changeset IDs in comments
- + [x] `panoramax=*`, `mapillary=*` tags 
- + [ ] `contact:*`
- [ ] Bypass OSMF Redactions

### Ideas

- [ ] Changesets feed like who did it
- [ ] Jump to overpass from tags
- [ ] Hide resolved notes
- [ ] Fast tags copy from wiki
- [ ] Tutorial
- [ ] Collapse name tags
- [ ] Calc area size
- [ ] Integrate https://github.com/Zverik/osmtags-editor
- [ ] Edit tags in Overpass Turbo
- [ ] {{bbox}} on/off in Overpass Turbo
- [ ] Improve data view
- + [ ] Hide ways
- + [ ] Filters
- + [ ] Colors
- [ ] Localization
- [ ] Show photos from imgur, wikipedia commons, ...?
- [ ] Improve search
-
  + [ ] Filter by object type
-
  + [ ] Improve default zoom
-
  + [ ] Photon?
-
  + [ ] Overpass?
- [ ] Custom overlays for iD
-
    + [ ] Strava (Hard, need bypass CORS)
- [ ] Mark reviewed changesets
- [ ] Show nearest example for map legend
- [ ] website & iD helper for translator (open search query into translation platform)
- [ ] show in quick look the base way tag
- [ ] nakarte.me: line drawing
- [ ] taginfo: new overpass links
- [ ] Bookmarks on map (like Organic Maps)

Maybe

- [ ] Support OpenHistoricalMap
- [ ] Move object from OSM into OpenHistoricalMap
- [ ] in-browser reverter

### Other

- [Discussion on forum](https://community.openstreetmap.org/t/better-osm-org-a-script-that-adds-useful-little-things-to-osm-org/121670)
- [Greasy Fork](https://greasyfork.org/en/scripts/517486-better-osm-org)
- [Issues](https://github.com/deevroman/better-osm-org/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen)
- [Mastodon](https://en.osm.town/@foxy)
