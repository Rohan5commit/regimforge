"use client";
import { useState } from "react";
import Link from "next/link";
import { DEMO_PRESETS } from "@/data/cmc-client";
import type { SkillOutput } from "@/regime/classifiers";
import { RegimeCard, StrategyRules, ValidationPanel, ExplainabilityPanel, BacktestPanel, EvidencePanel, IndicatorsPanel } from "@/ui/dashboard-components";

const PRESETS = Object.keys(DEMO_PRESETS);

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState("BTC");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(true);
  const runSkill = async () => { setLoading(true); setError(null); try { const res = await fetch("/api/skill", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preset: selectedPreset, useAI, runBacktest: true, backtestBars: 200 }) }); if (!res.ok) throw new Error(`HTTP ${res.status}`); setResult(await res.json()); } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); } finally { setLoading(false); } };
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8"><div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold text-sm">RF</div><h1 className="text-2xl font-bold tracking-tight">RegimeForge</h1><span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Track 2 · Strategy Skills</span></div><p className="text-zinc-400 text-sm">AI-powered market regime detection and backtestable strategy generation</p></header>
      <div className="flex flex-wrap items-end gap-4 mb-8 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
        <div><label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Asset</label><div className="flex gap-2">{PRESETS.map(p => <button key={p} onClick={() => setSelectedPreset(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedPreset === p ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>{p}</button>)}</div></div>
        <div className="flex items-center gap-2"><label className="text-xs text-zinc-500 uppercase tracking-wider">AI</label><button onClick={() => setUseAI(!useAI)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${useAI ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"}`}>{useAI ? "NIM Enabled" : "Deterministic"}</button></div>
        <Link href="/architecture" className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm font-medium transition-all">Architecture →</Link>
        <button onClick={runSkill} disabled={loading || !selectedPreset} className="px-6 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-all disabled:opacity-50">{loading ? "Analyzing..." : "Run Skill"}</button>
      </div>
      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-8">{error}</div>}
      {result && (
        <div className="space-y-6">
          <RegimeCard strategy={result.strategy} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StrategyRules strategy={result.strategy} />
            <ValidationPanel validation={result.validation} />
            <ExplainabilityPanel explanation={result.explanation} />
          </div>
          {result.backtest && <BacktestPanel backtest={result.backtest} />}
          <EvidencePanel strategy={result.strategy} />
          <IndicatorsPanel strategy={result.strategy} />
        </div>
      )}
      {!result && !loading && !error && <div className="text-center py-20"><div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"><span className="text-emerald-500 text-2xl">⚡</span></div><h2 className="text-lg font-semibold mb-2">Select an asset and run the skill</h2><p className="text-sm text-zinc-500 max-w-md mx-auto">RegimeForge classifies market regimes, generates structured strategy specs, and produces backtestable rules — all powered by NVIDIA NIM AI.</p></div>}
      <footer className="mt-12 pt-6 border-t border-[var(--border)] text-center text-xs text-zinc-600">RegimeForge · BNB Hack: AI Trading Agent Edition · Track 2</footer>
    </div>
  );
}
