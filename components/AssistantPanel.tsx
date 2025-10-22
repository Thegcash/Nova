"use client";
import React from "react";

export default function AssistantPanel() {
  const [input, setInput] = React.useState("");
  const [reply, setReply] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSend() {
    setError(null);
    setReply(null);
    const msg = input.trim();
    if (!msg) return;
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setReply(data.reply);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-6 py-4 border-b" style={{ borderColor: "var(--line)" }}>
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask ChatGPT about fleet status…"
          className="flex-1 border rounded-full px-4 py-2 text-[14px]"
          style={{ borderColor: "var(--line)" }}
        />
        <button className="btn-ghost" onClick={onSend} disabled={loading}>
          {loading ? "…" : "➤"}
        </button>
      </div>
      {error && <div className="mt-2 text-red-600 text-sm">Error: {error}</div>}
      {reply && (
        <div className="mt-3 text-[14px] p-3 border rounded-xl bg-[var(--panel)]" style={{ borderColor: "var(--line)" }}>
          {reply}
        </div>
      )}
    </div>
  );
}
