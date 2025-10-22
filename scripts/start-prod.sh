#!/usr/bin/env bash
set -e
npm run build
NODE_ENV=production npm start
