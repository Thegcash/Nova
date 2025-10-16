import type { Request, Response } from 'express'
import { admin } from '../lib/supabase'
import { incomingEventSchema } from '../schemas/events'

async function verifyApiKey(apiKey?: string) {
  if (!apiKey) return null
  const { data, error } = await admin.rpc('verify_api_key', { p_key: apiKey })
  if (error) {
    console.error('verify_api_key error:', error)
    return null
  }
  return (data as string | null) ?? null
}

async function maybeUploadSnapshot(tenantId: string, base64?: string) {
  if (!base64) return null
  const path = `${tenantId}/unassigned/${Date.now()}.jpg`
  const bytes = Buffer.from(base64, 'base64')
  const { error } = await admin.storage.from('playback').upload(path, bytes, {
    contentType: 'image/jpeg',
    upsert: true
  })
  if (error) {
    console.error('snapshot upload error:', error)
    return null
  }
  return `playback/${path}`
}

export async function ingestHandler(req: Request, res: Response) {
  const apiKey = req.header('x-api-key') || req.header('X-API-Key') || undefined
  const tenantId = await verifyApiKey(apiKey)
  if (!tenantId) return res.status(401).json({ error: 'invalid_api_key' })

  const parsed = incomingEventSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'bad_payload', details: parsed.error.format() })
  }
  const e = parsed.data
  const eventTs = e.ts ? new Date(e.ts) : new Date()

  const { data: raw, error: rawErr } = await admin
    .from('events_raw')
    .insert([{
      tenant_id: tenantId,
      unit_id: e.unit_id ?? null,
      source: 'webhook',
      headers: req.headers as any,
      body: e as any
    }])
    .select('id')
    .single()

  if (rawErr) {
    console.error('events_raw insert error:', rawErr)
    return res.status(500).json({ error: 'raw_insert_failed' })
  }

  let mediaPath: string | null = null
  if (e.snapshot_base64) {
    mediaPath = await maybeUploadSnapshot(tenantId, e.snapshot_base64)
  } else if (e.snapshot_url) {
    mediaPath = e.snapshot_url
  }

  const { error: cleanErr } = await admin
    .from('events_clean')
    .insert([{
      raw_id: raw.id,
      tenant_id: tenantId,
      event_ts: eventTs.toISOString(),
      unit_id: e.unit_id ?? null,
      event_type: e.type,
      speed: e.speed ?? null,
      force: e.force ?? null,
      fault_code: e.fault_code ?? null,
      ssm_breach: e.ssm_breach ?? null,
      near_miss: e.near_miss ?? null,
      idle: e.idle ?? null,
      media_path: mediaPath
    }])

  if (cleanErr) {
    console.error('events_clean insert error:', cleanErr)
    return res.status(500).json({ error: 'clean_insert_failed' })
  }

  return res.status(202).json({ status: 'accepted', raw_id: raw.id })
}
