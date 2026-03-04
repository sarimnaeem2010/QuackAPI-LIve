#!/usr/bin/env bash
set -e

VITE_PID=""

cleanup() {
  if [ -n "$VITE_PID" ] && kill -0 "$VITE_PID" 2>/dev/null; then
    echo "[dev.sh] Stopping Vite (pid $VITE_PID)..."
    kill "$VITE_PID" 2>/dev/null || true
  fi
  exit 0
}

trap cleanup SIGTERM SIGINT

echo "[dev.sh] Starting Vite standalone on port 5556..."
NODE_ENV=development node_modules/.bin/vite --port 5556 --host 0.0.0.0 &
VITE_PID=$!

echo "[dev.sh] Starting Express API server on port 5000 (direct node + tsx loaders)..."
NODE_ENV=development node \
  --require "./node_modules/tsx/dist/preflight.cjs" \
  --import "file://$(pwd)/node_modules/tsx/dist/loader.mjs" \
  server/index.ts

cleanup
