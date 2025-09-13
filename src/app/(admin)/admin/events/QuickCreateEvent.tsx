"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuickCreateEvent() {
  const r = useRouter();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(""); // from <input type="datetime-local">
  const [end, setEnd] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        start: start ? new Date(start).toISOString() : "",
        end:   end   ? new Date(end).toISOString()   : "",
      }),
    });
    if (!res.ok) { setErr((await res.json()).error || "Failed"); return; }
    setTitle(""); setStart(""); setEnd("");
    r.refresh();
  }

  return (
    <div className="space-y-2">
      <input className="border p-2 w-full" placeholder="Title"
        value={title} onChange={e=>setTitle(e.target.value)} />
      <input className="border p-2 w-full" type="datetime-local"
        value={start} onChange={e=>setStart(e.target.value)} />
      <input className="border p-2 w-full" type="datetime-local"
        value={end} onChange={e=>setEnd(e.target.value)} />
      <button className="border px-3 py-2" onClick={submit}>Create event</button>
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </div>
  );
}
