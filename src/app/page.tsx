"use client";

import { useState } from "react";
import { DEMO_PRESETS } from "@/lib/cmc-client";
import type { SkillOutput } from "@/lib/schemas";

const PRESETS = Object.keys(DEMO_PRESETS);

const REGIME_COLORS: Record<string, string> = {
  TREND_UP: "text-emerald-400",
  TREND_DOWN: "text-red-400",
  MEAN_REVERT_UP: "text-blue-400",
  MEAN_REVERT_DOWN: "text-orange-400",
  HIGH_VOL_BREAKOUT: "text-yellow-400",
  CHOP: "text-zinc-400",
};

const REGIME_BG: Record<string, string> = {
  TREND_UP: "bg-emerald-500/10 border-emerald-500/20",
  TREND_DOWN: "bg-red-500/10 border-red-500/20",
  MEAN_REVERT_UP: "bg-blue-500/10 border-blue-500/20",
  MEAN_REVERT_DOWN: "bg-orange-500/10 border-orange-500/20",
  HIGH_VOL_BREAKOUT: "bg-yellow-500/10 border-yellow-500/20",
  CHOP: "bg-zinc-500/10 border-zinc-500/20",
};

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState<string>("BTC");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(true);

  const runSkill = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset: selectedPreset, useAI, runBacktest: true, backtestBars: 200 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold text-sm">
            RF
          </div>
          <h1 className="text-2xl font-bold tracking-tight">RegimeForge</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Track 2 · Strategy Skills
          </span>
        </div>
        <p className="text-zinc-400 text-sm">
          AI-powered market regime detection and backtestable strategy generation for BNB Hack
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 mb-8 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Asset</label>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPreset(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedPreset === p
                    ? "bg-emerald-500 text-black"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">AI Inference</label>
          <button
            onClick={() => setUseAI(!useAI)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              useAI ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {useAI ? "NIM Enabled" : "Deterministic Only"}
          </button>
        </div>
        <button
          onClick={runSkill}
          disabled={loading}
          className="px-6 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Run Skill"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-8">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Regime Badge */}
          <div className={`p-6 rounded-xl border ${REGIME_BG[result.strategy.regime]}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Detected Regime</p>
                <h2 className={`text-3xl font-bold ${REGIME_COLORS[result.strategy.regime]}`}>
                  {result.strategy.regime.replace(/_/g, " ")}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Confidence</p>
                <p className="text-2xl font-bold">{(result.strategy.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 rounded-full bg-zinc-800/50 text-sm">
                Direction: <strong>{result.strategy.directional_bias}</strong>
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-800/50 text-sm">
                Setup: <strong>{result.strategy.setup_name}</strong>
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-800/50 text-sm">
                Sizing: <strong>{result.strategy.sizing_guidance}</strong>
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-800/50 text-sm">
                Horizon: <strong>{result.strategy.holding_horizon}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Rules */}
            <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Strategy Rules</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-emerald-400 font-medium mb-1">Entry Rules</p>
                  <ul className="space-y-1">
                    {result.strategy.entry_rules.map((r, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">→</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-red-400 font-medium mb-1">Exit Rules</p>
                  <ul className="space-y-1">
                    {result.strategy.exit_rules.map((r, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">←</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-orange-400 font-medium mb-1">Invalidation Rules</p>
                  <ul className="space-y-1">
                    {result.strategy.invalidation_rules.map((r, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">✕</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Explainability */}
            <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Explainability</h3>
              <p className="text-sm text-zinc-300 mb-4">{result.explanation.regime_reasoning}</p>

              <div className="space-y-2 mb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Signal Weights</p>
                {result.explanation.signal_weights.map((sw) => (
                  <div key={sw.signal} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 w-20">{sw.signal}</span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${sw.weight * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 w-10 text-right">{(sw.weight * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>

              {result.explanation.weak_points.length > 0 && (
                <div>
                  <p className="text-xs text-yellow-400 font-medium mb-1">Weak Points</p>
                  <ul className="space-y-1">
                    {result.explanation.weak_points.map((wp, i) => (
                      <li key={i} className="text-xs text-zinc-400">⚠️ {wp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Backtest */}
          {result.backtest && (
            <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Backtest Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <StatCard label="Total Return" value={`${result.backtest.total_return > 0 ? "+" : ""}${result.backtest.total_return.toFixed(2)}%`} positive={result.backtest.total_return > 0} />
                <StatCard label="Max Drawdown" value={`-${result.backtest.max_drawdown.toFixed(2)}%`} positive={false} />
                <StatCard label="Win Rate" value={`${result.backtest.win_rate.toFixed(0)}%`} positive={result.backtest.win_rate > 50} />
                <StatCard label="Trades" value={String(result.backtest.trade_count)} positive={result.backtest.trade_count > 0} />
                <StatCard label="Avg Holding" value={result.backtest.avg_holding_period} positive={true} />
              </div>
              <p className="text-sm text-zinc-400">{result.backtest.summary}</p>

              {/* Equity curve */}
              {result.backtest.equity_curve.length > 1 && (
                <div className="mt-4">
                  <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Equity Curve</p>
                  <EquityCurve data={result.backtest.equity_curve} />
                </div>
              )}
            </div>
          )}

          {/* Evidence & Rationale */}
          <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Evidence & Rationale</h3>
            <p className="text-sm text-zinc-300 mb-3">{result.strategy.rationale}</p>
            <div className="flex flex-wrap gap-2">
              {result.strategy.evidence_summary.map((e, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400">{e}</span>
              ))}
            </div>
            {result.strategy.do_not_trade_conditions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-zinc-500 mb-1">Do Not Trade When:</p>
                <ul className="space-y-1">
                  {result.strategy.do_not_trade_conditions.map((c, i) => (
                    <li key={i} className="text-xs text-zinc-400">🚫 {c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Indicators */}
          <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Indicators Used</h3>
            <div className="flex flex-wrap gap-2">
              {result.strategy.indicators_used.map((ind, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">{ind}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-500 text-2xl">⚡</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">Select an asset and run the skill</h2>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            RegimeForge will classify the market regime, generate a structured strategy spec,
            and produce backtestable rules — all powered by NVIDIA NIM AI inference.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-[var(--border)] text-center text-xs text-zinc-600">
        RegimeForge · BNB Hack: AI Trading Agent Edition · Track 2: Strategy Skills
      </footer>
    </div>
  );
}

function StatCard({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-zinc-800/50">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${positive ? "text-emerald-400" : "text-zinc-300"}`}>{value}</p>
    </div>
  );
}

function EquityCurve({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 800;
  const height = 120;
  const padding = 4;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = padding + (1 - (v - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const lastVal = data[data.length - 1];
  const firstVal = data[0];
  const isPositive = lastVal >= firstVal;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
      <defs>
        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${padding},${height - padding} ${points.join(" ")} ${width - padding},${height - padding}`}
        fill="url(#eqGrad)"
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"}
        strokeWidth="2"
      />
    </svg>
  );
}
