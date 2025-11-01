## Dev notes

server.php:

```
<?php
header("content-type: text/javascript; charset=utf-8");

if (isset($_GET['master_user_js'])) {
    $out = `git show master:better-osm-org.user.js`;
} else if (isset($_GET['dev_user_js'])) {
//     echo `git show dev:better-osm-org.user.js`;
// } else {
   $out = `cat better-osm-org.user.js`;
}

// echo str_replace("// @version         1.2.0", "// @version         1.2." . time(), $out);
echo $out;
```

` php -S 0.0.0.0:7777`

`http://localhost:7777/server.php?dev.user.js`

`while true; do npm run build; sleep 1; done`
