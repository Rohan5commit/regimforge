"use client";

import Link from "next/link";

const SECTIONS = [
  {
    title: "What is RegimeForge?",
    content:
      "RegimeForge is a CoinMarketCap-native AI strategy skill built for BNB Hack Track 2. It classifies crypto market regimes using multi-signal analysis and generates structured, backtestable trading strategies — not a chatbot, not a portfolio tracker, not a news summarizer.",
  },
  {
    title: "How It Works",
    steps: [
      { label: "Data Ingestion", desc: "Consumes market data from CoinMarketCap Agent Hub — price, volume, RSI, funding rate, fear/greed, social volume, on-chain flows." },
      { label: "Signal Computation", desc: "Computes deterministic signals: momentum, sentiment, volatility, derivatives, and on-chain scores from -1 to +1." },
      { label: "AI Regime Classification", desc: "NVIDIA NIM (LLaMA 3.3 70B) classifies the market into one of 6 regimes: TREND_UP, TREND_DOWN, MEAN_REVERT_UP, MEAN_REVERT_DOWN, HIGH_VOL_BREAKOUT, or CHOP." },
      { label: "Strategy Generation", desc: "NIM generates a structured strategy spec with quantifiable entry/exit/invalidation rules, sizing guidance, and holding horizon." },
      { label: "Validation & Critique", desc: "Deterministic rule validator checks backtestability. Vague rules are rejected. AI critique loop identifies weaknesses." },
      { label: "Backtest", desc: "Generated strategy is applied to synthetic historical data mimicking the detected regime. Outputs return, drawdown, win rate, trade count, and equity curve." },
      { label: "Explainability", desc: "Every output includes signal weights, reasoning, weak points, and thesis invalidators — enough for a human to inspect and trust." },
    ],
  },
  {
    title: "Architecture",
    content: "Modular TypeScript architecture with clean separation:",
    modules: [
      { name: "src/lib/schemas.ts", desc: "Zod-validated strategy spec, market context, and backtest schemas" },
      { name: "src/lib/regime.ts", desc: "Deterministic signal computation and pre-classification" },
      { name: "src/lib/prompts.ts", desc: "Structured AI prompts for regime classification, strategy generation, and critique" },
      { name: "src/lib/nim-client.ts", desc: "NVIDIA NIM client with retry logic and schema validation" },
      { name: "src/lib/runner.ts", desc: "Full orchestration pipeline: context → regime → strategy → validate → critique → backtest" },
      { name: "src/lib/backtest.ts", desc: "Technical indicator computation and backtesting engine" },
      { name: "src/lib/validator.ts", desc: "Deterministic rule validation for backtestability" },
      { name: "src/lib/explain.ts", desc: "Explainability layer with signal weights and reasoning" },
      { name: "src/lib/cmc-client.ts", desc: "CoinMarketCap data adapter with demo presets" },
    ],
  },
  {
    title: "Why This Is More Than a Prompt Wrapper",
    points: [
      "Deterministic signal pre-processing happens BEFORE AI inference — the AI doesn't start from nothing",
      "Schema-validated outputs with zod — no free-text prose that can't be evaluated",
      "Deterministic rule validator rejects vague strategies that can't be backtested",
      "AI critique loop identifies and fixes weaknesses before the output reaches the user",
      "Backtesting engine with technical indicators proves the strategy is quantifiable",
      "Explainability layer with signal weights shows exactly why each decision was made",
      "6 distinct regimes, not a binary bull/bear classification",
      "Fallback to deterministic classification when AI is unavailable — the system never produces empty output",
    ],
  },
  {
    title: "Why This Should Win Track 2",
    points: [
      "Clear Track 2 deliverable: a CMC Skill that produces a backtestable strategy spec",
      "Strong use of CoinMarketCap Agent Hub as the data and skill interface layer",
      "Real AI inference via NVIDIA NIM, not cosmetic AI — it drives regime classification and strategy generation",
      "Complete explainability: every decision is auditable with signal weights and reasoning",
      "Working backtest with equity curves, trade stats, and performance summaries",
      "Production-quality demo: one-click presets, instant results, clean dark UI",
      "Comprehensive documentation: architecture, strategy methodology, demo script, judge-facing explanation",
    ],
  },
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          ← Back to Demo
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-2">Architecture</h1>
        <p className="text-zinc-400 text-sm">
          How RegimeForge works and why it should win Track 2
        </p>
      </header>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <div key={section.title} className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
            {section.content && <p className="text-sm text-zinc-300 mb-3">{section.content}</p>}
            {section.steps && (
              <div className="space-y-3">
                {section.steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{step.label}</p>
                      <p className="text-xs text-zinc-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {section.modules && (
              <div className="space-y-2">
                {section.modules.map((mod) => (
                  <div key={mod.name} className="flex gap-3 items-start">
                    <code className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                      {mod.name}
                    </code>
                    <span className="text-xs text-zinc-400">{mod.desc}</span>
                  </div>
                ))}
              </div>
            )}
            {section.points && (
              <ul className="space-y-1.5">
                {section.points.map((point, i) => (
                  <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span> {point}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
