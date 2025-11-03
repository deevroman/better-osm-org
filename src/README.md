## Dev notes

server.php:

```php
<?php
header("content-type: text/javascript; charset=utf-8");

if (isset($_GET['master_user_js'])) {
    $out = `git show master:better-osm-org.user.js`;
} else if (isset($_GET['dev_user_js'])) {
//     echo `git show dev:better-osm-org.user.js`;
// } else {
   $out = `cat better-osm-org.user.js`;
}

echo $out;
```

` php -S 0.0.0.0:7777`

`http://localhost:7777/server.php?dev.user.js`

package.json

```json
{
    "type": "module",
    "scripts": {
        "build": "cd src && node build.js"
    },
    "devDependencies": {
        "@eslint/js": "^9.21.0",
        "@types/leaflet": "^1.9.18",
        "@types/tampermonkey": "^5.0.4",
        "eslint": "^9.21.0",
        "eslint-plugin-oxlint": "^0.15.12",
        "eslint-plugin-userscripts": "^0.5.3",
        "globals": "^15.2.0",
        "leaflet": "^1.9.4",
        "oxlint": "^0.15.12",
        "oxlint-tsgolint": "^0.0.4",
        "prettier": "^3.2.5",
        "typed-query-selector": "^2.12.0",
        "typescript": "^5.9.2"
    }
}
```

`npm run dev`
