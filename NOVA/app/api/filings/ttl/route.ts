export async function GET() {
  const ttl = Number(process.env.FILING_TTL_SECONDS || 86400);
  return new Response(JSON.stringify({ ttl_seconds: ttl }), { headers:{ "content-type":"application/json" }});
}


