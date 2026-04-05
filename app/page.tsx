"use client";

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from "react";

const API_URL = "/api/generate";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/webp", "image/png"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

type Status = "idle" | "loading" | "success" | "error";

interface ImageSlot {
  file: File;
  preview: string;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Unsupported type. Use JPG, PNG, or WebP.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "File exceeds 10 MB limit.";
  }
  return null;
}

interface UploadCardProps {
  label: string;
  slot: ImageSlot | null;
  onFile: (file: File) => void;
  onRemove: () => void;
  disabled: boolean;
}

function UploadCard({ label, slot, onFile, onRemove, disabled }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      if (err) { setFileError(err); return; }
      setFileError(null);
      onFile(file);
    },
    [onFile]
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span style={{
        fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "rgba(160,160,210,0.6)",
      }}>
        {label}
      </span>

      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        style={{
          position: "relative", width: "100%", aspectRatio: "1 / 1",
          borderRadius: "14px",
          border: slot
            ? "1.5px solid rgba(255,255,255,0.1)"
            : dragging
            ? "1.5px dashed rgba(139,92,246,0.7)"
            : "1.5px dashed rgba(255,255,255,0.15)",
          background: slot
            ? "rgba(255,255,255,0.03)"
            : dragging
            ? "rgba(139,92,246,0.06)"
            : "rgba(255,255,255,0.02)",
          cursor: disabled ? "not-allowed" : "pointer",
          overflow: "hidden",
          transition: "border-color 0.2s, background 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {slot ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slot.preview}
              alt={label}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {!disabled && (
              <button
                onClick={(e) => { e.stopPropagation(); setFileError(null); onRemove(); }}
                aria-label="Remove image"
                style={{
                  position: "absolute", top: 8, right: 8,
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: 16, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  cursor: "pointer", lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 10, color: "rgba(160,160,210,0.4)", userSelect: "none",
            pointerEvents: "none",
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span style={{ fontSize: "0.78rem", textAlign: "center", lineHeight: 1.5 }}>
              Click or drag &amp; drop
              <br />
              <span style={{ fontSize: "0.68rem", opacity: 0.6 }}>JPG · PNG · WebP · max 10 MB</span>
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={onInputChange}
          disabled={disabled}
        />
      </div>

      {fileError && (
        <p style={{ fontSize: "0.72rem", color: "#f87171", margin: 0 }}>{fileError}</p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.75s linear infinite" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

export default function Home() {
  const [image1, setImage1] = useState<ImageSlot | null>(null);
  const [image2, setImage2] = useState<ImageSlot | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const prevOutputUrl = useRef<string | null>(null);

  const handleFile = (setter: (s: ImageSlot | null) => void) => (file: File) => {
    setter({ file, preview: URL.createObjectURL(file) });
  };

  const removeSlot = (slot: ImageSlot | null, setter: (s: ImageSlot | null) => void) => {
    if (slot) URL.revokeObjectURL(slot.preview);
    setter(null);
    setStatus("idle");
    setOutputUrl(null);
    setErrorMsg("");
  };

  const bothReady = image1 !== null && image2 !== null;
  const isLoading = status === "loading";

  const handleGenerate = async () => {
    if (!image1 || !image2) return;
    if (prevOutputUrl.current) { URL.revokeObjectURL(prevOutputUrl.current); prevOutputUrl.current = null; }
    setOutputUrl(null);
    setErrorMsg("");
    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("image1", image1.file);
      formData.append("image2", image2.file);

      const response = await fetch(API_URL, { method: "POST", body: formData });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${response.status})`);
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error("Received an empty response");

      const url = URL.createObjectURL(blob);
      prevOutputUrl.current = url;
      setOutputUrl(url);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "52px 16px 80px", background: "#080810",
    }}>
      {/* ── Header ── */}
      <header style={{ textAlign: "center", marginBottom: "44px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          marginBottom: 14, padding: "4px 14px", borderRadius: 999,
          background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
          fontSize: "0.72rem", color: "rgba(167,139,250,0.85)",
          letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
          AI Powered
        </div>

        <h1 style={{
          fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontWeight: 700,
          letterSpacing: "-0.03em", color: "#f0f0f8",
          margin: "0 0 10px", lineHeight: 1.15,
        }}>
          Image Generator
        </h1>

        <p style={{ color: "rgba(160,160,210,0.55)", fontSize: "0.95rem", margin: 0, maxWidth: 340 }}>
          Upload two images and let AI blend them together
        </p>
      </header>

      {/* ── Upload card ── */}
      <div style={{
        width: "100%", maxWidth: 560,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 22, padding: "clamp(18px, 5vw, 32px)",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 14, marginBottom: 20,
        }}>
          <UploadCard
            label="Image 1" slot={image1}
            onFile={handleFile(setImage1)}
            onRemove={() => removeSlot(image1, setImage1)}
            disabled={isLoading}
          />
          <UploadCard
            label="Image 2" slot={image2}
            onFile={handleFile(setImage2)}
            onRemove={() => removeSlot(image2, setImage2)}
            disabled={isLoading}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!bothReady || isLoading}
          style={{
            width: "100%", padding: "13px 24px", borderRadius: 12,
            border: "none", fontWeight: 600, fontSize: "0.93rem",
            cursor: bothReady && !isLoading ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity 0.2s, transform 0.1s",
            background: bothReady && !isLoading
              ? "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)"
              : "rgba(255,255,255,0.05)",
            color: bothReady && !isLoading ? "#fff" : "rgba(160,160,210,0.35)",
            boxShadow: bothReady && !isLoading ? "0 0 28px rgba(124,58,237,0.3)" : "none",
            letterSpacing: "0.01em",
          }}
        >
          {isLoading ? (
            <><Spinner /> Generating…</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Generate
            </>
          )}
        </button>

        {!bothReady && !isLoading && (
          <p style={{
            textAlign: "center", fontSize: "0.75rem",
            color: "rgba(160,160,210,0.35)", margin: "10px 0 0",
          }}>
            Upload both images to enable
          </p>
        )}
      </div>

      {/* ── Output area ── */}
      {(status === "success" || status === "error") && (
        <div style={{
          width: "100%", maxWidth: 560, marginTop: 20,
          borderRadius: 22, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.03)",
        }}>
          {status === "success" && outputUrl && (
            <>
              <div style={{
                padding: "14px 20px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{
                  fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "rgba(160,160,210,0.55)",
                }}>
                  Result
                </span>
                <a
                  href={outputUrl}
                  download="generated.png"
                  style={{
                    fontSize: "0.78rem", color: "rgba(167,139,250,0.8)",
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </a>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={outputUrl} alt="Generated result" style={{ width: "100%", display: "block" }} />
            </>
          )}

          {status === "error" && (
            <div style={{ padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <p style={{ color: "#f87171", fontWeight: 600, fontSize: "0.88rem", margin: "0 0 3px" }}>
                  Generation failed
                </p>
                <p style={{ color: "rgba(248,113,113,0.65)", fontSize: "0.8rem", margin: 0 }}>
                  {errorMsg}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
