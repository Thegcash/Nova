import { createClient } from "@supabase/supabase-js";

export function supaAdmin(){
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false }});
}

export async function putText(path: string, text: string){
  const sb = supaAdmin();
  const { error } = await sb.storage.from("filings").upload(path, new Blob([text], { type: "text/plain" }), { upsert: true });
  if (error) throw error;
}

export async function putCSV(path: string, csv: string){
  const sb = supaAdmin();
  const { error } = await sb.storage.from("filings").upload(path, new Blob([csv], { type:"text/csv" }), { upsert: true });
  if (error) throw error;
}

export async function signURL(path: string, seconds?: number){
  const sb = supaAdmin();
  const ttl = seconds ?? Number(process.env.FILING_TTL_SECONDS || 86400); // default 24h
  const { data, error } = await sb.storage.from("filings").createSignedUrl(path, ttl);
  if (error) throw error;
  return data.signedUrl;
}
