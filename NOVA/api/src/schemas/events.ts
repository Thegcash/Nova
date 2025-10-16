import { z } from 'zod'

export const incomingEventSchema = z.object({
  ts: z.string().datetime().optional(),
  type: z.string().default('telemetry'),
  unit_id: z.string().uuid().optional(),
  unit_ref: z.string().optional(),
  speed: z.number().optional(),
  force: z.number().optional(),
  fault_code: z.string().nullable().optional(),
  ssm_breach: z.boolean().optional(),
  near_miss: z.boolean().optional(),
  idle: z.boolean().optional(),
  snapshot_base64: z.string().optional(),
  snapshot_url: z.string().url().optional()
})

export type IncomingEvent = z.infer<typeof incomingEventSchema>
