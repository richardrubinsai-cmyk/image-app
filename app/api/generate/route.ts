import { NextRequest, NextResponse } from "next/server";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/jpg", "image/webp", "image/png"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const image1 = formData.get("image1");
  const image2 = formData.get("image2");

  if (!(image1 instanceof File) || !(image2 instanceof File)) {
    return NextResponse.json({ error: "Both image1 and image2 are required" }, { status: 400 });
  }

  for (const [name, file] of [["image1", image1], ["image2", image2]] as const) {
    if (!ACCEPTED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `${name}: unsupported file type "${file.type}"` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `${name}: file exceeds 10 MB limit` },
        { status: 400 }
      );
    }
  }

  const outgoing = new FormData();
  outgoing.append("image1", image1);
  outgoing.append("image2", image2);

  let webhookRes: Response;
  try {
    webhookRes = await fetch(webhookUrl, { method: "POST", body: outgoing });
  } catch (err) {
    console.error("Webhook fetch error:", err);
    return NextResponse.json({ error: "Could not reach the webhook" }, { status: 502 });
  }

  if (!webhookRes.ok) {
    return NextResponse.json(
      { error: `Webhook responded with status ${webhookRes.status}` },
      { status: 502 }
    );
  }

  const blob = await webhookRes.arrayBuffer();
  if (blob.byteLength === 0) {
    return NextResponse.json({ error: "Webhook returned an empty response" }, { status: 502 });
  }

  const contentType = webhookRes.headers.get("content-type") ?? "application/octet-stream";

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      // Prevent the browser from caching generated images
      "Cache-Control": "no-store",
    },
  });
}
