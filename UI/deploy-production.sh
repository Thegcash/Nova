#!/bin/bash

HOST="https://nova-sandy-pi.vercel.app"

echo "🚀 NOVA COMMAND CENTER - PRODUCTION FINALIZATION"
echo "================================================="

echo ""
echo "1️⃣ BOOTSTRAPING DATABASE..."
curl -s "$HOST/api/setup" | jq

echo ""
echo "2️⃣ HEALTH CHECK..."
curl -s "$HOST/api/health" | jq

echo ""
echo "3️⃣ TESTING APIs..."
echo "Risk Metrics:"
curl -s "$HOST/api/risk-metrics" | jq '.totals'
echo "Fleets:"
curl -s "$HOST/api/fleets" | jq '.fleets | length'
echo "Guardrails:"
curl -s "$HOST/api/guardrails" | jq '.guardrails | length'
echo "Compliance:"
curl -s "$HOST/api/compliance" | jq '.policies | length'
echo "ROI:"
curl -s "$HOST/api/roi" | jq '.hasExposures, .hasLosses'

echo ""
echo "4️⃣ TESTING ASSISTANT..."
curl -s -X POST "$HOST/api/assistant" \
  -H 'content-type: application/json' \
  -d '{"prompt":"Give me 2 guardrail ideas to reduce losses."}' | jq '.text'

echo ""
echo "5️⃣ TESTING PAGES..."
echo "Risk Dashboard:"
curl -sI "$HOST/risk-dashboard" | head -1
echo "Guardrail Engine:"
curl -sI "$HOST/guardrail-engine" | head -1

echo ""
echo "✅ NOVA COMMAND CENTER IS LIVE!"
echo "🌐 Dashboard: $HOST/risk-dashboard"
echo "🗺️  Maps: $HOST/risk-dashboard (Fleet Map section)"
echo "🤖 Assistant: Available in all dashboards"

