"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px", background: "#080810",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo/title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            marginBottom: 14, padding: "4px 14px", borderRadius: 999,
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
            fontSize: "0.72rem", color: "rgba(167,139,250,0.85)",
            letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
            AI Image Generator
          </div>
          <h1 style={{
            fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em",
            color: "#f0f0f8", margin: "0 0 8px", lineHeight: 1.15,
          }}>
            Welcome back
          </h1>
          <p style={{ color: "rgba(160,160,210,0.55)", fontSize: "0.9rem", margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 22, padding: "clamp(20px, 5vw, 32px)",
            display: "flex", flexDirection: "column", gap: 16,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: "0.8rem", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px 24px", borderRadius: 12,
              border: "none", fontWeight: 600, fontSize: "0.93rem",
              cursor: loading ? "not-allowed" : "pointer",
              background: loading
                ? "rgba(255,255,255,0.05)"
                : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)",
              color: loading ? "rgba(160,160,210,0.35)" : "#fff",
              boxShadow: loading ? "none" : "0 0 28px rgba(124,58,237,0.3)",
              letterSpacing: "0.01em", marginTop: 4,
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(160,160,210,0.45)", margin: 0 }}>
            No account?{" "}
            <Link href="/signup" style={{ color: "rgba(167,139,250,0.8)", textDecoration: "none" }}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em",
  textTransform: "uppercase", color: "rgba(160,160,210,0.6)",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, padding: "11px 14px",
  color: "#f0f0f8", fontSize: "0.92rem",
  outline: "none", width: "100%", boxSizing: "border-box",
};
