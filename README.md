# AI Image Generator

A single-page web app that uploads two images to an n8n webhook and displays the AI-generated result.

**Example use case:** Upload a photo of a person and a clothing item — the AI returns a new image of the person wearing that clothing.

---

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and set your webhook URL:

```
WEBHOOK_URL=https://your-n8n-instance/webhook/your-id
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How It Works

1. User uploads two images (JPG, PNG, or WebP — max 10 MB each)
2. Browser posts them to the local `/api/generate` route
3. The server proxies the request to the n8n webhook as `multipart/form-data` with fields `image1` and `image2`
4. The webhook returns a binary image
5. The app displays it with a download link

The webhook URL is stored server-side only — it is never exposed to the browser.

---

## Project Structure

```
app/
  page.tsx          # Single-page UI (upload, generate, output)
  layout.tsx        # Root layout and metadata
  globals.css       # Global styles + Tailwind import
  api/
    generate/
      route.ts      # Server-side proxy to the n8n webhook
.env.local          # Secret env vars (gitignored)
.env.example        # Template for required env vars
```

---

## Deployment

Set `WEBHOOK_URL` as an environment variable on your hosting platform (e.g. Vercel). Do not commit `.env.local`.

```bash
npm run build
```
