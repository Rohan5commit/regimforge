"use client";
import type { SkillOutput, StrategySpec } from "@/regime/classifiers";
import { EquityCurve, StatCard } from "@/ui/charts";

const REGIME_COLORS: Record<string, string> = { TREND_UP: "text-emerald-400", TREND_DOWN: "text-red-400", MEAN_REVERT_UP: "text-blue-400", MEAN_REVERT_DOWN: "text-orange-400", HIGH_VOL_BREAKOUT: "text-yellow-400", CHOP: "text-zinc-400" };
const REGIME_BG: Record<string, string> = { TREND_UP: "bg-emerald-500/10 border-emerald-500/20", TREND_DOWN: "bg-red-500/10 border-red-500/20", MEAN_REVERT_UP: "bg-blue-500/10 border-blue-500/20", MEAN_REVERT_DOWN: "bg-orange-500/10 border-orange-500/20", HIGH_VOL_BREAKOUT: "bg-yellow-500/10 border-yellow-500/20", CHOP: "bg-zinc-500/10 border-zinc-500/20" };

/** Regime overview card with detected regime, confidence, and key parameters. */
export function RegimeCard({ strategy }: { strategy: StrategySpec }) {
  return (
    <div className={`p-6 rounded-xl border ${REGIME_BG[strategy.regime]}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Detected Regime</p>
          <h2 className={`text-3xl font-bold ${REGIME_COLORS[strategy.regime]}`}>{strategy.regime.replace(/_/g, " ")}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Confidence</p>
          <p className="text-2xl font-bold">{(strategy.confidence * 100).toFixed(0)}%</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <span className="px-3 py-1 rounded-full bg-zinc-800/50 text-sm">Direction: <strong>{strategy.directional_bias}</strong></span>
        <span className="px-3 py-1 rounded-full bg-zinc-800/50 text-sm">Setup: <strong>{strategy.setup_name}</strong></span>
        <span className="px-3 py-1 rounded-full bg-zinc-800/50 text-sm">Sizing: <strong>{strategy.sizing_guidance}</strong></span>
        <span className="px-3 py-1 rounded-full bg-zinc-800/50 text-sm">Horizon: <strong>{strategy.holding_horizon}</strong></span>
      </div>
    </div>
  );
}

/** Strategy rules panel with entry, exit, and invalidation rules. */
export function StrategyRules({ strategy }: { strategy: StrategySpec }) {
  return (
    <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Strategy Rules</h3>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-emerald-400 font-medium mb-1">Entry Rules</p>
          <ul className="space-y-1">{strategy.entry_rules.map((r, i) => <li key={i} className="text-sm text-zinc-300 flex items-start gap-2"><span className="text-emerald-500 mt-0.5">→</span> {r}</li>)}</ul>
        </div>
        <div>
          <p className="text-xs text-red-400 font-medium mb-1">Exit Rules</p>
          <ul className="space-y-1">{strategy.exit_rules.map((r, i) => <li key={i} className="text-sm text-zinc-300 flex items-start gap-2"><span className="text-red-500 mt-0.5">←</span> {r}</li>)}</ul>
        </div>
        <div>
          <p className="text-xs text-orange-400 font-medium mb-1">Invalidation Rules</p>
          <ul className="space-y-1">{strategy.invalidation_rules.map((r, i) => <li key={i} className="text-sm text-zinc-300 flex items-start gap-2"><span className="text-orange-500 mt-0.5">✕</span> {r}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

/** Validation warnings panel. */
export function ValidationPanel({ validation }: { validation: SkillOutput["validation"] }) {
  if (!validation || (validation.issues.length === 0 && validation.warnings.length === 0)) return null;
  return (
    <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Strategy Validation</h3>
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${validation.valid ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${validation.valid ? "bg-yellow-500" : "bg-red-500"}`}></div>
        {validation.valid ? "Valid with warnings" : "Issues found"}
      </div>
      <div className="space-y-2">
        {validation.issues.map((issue, i) => (
          <div key={`issue-${i}`} className="flex items-start gap-2">
            <span className="text-red-400 text-xs mt-0.5">✗</span>
            <span className="text-zinc-400 text-xs">{issue}</span>
          </div>
        ))}
        {validation.warnings.map((warn, i) => (
          <div key={`warn-${i}`} className="flex items-start gap-2">
            <span className="text-yellow-400 text-xs mt-0.5">⚠</span>
            <span className="text-zinc-400 text-xs">{warn}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Explainability panel with signal weights and weak points. */
export function ExplainabilityPanel({ explanation }: { explanation: SkillOutput["explanation"] }) {
  return (
    <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Explainability</h3>
      <p className="text-sm text-zinc-300 mb-4">{explanation.regime_reasoning}</p>
      <div className="space-y-2 mb-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">Signal Weights</p>
        {explanation.signal_weights.map(sw => (
          <div key={sw.signal} className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 w-20">{sw.signal}</span>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sw.weight * 100}%` }} />
            </div>
            <span className="text-xs text-zinc-500 w-10 text-right">{(sw.weight * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
      {explanation.weak_points.length > 0 && (
        <div>
          <p className="text-xs text-yellow-400 font-medium mb-1">Weak Points</p>
          <ul className="space-y-1">{explanation.weak_points.map((wp, i) => <li key={i} className="text-xs text-zinc-400">⚠️ {wp}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

/** Backtest results panel with multi-seed stats, metrics, and equity curve. */
export function BacktestPanel({ backtest }: { backtest: NonNullable<SkillOutput["backtest"]> }) {
  return (
    <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Backtest Results</h3>
      {backtest.multi_seed_stats && (
        <div className="mb-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <span className="text-xs font-medium text-zinc-300">Multi-Seed Distribution ({backtest.multi_seed_stats.runs} runs)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><span className="text-[10px] text-zinc-500 uppercase">Min</span><p className={`text-sm font-semibold ${backtest.multi_seed_stats.min_return >= 0 ? "text-emerald-400" : "text-red-400"}`}>{backtest.multi_seed_stats.min_return.toFixed(1)}%</p></div>
            <div><span className="text-[10px] text-zinc-500 uppercase">Median</span><p className={`text-sm font-semibold ${backtest.multi_seed_stats.median_return >= 0 ? "text-emerald-400" : "text-red-400"}`}>{backtest.multi_seed_stats.median_return.toFixed(1)}%</p></div>
            <div><span className="text-[10px] text-zinc-500 uppercase">Max</span><p className={`text-sm font-semibold ${backtest.multi_seed_stats.max_return >= 0 ? "text-emerald-400" : "text-red-400"}`}>{backtest.multi_seed_stats.max_return.toFixed(1)}%</p></div>
            <div><span className="text-[10px] text-zinc-500 uppercase">Range</span><p className="text-sm font-semibold text-zinc-300">{backtest.multi_seed_stats.return_range.toFixed(1)}%</p></div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Deterministic synthetic scenarios for reproducible backtesting across different random seeds.</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
        <StatCard label="Return" value={`${backtest.total_return > 0 ? "+" : ""}${backtest.total_return.toFixed(2)}%`} positive={backtest.total_return > 0} />
        <StatCard label="Drawdown" value={`-${backtest.max_drawdown.toFixed(2)}%`} positive={false} />
        <StatCard label="Win Rate" value={`${backtest.win_rate.toFixed(0)}%`} positive={backtest.win_rate > 50} />
        <StatCard label="Trades" value={String(backtest.trade_count)} positive={backtest.trade_count > 0} />
        <StatCard label="Holding" value={backtest.avg_holding_period} positive={true} />
      </div>
      <p className="text-sm text-zinc-400">{backtest.summary}</p>
      {backtest.equity_curve.length > 1 && (
        <div className="mt-4">
          <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Equity Curve</p>
          <EquityCurve data={backtest.equity_curve} />
        </div>
      )}
    </div>
  );
}

/** Evidence, rationale, and do-not-trade conditions panel. */
export function EvidencePanel({ strategy }: { strategy: StrategySpec }) {
  return (
    <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Evidence & Rationale</h3>
      <p className="text-sm text-zinc-300 mb-3">{strategy.rationale}</p>
      <div className="flex flex-wrap gap-2">{strategy.evidence_summary.map((e, i) => <span key={i} className="px-2.5 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400">{e}</span>)}</div>
      {strategy.do_not_trade_conditions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-zinc-500 mb-1">Do Not Trade When:</p>
          <ul className="space-y-1">{strategy.do_not_trade_conditions.map((c, i) => <li key={i} className="text-xs text-zinc-400">🚫 {c}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

/** Indicators used panel. */
export function IndicatorsPanel({ strategy }: { strategy: StrategySpec }) {
  return (
    <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Indicators Used</h3>
      <div className="flex flex-wrap gap-2">{strategy.indicators_used.map((ind, i) => <span key={i} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">{ind}</span>)}</div>
    </div>
  );
}
