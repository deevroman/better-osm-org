#!/usr/bin/env bash
set -euo pipefail

WORKDIR_TMP="/tmp/workspace"
NPM_CACHE_DIR="/tmp/npm-cache"
ARTIFACTS_REL="src/tests/e2e/artifacts"
ARTIFACTS_TMP="${WORKDIR_TMP}/${ARTIFACTS_REL}"
ARTIFACTS_HOST="/workspace/${ARTIFACTS_REL}"
TEST_EXIT_CODE=0
SELENIUM_PID=""

copy_artifacts() {
  mkdir -p "${ARTIFACTS_HOST}"
  if [ ! -d "${ARTIFACTS_TMP}" ]; then
    echo "Artifacts source directory does not exist: ${ARTIFACTS_TMP}"
    return
  fi

  local files=(
    "last-failure.png"
    "last-failure.html"
    "last-failure.meta.json"
    "target-loaded.png"
    "target-loaded.html"
    "target-loaded.meta.json"
    "entrypoint.log"
  )

  local file
  for file in "${files[@]}"; do
    if [ -f "${ARTIFACTS_TMP}/${file}" ]; then
      if cp -f "${ARTIFACTS_TMP}/${file}" "${ARTIFACTS_HOST}/"; then
        echo "Copied artifact: ${file}"
      else
        echo "Failed to copy artifact to host: ${file}"
      fi
    fi
  done
}

cleanup() {
  copy_artifacts
  if [ -n "${SELENIUM_PID}" ]; then
    kill "${SELENIUM_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

/opt/bin/entry_point.sh &
SELENIUM_PID=$!

for i in $(seq 1 90); do
  if curl -fsS http://127.0.0.1:4444/wd/hub/status >/dev/null; then
    break
  fi
  sleep 1
done

export NPM_CONFIG_CACHE="${NPM_CACHE_DIR}"
export npm_config_cache="${NPM_CACHE_DIR}"
export NPM_CONFIG_UPDATE_NOTIFIER="false"

mkdir -p "${NPM_CACHE_DIR}"
rm -rf "${WORKDIR_TMP}"
mkdir -p "${WORKDIR_TMP}"
cp -a /workspace/. "${WORKDIR_TMP}/"
mkdir -p "${ARTIFACTS_TMP}"

exec > >(tee -a "${ARTIFACTS_TMP}/entrypoint.log") 2>&1

echo "Starting E2E entrypoint"
cd "${WORKDIR_TMP}"

set +e
node src/build.js
BUILD_EXIT_CODE=$?

if [ "${BUILD_EXIT_CODE}" -eq 0 ]; then
  npm --prefix src/tests/e2e ci
  INSTALL_EXIT_CODE=$?
else
  INSTALL_EXIT_CODE="${BUILD_EXIT_CODE}"
fi

if [ "${INSTALL_EXIT_CODE}" -eq 0 ]; then
  npm --prefix src/tests/e2e run run
  TEST_EXIT_CODE=$?
else
  TEST_EXIT_CODE="${INSTALL_EXIT_CODE}"
fi
set -e

echo "E2E finished with exit code ${TEST_EXIT_CODE}"
exit "${TEST_EXIT_CODE}"
