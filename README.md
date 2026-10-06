# Relay CRM — Shablonix embedded editor demo

A small fictional CRM (dashboard, customers, deals, invoices) whose **Templates**
tab embeds the Shablonix PDF editor. Prospects edit the invoice design, preview
it with a CRM invoice, and every **PDF** link in the Invoices tab renders from the
saved template.

Live: **https://demo.shablonix.online** (Cloudflare Pages project `shablonix-crm-demo`).

CRM data is mock (`src/crm-data.ts`). The template is real and lives in a dedicated
demo Shablonix account (its own organization, trial plan).

It installs the **published** packages, exactly like a customer project:

| Package | Used for |
| --- | --- |
| `@shablonix/embed` | `mountPdfEditor()`, `load({ sampleData })`, `save()` in `src/TemplatesPage.tsx` |
| `@shablonix/sdk` | `createEmbedSession()`, `generatePdfStream()` in `api.ts` |

## How it fits together

```
browser ── /api/templates ──────► api.ts ── GET /v1/templates ─────────► Shablonix API
        ── /api/session ────────►        ── createEmbedSession() ───►   (API key lives
        ── /api/invoices/:id/pdf ►       ── generatePdfStream() ────►    only here)
   │
   └── iframe (editor.shablonix.online/embed/pdf, single-use session URL)
```

- `api.ts` is the only server code, written against Web `Request`/`Response`. It runs
  as a Cloudflare Pages Function (`functions/api/[[path]].ts`) and as Vite dev middleware.
- The PDF route takes only an invoice id. The server looks the record up, so the
  public demo cannot render arbitrary data.
- Save in the editor overwrites the shared template. Every prospect edits the same
  invoice. **Start fresh** in the editor toolbar calls `/api/reset`, which resets the
  template to the system starter `SHABLONIX_STARTER_ID` (`POST /v1/templates/{id}/reset`).
  A checkpoint of the previous design is kept in the template's version history.

## Run locally

```bash
npm install
cp .env.example .env        # set SHABLONIX_API_KEY and SHABLONIX_INVOICE_TEMPLATE_ID
npm run dev                 # http://localhost:4910
```

Leave `DEMO_ORIGIN` empty locally; the iframe is then locked to the request origin.

## Deploy

```bash
npm run deploy              # vite build + wrangler pages deploy (wrangler.toml)
```

Non-secret settings are in `wrangler.toml`. The API key is a Pages secret:
`wrangler pages secret put SHABLONIX_API_KEY --project-name shablonix-crm-demo`.

## Limits worth knowing

- Embed sessions: 60 mints per hour per API key. Each editor open uses one.
- Trial plan: 100 PDFs a month and 3 templates, then the Free plan (50 PDFs, 1 template).
