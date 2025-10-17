export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  return [
    { url: `${base}/dashboard` },
    { url: `${base}/experiments` },
    { url: `${base}/filings` },
    { url: `${base}/settings` },
  ];
}
