export async function postJSON<T>(url:string, body:any, init?:RequestInit):Promise<T>{
  const r = await fetch(url,{ method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify(body), ...(init||{}) });
  if (!r.ok) {
    let msg = r.statusText;
    try { const j = await r.json(); if (j?.error) msg = j.error; } catch{}
    throw new Error(msg);
  }
  return r.json();
}

export async function getJSON<T>(url:string, init?:RequestInit):Promise<T>{
  const r = await fetch(url, init);
  if (!r.ok) {
    let msg = r.statusText;
    try { const j = await r.json(); if (j?.error) msg = j.error; } catch{}
    throw new Error(msg);
  }
  return r.json();
}

