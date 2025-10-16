'use client';
import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { IconDownload, IconFile, IconClock } from '@/components/icons';

type Run = {
  id: string;
  created_at: string;
  from_date: string;
  to_date: string;
  format: 'csv' | 'parquet';
  status: 'ok' | 'error' | 'running';
  duration_ms: number | null;
  manifest: string[];
};

export function RunsTable({ runs }: { runs: Run[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  async function downloadAll(runId: string) {
    try {
      const res = await fetch('/api/exports/carrier/zip', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ run_id: runId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`ZIP failed: ${err?.error || res.statusText}`);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${runId}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(String(e?.message ?? e));
    }
  }

  if (runs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <IconFile className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="text-sm text-gray-500">No export runs yet. Create your first export above!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Runs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Created</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Files</TableHead>
              <TableHead>Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {runs.map((r) => (
              <>
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{r.from_date} → {r.to_date}</TableCell>
                  <TableCell>
                    <Badge variant="default">{r.format.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      r.status === 'ok' ? 'success' :
                      r.status === 'error' ? 'error' : 'warning'
                    }>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {r.duration_ms ? `${r.duration_ms}ms` : '-'}
                  </TableCell>
                  <TableCell className="text-right">{r.manifest?.length ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setOpen(s => ({ ...s, [r.id]: !s[r.id] }))}
                      >
                        {open[r.id] ? 'Hide' : 'View'}
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => downloadAll(r.id)}
                        disabled={!r.manifest?.length}
                        title={r.manifest?.length ? 'Download ZIP' : 'No files'}
                      >
                        <IconDownload size={14} />
                        ZIP
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {open[r.id] && (
                  <tr key={r.id + '_expanded'}>
                    <td colSpan={7} className="px-4 pb-4">
                      <Card className="bg-gray-50/50">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <IconFile size={14} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">Manifest ({r.manifest?.length || 0})</span>
                          </div>
                          <ul className="space-y-1">
                            {(r.manifest || []).map((p) => (
                              <li key={p} className="text-xs">
                                <a
                                  className="font-mono text-primary-600 hover:text-primary-700 hover:underline transition-fast"
                                  href={`/api/exports/carrier/download?path=${encodeURIComponent(p)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {p}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

