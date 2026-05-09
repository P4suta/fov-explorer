#!/usr/bin/env bash
# Reject patterns that mask real bugs even when type / lint gates pass.
# Source of truth for the rules below: top-level Justfile (`just strict-code`).
set -euo pipefail

cd "$(dirname "$0")/.."

fail() {
  echo "::error::strict-code: $1" >&2
  exit 1
}

# 1. No bare TODO/FIXME without an issue reference (#NN).
if grep -rEn '\b(TODO|FIXME)\b' \
    --include='*.ts' --include='*.svelte' --include='*.js' \
    --include='*.json' --include='*.yml' --include='*.yaml' \
    --include='*.sh' \
    --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage \
    --exclude-dir=.git \
    --exclude='strict-code.sh' \
    . | grep -vE '\(#[0-9]+\)' | grep -q '.'; then
  echo "--- offending lines: ---" >&2
  grep -rEn '\b(TODO|FIXME)\b' \
    --include='*.ts' --include='*.svelte' --include='*.js' \
    --include='*.json' --include='*.yml' --include='*.yaml' \
    --include='*.sh' \
    --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage \
    --exclude-dir=.git \
    --exclude='strict-code.sh' \
    . | grep -vE '\(#[0-9]+\)' >&2 || true
  fail "bare TODO/FIXME — add (#NN) issue link"
fi

# 2. No warning suppressions (biome-ignore / eslint-disable / @ts-ignore / @ts-nocheck).
if grep -rEn 'biome-ignore|eslint-disable|@ts-ignore|@ts-nocheck' \
    --include='*.ts' --include='*.svelte' --include='*.js' \
    --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage \
    --exclude-dir=.git \
    --exclude='strict-code.sh' \
    . ; then
  fail "warning suppression detected — fix root cause instead"
fi

# 3. No `any` type escape hatch.
if grep -rEn '\bas any\b|: any\b' \
    --include='*.ts' --include='*.svelte' \
    --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage \
    --exclude-dir=.git \
    --exclude='strict-code.sh' \
    . ; then
  fail "any type escape hatch — narrow the type instead"
fi

echo "strict-code: pass"
