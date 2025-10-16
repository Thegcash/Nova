import 'dotenv/config'
console.log('BOOT: PORT=', process.env.PORT)

import express from 'express'
console.log('BOOT: express imported')

import { ingestHandler } from './routes/ingest'
console.log('BOOT: routes imported')

const app = express()
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))
app.post('/v1/ingest', ingestHandler)

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`Ingestion listening on http://localhost:${port}`)
})
