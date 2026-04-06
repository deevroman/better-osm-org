FROM selenium/standalone-firefox:latest

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && npm i -g npm@10 \
    && rm -rf /var/lib/apt/lists/*

COPY src/tests/e2e/docker-entrypoint.sh /opt/better-osm-e2e-entrypoint.sh
RUN chmod +x /opt/better-osm-e2e-entrypoint.sh

USER seluser
WORKDIR /workspace

ENTRYPOINT ["/opt/better-osm-e2e-entrypoint.sh"]
