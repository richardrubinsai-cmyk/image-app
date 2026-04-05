"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setError("Missing session_id in URL.");
      return;
    }

    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated."); return; }

      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, user_id: user.id }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Payment verification failed.");
        return;
      }

      router.replace("/");
    })();
  }, [searchParams, router]);

  if (error) {
    return (
      <main style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px 16px", background: "#080810",
      }}>
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 16, padding: "24px 28px", maxWidth: 400, textAlign: "center",
        }}>
          <p style={{ color: "#f87171", fontWeight: 600, marginBottom: 8 }}>Verification failed</p>
          <p style={{ color: "rgba(248,113,113,0.65)", fontSize: "0.85rem", margin: 0 }}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px", background: "#080810",
    }}>
      <p style={{ color: "rgba(160,160,210,0.55)", fontSize: "0.95rem" }}>
        Verifying your payment…
      </p>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <main style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#080810",
      }}>
        <p style={{ color: "rgba(160,160,210,0.55)" }}>Loading…</p>
      </main>
    }>
      <PaymentSuccessInner />
    </Suspense>
  );
}
