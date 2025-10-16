/**
 * NOVA/api/src/workers/guardrail.ts
 * Phase 3.3 — Guardrail Evaluator + Slack Notifications
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------- Helpers ----------------

function resolveTs(row: any): string {
  return row.event_ts ?? row.ts ?? row.created_at ?? new Date().toISOString();
}

function compare(op: string, a: number, b: number): boolean {
  switch (op) {
    case '>': return a > b;
    case '<': return a < b;
    case '>=': return a >= b;
    case '<=': return a <= b;
    case '=': return a === b;
    case '!=': return a !== b;
    default: return false;
  }
}

// ---------------- Notifications ----------------

async function getChannelsForPolicy(tenantId: string, policyId: string) {
  const { data, error } = await sb
    .from('policy_channel_subscriptions')
    .select(`
      is_active,
      channel:notification_channels!inner(id, channel_type, name, config, is_active)
    `)
    .eq('tenant_id', tenantId)
    .eq('policy_id', policyId)
    .eq('is_active', true);

  if (error) throw new Error(`getChannelsForPolicy: ${error.message}`);
  return (data ?? []).map((row: any) => row.channel).filter((c: any) => c?.is_active);
}

async function sendSlack(webhookUrl: string, text: string) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Slack webhook failed: ${res.status} ${body}`);
  }
}

// ---------------- Core DB Ops ----------------

async function getActiveThresholdRules() {
  const { data, error } = await sb
    .from('policy_rules')
    .select(`
      id,
      rule_type,
      target_feature,
      operator,
      threshold,
      cooldown_seconds,
      policy_version_id,
      policy_versions!inner(
        id,
        policy_id,
        policies!inner(
          id,
          tenant_id
        )
      )
    `)
    .eq('rule_type', 'threshold');

  if (error) throw new Error(error.message);

  return (data ?? []).map((r: any) => ({
    id: r.id,
    tenant_id: r.policy_versions.policies.tenant_id,
    policy_id: r.policy_versions.policy_id,
    policy_version_id: r.policy_version_id,
    target_feature: r.target_feature,
    operator: r.operator,
    threshold: r.threshold,
    cooldown_seconds: r.cooldown_seconds ?? 300,
  }));
}

async function getRecentEvents(tenantId: string, windowSeconds: number) {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { data, error } = await sb
    .from('events_clean')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('event_ts', since);

  if (error) throw new Error(error.message);
  return data;
}

async function inCooldown(
  tenantId: string,
  unitId: string,
  policyRuleId: string,
  cooldownSeconds: number
) {
  const since = new Date(Date.now() - cooldownSeconds * 1000).toISOString();
  const { data, error } = await sb
    .from('alerts')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('unit_id', unitId)
    .eq('policy_rule_id', policyRuleId)
    .gte('triggered_at', since)
    .limit(1);

  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

async function writeAlert(params: any) {
  const { error } = await sb.from('alerts').insert(params);
  if (error) throw new Error(error.message);
}

// ---------------- Worker ----------------

async function runOnce() {
  console.log('⚙️ Guardrail worker starting...');
  const rules = await getActiveThresholdRules();
  if (!rules.length) {
    console.log('No active rules found.');
    return;
  }

  for (const rule of rules) {
    const recent = await getRecentEvents(rule.tenant_id, 60);
    for (const row of recent) {
      const value = Number(row[rule.target_feature]);
      if (Number.isNaN(value)) continue;

      if (compare(rule.operator, value, rule.threshold)) {
        const cooldown = await inCooldown(
          rule.tenant_id,
          row.unit_id,
          rule.id,
          rule.cooldown_seconds
        );

        await writeAlert({
          tenant_id: rule.tenant_id,
          unit_id: row.unit_id,
          policy_id: rule.policy_id,
          policy_version_id: rule.policy_version_id,
          policy_rule_id: rule.id,
          details: {
            observed: value,
            operator: rule.operator,
            threshold: rule.threshold,
            feature: rule.target_feature,
            event_ts: resolveTs(row),
          },
          cooldown_applied: cooldown,
        });

        console.log(
          `🚨 ALERT → unit=${row.unit_id} ${rule.target_feature}=${value} ${rule.operator} ${rule.threshold} cooldown=${cooldown}`
        );

        // -------- Slack Notify Fan-Out --------
        try {
          const channels = await getChannelsForPolicy(rule.tenant_id, rule.policy_id);
          if (channels.length) {
            const msg =
              `🚨 Nova Guardrail\n` +
              `tenant: ${rule.tenant_id}\n` +
              `unit: ${row.unit_id}\n` +
              `policy_id: ${rule.policy_id}\n` +
              `rule_id: ${rule.id} (${rule.target_feature} ${rule.operator} ${rule.threshold})\n` +
              `observed: ${value}\n` +
              `cooldown_applied: ${cooldown}\n` +
              `ts: ${resolveTs(row)}`;

            for (const ch of channels) {
              if (
                ch.channel_type === 'slack_webhook' &&
                ch.config?.webhook_url
              ) {
                await sendSlack(ch.config.webhook_url, msg);
              }
            }
          }
        } catch (err) {
          console.error('Notify error:', err);
        }
      }
    }
  }
  console.log('✅ Guardrail worker completed.');
}

if (require.main === module) {
  runOnce().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { runOnce };
