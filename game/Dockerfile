# --- Stage 1: Build-Umgebung ---
FROM geoffreybooth/meteor-base:3.5 AS builder

COPY . /app
WORKDIR /app

# Abhängigkeiten installieren und Meteor-Bundle bauen
RUN meteor npm ci
RUN meteor build --server-only --directory /opt/meteor

# Produktions-Abhängigkeiten im Bundle installieren
WORKDIR /opt/meteor/bundle/programs/server
RUN meteor npm ci

# --- Stage 2: Schlankes Produktions-Image ---
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder /opt/meteor/bundle /app

EXPOSE 3000

CMD ["node", "main.js"]
