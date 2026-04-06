#!/usr/bin/env bash
set -euo pipefail

/opt/bin/entry_point.sh &
SELENIUM_PID=$!

cleanup() {
  kill "$SELENIUM_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for i in $(seq 1 90); do
  if curl -fsS http://127.0.0.1:4444/wd/hub/status >/dev/null; then
    break
  fi
  sleep 1
done

WORKDIR_TMP="/tmp/workspace"
rm -rf "${WORKDIR_TMP}"
mkdir -p "${WORKDIR_TMP}"
cp -a /workspace/. "${WORKDIR_TMP}/"

cd "${WORKDIR_TMP}"
npm ci
npm --prefix src/tests/e2e ci
npm run build
npm run e2e:poc

mkdir -p /workspace/src/tests/e2e/artifacts
cp -f src/tests/e2e/artifacts/last-failure.png /workspace/src/tests/e2e/artifacts/ 2>/dev/null || true
cp -f src/tests/e2e/artifacts/last-failure.html /workspace/src/tests/e2e/artifacts/ 2>/dev/null || true
