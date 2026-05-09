# syntax=docker/dockerfile:1.7
FROM oven/bun:1-alpine

WORKDIR /app

# Vite default dev port; preview uses 4173.
EXPOSE 5173 4173

# Bun's install cache lives outside /app so the host bind-mount doesn't shadow it.
ENV BUN_INSTALL_CACHE_DIR=/bun-cache

# Default command: dev server. Override per `docker compose run` for tests/build.
CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0"]
