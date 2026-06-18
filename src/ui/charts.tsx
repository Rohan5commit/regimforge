"use client";
import React from "react";

export function EquityCurve({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const w = 800, h = 120, pad = 4;
  const points = data.map((v, i) => `${pad + (i / (data.length - 1)) * (w - 2 * pad)},${pad + (1 - (v - min) / range) * (h - 2 * pad)}`);
  const isPos = data[data.length - 1] >= data[0];
  const color = isPos ? "#22c55e" : "#ef4444";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      <defs><linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`${pad},${h - pad} ${points.join(" ")} ${w - pad},${h - pad}`} fill="url(#eqGrad)" />
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function StatCard({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (<div className="p-3 rounded-lg bg-zinc-800/50"><p className="text-xs text-zinc-500 mb-1">{label}</p><p className={`text-lg font-bold ${positive ? "text-emerald-400" : "text-zinc-300"}`}>{value}</p></div>);
}