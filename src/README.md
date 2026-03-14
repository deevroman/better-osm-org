## Dev notes

Just edit the desired file and call `node build.js`. 
It just merges all the files into one big better-osm-org.user.js and monitors changes on the disk.

### Hot reload

`node build.js --watch --serve`

Open in browser.
`http://localhost:7777/server.php?dev.user.js`

Use ViolentMonkey for tracking changes in code and automatically apply them.

### IDE

This is optional. But if you want type hints to work in your IDE, you need several npm packages.

package.json

```json
{
  "type": "module",
  "scripts": {
    "dev": "cd src && node build.js --watch --serve",
    "build": "cd src && node build.js"
  },
  "devDependencies": {
    "@babel/generator": "^7.28.5",
    "@babel/parser": "^7.28.5",
    "@eslint/js": "^9.21.0",
    "@types/leaflet": "^1.9.18",
    "@types/tampermonkey": "^5.0.4",
    "eslint": "^9.21.0",
    "eslint-plugin-oxlint": "^0.15.12",
    "eslint-plugin-userscripts": "^0.5.3",
    "geojson": "^0.5.0",
    "globals": "^15.2.0",
    "leaflet": "^1.9.4",
    "maplibre-gl": "^5.14.0",
    "oxlint": "^0.15.12",
    "oxlint-tsgolint": "^0.0.4",
    "prettier": "^3.2.5",
    "typed-query-selector": "^2.12.0",
    "typescript": "^5.9.2"
  }
}

```

After that, you can use:

`npm run build`
`npm run dev`
