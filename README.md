# better-osm-org

Userscript adding several improvements for experienced osm.org users

1. Install [Tampermonkey](https://www.tampermonkey.net) or [Violentmonkey](https://violentmonkey.github.io/)
2. [Install](https://raw.githubusercontent.com/deevroman/better-osm-org/master/better-osm-org.user.js) script

### Tags diff in object history

  <img src="img/diff.png" width="50%">

### QuickLook for simple changesets

  <img src="img/changeset-quickview.png">

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

### Hotkeys

- `Alt` + `←`/`→` or `<` `>` for user changesets
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

### Ideas

- [ ] Changesets feed like who did it
- [ ] Jump to overpass from tags
- [ ] Show deleted
- [ ] Hide resolved notes
- [ ] Fast tags copy from wiki
- [ ] Object age
- [ ] Documentation
- [ ] Collapse name tags
- [ ] Calc area size
- [ ] Integrate https://github.com/Zverik/osmtags-editor
- [ ] Edit tags in Overpass Turbo
- [ ] Hide ways in map data view
- [ ] Localization
- [ ] Photos from imgur, wikipedia commons, ...?
- [ ] Custom overlays for iD
-
    + [ ] Geoscribble
-
    + [ ] Strava (Hard, need bypass CORS)
- [ ] Mark reviewed changesets
- [ ] website & iD helper for translator (open search query into translation platform)
- [ ] show in quick look the base way tag
- [ ] nakarte.me: line drawing
- [ ] taginfo: new overpass links
- [ ] Improve search
-
    + [ ] Filter by object type
-
    + [ ] Improve default zoom
-
    + [ ] Photon?
-
    + [ ] Overpass?
- [ ] Clickable contact:*
- [ ] {{bbox}} on/off in Overpass Turbo
- [ ] Bookmarks on map (like Organic Maps)
- [ ] Show nearest example for map legend

Maybe

- [ ] Support OpenHistoricalMap
- [ ] Move object from OSM into OpenHistoricalMap
- [ ] osm-revert template
- [ ] stop via kill switch for osm token
