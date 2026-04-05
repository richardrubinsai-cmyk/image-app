@AGENTS.md

# Project: AI Image Generator

Single-page Next.js app. Users upload two images, the app proxies them to an n8n webhook, and displays the returned generated image.

## Key Files

- `app/page.tsx` — all UI and client logic (upload cards, generate button, output area)
- `app/api/generate/route.ts` — server-side proxy to the n8n webhook; validates files before forwarding
- `.env.local` — holds `WEBHOOK_URL` (gitignored, never sent to the browser)
- `.env.example` — template showing required env vars

## Dev Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
```

## Architecture Notes

- The webhook URL lives in `process.env.WEBHOOK_URL` (server-side only, no `NEXT_PUBLIC_` prefix)
- Files are sent as `multipart/form-data` with fields `image1` and `image2`
- Client posts to `/api/generate`, never directly to the webhook
- Accepted types: JPG, PNG, WebP — max 10 MB per file (validated both client and server side)
- Output image is displayed via `URL.createObjectURL()` from the blob response

## Environment

```
WEBHOOK_URL=https://your-n8n-instance/webhook/your-id
```
