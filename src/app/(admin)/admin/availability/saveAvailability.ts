"use client";

export async function saveAvailability(
  weekday: number,
  slots: { start: string; end: string }[]
) {
  const res = await fetch("/api/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weekday, slots }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed");
  return res.json();
}
