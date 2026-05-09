set shell := ["bash", "-eu", "-o", "pipefail", "-c"]
set dotenv-load := false

# All recipes route through `docker compose` so the host toolchain is never
# touched. The single `app` service is reused for install / dev / test / build
# (see compose.yaml).

DC := "docker compose"
APP := "app"

default:
    @just --list --unsorted

# ---------------------------------------------------------------------------
# Bootstrap
# ---------------------------------------------------------------------------

bootstrap: build install

build:
    {{DC}} build

install:
    {{DC}} run --rm {{APP}} bun install

# ---------------------------------------------------------------------------
# Develop
# ---------------------------------------------------------------------------

dev:
    {{DC}} up {{APP}}

dev-detached:
    {{DC}} up -d {{APP}}

down:
    {{DC}} down

# Drop into the container shell (handy for ad-hoc bun commands).
shell:
    {{DC}} run --rm {{APP}} sh

# ---------------------------------------------------------------------------
# Static gates: typecheck, lint, defensive grep
# ---------------------------------------------------------------------------

typecheck:
    {{DC}} run --rm {{APP}} bun run typecheck

lint:
    {{DC}} run --rm {{APP}} bun run lint

fmt:
    {{DC}} run --rm {{APP}} bun run fmt

# Reject patterns that mask real bugs even when the type / lint gates pass.
# Source of truth for the rules: scripts/strict-code.sh (also run by CI).
strict-code:
    @bash scripts/strict-code.sh

# ---------------------------------------------------------------------------
# Tests + coverage
# ---------------------------------------------------------------------------

test:
    {{DC}} run --rm {{APP}} bun run test

# C1 (branch) coverage gate — never lower.
COVERAGE_FLOOR := "100"

coverage:
    {{DC}} run --rm {{APP}} bun run test:coverage

# ---------------------------------------------------------------------------
# Production build
# ---------------------------------------------------------------------------

build-app:
    {{DC}} run --rm {{APP}} bun run build

preview:
    {{DC}} run --rm -p 4173:4173 {{APP}} bun run preview --host 0.0.0.0

# ---------------------------------------------------------------------------
# Aggregate gates (mirrors CI)
# ---------------------------------------------------------------------------

ci: typecheck lint strict-code coverage build-app

clean:
    rm -rf dist coverage .vite
