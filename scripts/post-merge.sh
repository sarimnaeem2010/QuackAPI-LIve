#!/bin/bash
set -e

# Install root-level dependencies (chokidar etc.)
npm install --prefer-offline 2>/dev/null || npm install

# Install QuackAPI dependencies
cd QuackAPI
npm install --prefer-offline 2>/dev/null || npm install
