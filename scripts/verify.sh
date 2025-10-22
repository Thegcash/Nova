#!/usr/bin/env bash
set -e
echo "assistant:"; curl -s -X POST http://localhost:3000/api/assistant -H "Content-Type: application/json" -d '{"message":"Say hello in one sentence."}'; echo
echo "tick:";      curl -s -X POST http://localhost:3000/api/dev/tick; echo
echo "live:";      curl -s http://localhost:3000/api/live/latest | jq '.count'
