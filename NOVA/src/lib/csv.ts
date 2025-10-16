export function toCSV<T extends Record<string, any>>(rows: T[], headers?: string[]){
  if (!rows || !rows.length) return "";
  const cols = headers ?? Array.from(new Set(rows.flatMap(r => Object.keys(r))));
  const esc = (v:any) => {
    if (v===null||v===undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  };
  const lines = [cols.join(",")].concat(rows.map(r => cols.map(c => esc(r[c])).join(",")));
  return lines.join("\n");
}


