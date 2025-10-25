"use client";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const [msg, setMsg] = useState("Verifying…");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setMsg("Missing token."); return; }

    fetch(`/api/verify?token=${encodeURIComponent(token)}`)
      .then(async r => ({ ok: r.ok, j: await r.json() }))
      .then(({ ok }) => setMsg(ok ? "Email confirmed. Thanks!" : "Invalid or expired link."))
      .catch(() => setMsg("Something went wrong."));
  }, []);

  return <main className="min-h-dvh flex items-center justify-center p-8 text-lg">{msg}</main>;
}
