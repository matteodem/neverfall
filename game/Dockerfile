# Build stage
FROM node:24-bookworm AS builder

RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN curl https://install.meteor.com/ | sh

RUN meteor npm install

RUN meteor build \
    --allow-superuser \
    --server-only \
    --directory /opt/meteor

# Production stage
FROM node:24-bookworm

WORKDIR /app

COPY --from=builder /opt/meteor/bundle .

WORKDIR /app/programs/server
RUN npm install --omit=dev

WORKDIR /app

ENV PORT=3000

CMD ["node", "main.js"]