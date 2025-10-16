'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Button, Badge } from '@/components/ui';
import { IconSettings, IconCheck, IconX } from '@/components/icons';

export function RetentionCard() {
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/exports/carrier/settings', { cache: 'no-store' });
        const json = await res.json();
        setDays(Number(json.retention_days ?? 30));
      } catch {}
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/exports/carrier/settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ retention_days: days })
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || res.statusText);
      setMsg('Saved successfully');
      setMsgType('success');
    } catch (e: any) {
      setMsg(`Error: ${e?.message ?? e}`);
      setMsgType('error');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  async function runCleanup() {
    setMsg('Running cleanup…');
    setMsgType(null);
    try {
      const res = await fetch('/api/exports/carrier/retention/run', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || res.statusText);
      setMsg(`Cleanup complete. Deleted ${json.deleted}, failed ${json.failed}.`);
      setMsgType('success');
    } catch (e: any) {
      setMsg(`Cleanup error: ${e?.message ?? e}`);
      setMsgType('error');
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconSettings size={18} className="text-gray-600" />
          <CardTitle>Retention Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-gray-500 animate-pulse">Loading settings…</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Retention Period:</label>
              <input
                type="number"
                className="border border-gray-200 rounded-md px-3 py-1.5 w-20 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-fast"
                min={1}
                max={365}
                value={days}
                onChange={e => setDays(Math.max(1, Math.min(365, Number(e.target.value || 1))))}
              />
              <span className="text-xs text-gray-500">days</span>
              
              <Button
                variant="primary"
                size="sm"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={runCleanup}
              >
                Run Cleanup Now
              </Button>
            </div>

            {msg && (
              <div className="flex items-center gap-2">
                {msgType === 'success' && <IconCheck size={16} className="text-emerald-600" />}
                {msgType === 'error' && <IconX size={16} className="text-rose-600" />}
                <Badge variant={msgType === 'success' ? 'success' : msgType === 'error' ? 'error' : 'default'}>
                  {msg}
                </Badge>
              </div>
            )}

            <p className="text-xxs text-gray-500">
              Files older than the retention period will be automatically deleted from Supabase Storage.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

