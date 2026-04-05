"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function PaymentPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleBuy = () => {
    if (!user) return;
    const base = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK!;
    const url = new URL(base);
    url.searchParams.set("client_reference_id", user.id);
    url.searchParams.set("prefilled_email", user.email ?? "");
    window.location.href = url.toString();
  };

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px", background: "#080810",
    }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          marginBottom: 20, padding: "4px 14px", borderRadius: 999,
          background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
          fontSize: "0.72rem", color: "rgba(167,139,250,0.85)",
          letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
          Monthly subscription
        </div>

        <h1 style={{
          fontSize: "clamp(1.6rem, 5vw, 2.2rem)", fontWeight: 700,
          letterSpacing: "-0.03em", color: "#f0f0f8",
          margin: "0 0 10px", lineHeight: 1.15,
        }}>
          Unlock AI Image Generator
        </h1>

        <p style={{ color: "rgba(160,160,210,0.55)", fontSize: "0.95rem", margin: "0 0 32px" }}>
          Cancel anytime. Billed monthly.
        </p>

        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 22, padding: "clamp(20px, 5vw, 32px)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <span style={{ fontSize: "3rem", fontWeight: 700, color: "#f0f0f8", letterSpacing: "-0.04em", lineHeight: 1 }}>
              $9.99
            </span>
            <span style={{ fontSize: "0.9rem", color: "rgba(160,160,210,0.5)", paddingBottom: 6 }}>
              / month
            </span>
          </div>

          <ul style={{
            listStyle: "none", margin: 0, padding: 0,
            display: "flex", flexDirection: "column", gap: 10,
            width: "100%", textAlign: "left",
          }}>
            {[
              "Unlimited image generations",
              "AI-powered blending",
              "Download your results",
              "Cancel anytime",
            ].map((item) => (
              <li key={item} style={{
                display: "flex", alignItems: "center", gap: 10,
                fontSize: "0.88rem", color: "rgba(160,160,210,0.75)",
              }}>
                <span style={{ color: "#a78bfa", fontSize: "1rem", flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={handleBuy}
            disabled={!user}
            style={{
              width: "100%", padding: "13px 24px", borderRadius: 12,
              border: "none", fontWeight: 600, fontSize: "0.93rem",
              cursor: user ? "pointer" : "not-allowed",
              background: user
                ? "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)"
                : "rgba(255,255,255,0.05)",
              color: user ? "#fff" : "rgba(160,160,210,0.35)",
              boxShadow: user ? "0 0 28px rgba(124,58,237,0.3)" : "none",
              letterSpacing: "0.01em",
              transition: "opacity 0.2s",
            }}
          >
            {user ? "Subscribe — $9.99 / month" : "Loading…"}
          </button>
        </div>
      </div>
    </main>
  );
}
