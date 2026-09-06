# syntax=docker/dockerfile:1.7

# Bring a pinned Node runtime into the Selenium image without hitting apt.
# This removes the flakiest network step from CI image builds.
FROM node:22-bookworm-slim AS node-runtime

FROM selenium/standalone-firefox:latest

USER root

ENV E2E_NPM_ROOT=/opt/better-osm-e2e

COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node-runtime /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

RUN set -eux; \
    geckodriver_path="$(command -v geckodriver)"; \
    mv "${geckodriver_path}" "${geckodriver_path}.real"; \
    printf '%s\n' \
        '#!/usr/bin/env bash' \
        'exec "${0}.real" --allow-system-access "$@"' \
        >"${geckodriver_path}"; \
    chmod +x "${geckodriver_path}"

COPY src/tests/e2e/package.json src/tests/e2e/package-lock.json ${E2E_NPM_ROOT}/
RUN --mount=type=cache,target=/root/.npm \
    npm --prefix ${E2E_NPM_ROOT} ci \
    && chown -R seluser:seluser ${E2E_NPM_ROOT}

COPY src/tests/e2e/docker-entrypoint.sh /opt/better-osm-e2e-entrypoint.sh
RUN chmod +x /opt/better-osm-e2e-entrypoint.sh

USER seluser
WORKDIR /workspace

ENTRYPOINT ["/opt/better-osm-e2e-entrypoint.sh"]
