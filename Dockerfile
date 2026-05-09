# syntax=docker/dockerfile:1.7
FROM oven/bun:1-alpine

WORKDIR /app

# Pre-create node_modules owned by uid 1000 so the named volume Docker
# initialises from this image inherits the right permissions for the
# non-root container user (compose: user "1000:1000").
RUN mkdir -p /app/node_modules && chown -R 1000:1000 /app

# Vite default dev port; preview uses 4173.
EXPOSE 5173 4173

# Default command: dev server. Override per `docker compose run` for tests/build.
CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0"]
