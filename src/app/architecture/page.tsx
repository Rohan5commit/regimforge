"use client";
import Link from "next/link";
const SECTIONS = [
  { title: "What is RegimeForge?", content: "A CoinMarketCap-native AI strategy skill for BNB Hack Track 2. Classifies crypto market regimes and generates structured, backtestable trading strategies." },
  { title: "How It Works", steps: [
    { label: "Data Ingestion", desc: "Consumes CMC Agent Hub market data — price, volume, RSI, funding rate, fear/greed, social volume, on-chain flows." },
    { label: "Signal Computation", desc: "Deterministic signals: momentum, sentiment, volatility, derivatives, on-chain (-1 to +1)." },
    { label: "AI Regime Classification", desc: "NVIDIA NIM classifies market into 6 regimes: TREND_UP/DOWN, MEAN_REVERT_UP/DOWN, HIGH_VOL_BREAKOUT, CHOP." },
    { label: "Strategy Generation", desc: "Structured strategy spec with quantifiable entry/exit/invalidation rules, sizing, and horizon." },
    { label: "Validation & Critique", desc: "Deterministic validator checks backtestability. AI critique loop identifies weaknesses." },
    { label: "Backtest", desc: "Strategy applied to synthetic historical data. Returns drawdown, win rate, trade count, equity curve." },
    { label: "Explainability", desc: "Signal weights, reasoning, weak points, and thesis invalidators for every output." },
  ]},
  { title: "Architecture", content: "Modular TypeScript:", modules: [
    { name: "src/skill/cmc-skill.ts", desc: "Core CMC Skill entry point" },
    { name: "src/skill/prompts.ts", desc: "Structured AI prompts" },
    { name: "src/skill/parser.ts", desc: "AI output parser + deterministic fallback" },
    { name: "src/regime/classifiers.ts", desc: "Zod-validated schemas" },
    { name: "src/regime/classifier.ts", desc: "Regime classification" },
    { name: "src/regime/features.ts", desc: "Signal computation" },
    { name: "src/regime/validators.ts", desc: "Rule validation" },
    { name: "src/backtest/engine.ts", desc: "Backtesting engine" },
    { name: "src/backtest/metrics.ts", desc: "Technical indicators" },
    { name: "src/backtest/scenarios.ts", desc: "Synthetic data + presets" },
    { name: "src/ai/nim-client.ts", desc: "NVIDIA NIM client" },
    { name: "src/ai/schemas.ts", desc: "AI response schemas" },
    { name: "src/orchestration/runner.ts", desc: "Pipeline orchestration" },
    { name: "src/orchestration/critique-loop.ts", desc: "AI critique loop" },
    { name: "src/data/cmc-client.ts", desc: "CMC data adapter" },
    { name: "src/data/adapters.ts", desc: "Data transformers" },
    { name: "src/ui/charts.tsx", desc: "Equity curve + stat cards" },
    { name: "src/ui/inspectors.ts", desc: "Explainability builder" },
  ]},
  { title: "Why This Is More Than a Prompt Wrapper", points: [
    "Deterministic signal pre-processing BEFORE AI inference",
    "Schema-validated outputs with zod",
    "Validator rejects vague strategies",
    "AI critique loop catches weak strategies",
    "Backtesting proves quantifiability",
    "Explainability with signal weights",
    "6 distinct regimes",
    "Deterministic fallback when AI unavailable",
  ]},
  { title: "Why This Should Win Track 2", points: [
    "CMC Skill delivers backtestable strategy spec",
    "Strong CMC Agent Hub integration",
    "Real NVIDIA NIM AI inference",
    "Complete explainability",
    "Working backtest with equity curves",
    "Production-quality demo",
    "Comprehensive documentation",
  ]},
];
export default function ArchitecturePage() {
  return (<div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto"><header className="mb-8"><Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300">← Back to Demo</Link><h1 className="text-2xl font-bold mt-4 mb-2">Architecture</h1><p className="text-zinc-400 text-sm">How RegimeForge works and why it should win Track 2</p></header><div className="space-y-8">{SECTIONS.map(s => (<div key={s.title} className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]"><h2 className="text-lg font-semibold mb-3">{s.title}</h2>{s.content && <p className="text-sm text-zinc-300 mb-3">{s.content}</p>}{s.steps && <div className="space-y-3">{s.steps.map((step, i) => <div key={i} className="flex gap-3"><span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span><div><p className="text-sm font-medium text-zinc-200">{step.label}</p><p className="text-xs text-zinc-400">{step.desc}</p></div></div>)}</div>}{s.modules && <div className="space-y-2">{s.modules.map(m => <div key={m.name} className="flex gap-3 items-start"><code className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">{m.name}</code><span className="text-xs text-zinc-400">{m.desc}</span></div>)}</div>}{s.points && <ul className="space-y-1.5">{s.points.map((p, i) => <li key={i} className="text-sm text-zinc-300 flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> {p}</li>)}</ul>}</div>))}</div></div>);
}