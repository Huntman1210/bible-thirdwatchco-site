# bible.thirdwatchco.com — Next.js 15 static site

Side-by-side KJV + Modern English reader.

## Source data

Pulls from `C:\Users\hunte\bible-modern\` (read-only). The build step
parses the markdown table format used in that repo and emits a
JSON-per-book file at `data/bible/` that the Next.js build then
statically generates routes from.

## Local dev

```powershell
cd C:\Users\hunte\thirdwatch\bible-subdomain
npm install
npm run parse-bible    # one-time: parse bible-modern → data/bible/*.json
npm run dev            # http://localhost:3000
```

## Deploy

```powershell
npm run build          # static export to ./out
# Deploy ./out to Vercel:
# - vercel link (first time)
# - vercel --prod
```

## DNS

Add at Name.com / Vercel DNS:
```
CNAME  bible  cname.vercel-dns.com.
```

Once propagated, set `bible.thirdwatchco.com` as the production domain
in Vercel project settings → Domains.

## Routes generated

- `/` — homepage with book index
- `/bible/[book]/[chapter]/` — chapter pages (66 books × ~18 chapters
  average ≈ 1,189 pages)
- `/sitemap.xml` — generated at build

## What's stubbed for v1 beta

If the parser only finds Genesis + Matthew + Psalms in the manuscript,
those three books ship as the v1 launch. Other books generate as
404 with a "Coming soon" placeholder. The parser logs which books
were successfully parsed; the build manifest at `data/build-manifest.json`
lists shipped books.

## Audio

Each chapter page has an HTML5 `<audio>` slot pointing at a Cloudflare R2
URL of the form
`https://audio.thirdwatchco.com/{book}/{chapter}.mp3`. If the file is
missing, the player renders empty. R2 bucket setup is a HALT step
(see `bible-arm/README.md`).

## Klaviyo embed

The site footer carries a Klaviyo embed form for the free PDF/ePub
opt-in. The form's list ID and form ID are configured via
`NEXT_PUBLIC_KLAVIYO_LIST_ID` and `NEXT_PUBLIC_KLAVIYO_FORM_ID` in
`.env.local`. Without those env vars, the form falls back to a static
link to `https://thirdwatchco.com/bible/download`.
