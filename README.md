# RegimeForge

![CI](https://github.com/Rohan5commit/regimforge/actions/workflows/test.yml/badge.svg)

> AI-powered market regime detection and backtestable strategy generation for BNB Hack Track 2

**Tagline:** A CoinMarketCap-native AI strategy skill that detects crypto market regimes and emits backtestable trading rules.

## What is RegimeForge?

RegimeForge is a CoinMarketCap Agent Hub-compatible AI strategy skill built for **BNB Hack: AI Trading Agent Edition, Track 2 (Strategy Skills)**. It reads market data, classifies the market regime using AI inference (NVIDIA NIM), and generates a structured, backtestable trading strategy — complete with explainability and backtest results.

**This is not:**
- A trading chatbot
- A portfolio tracker
- A news summarizer
- A copy-trading app

**This is:**
- A regime-aware strategy skill
- A structured strategy spec generator
- A backtestable trading rule engine
- An explainable AI system for crypto trading

## How It Works

1. **Data Ingestion** — Consumes live market data from CoinMarketCap (price, volume, market cap, 24h high/low). Technical indicators (RSI, MACD, funding rate, fear/greed, on-chain flows) are estimated heuristically from available price/volume data when using the live CMC path; full indicator data available in demo mode.
2. **Signal Computation** — Computes deterministic signals across 5 dimensions: momentum, sentiment, volatility, derivatives, on-chain
3. **AI Regime Classification** — NVIDIA NIM classifies the market into one of 6 regimes
4. **Strategy Generation** — Generates a structured strategy spec with quantifiable entry/exit/invalidation rules
5. **Validation & Critique** — Deterministic validator rejects vague rules. AI critique loop identifies weaknesses
6. **Backtest** — Strategy is applied to historical data. Returns, drawdowns, win rates, and equity curves are produced
7. **Explainability** — Signal weights, reasoning, weak points, and thesis invalidators are shown for every output

## Regimes

| Regime | Description | Strategy |
|--------|-------------|----------|
| TREND_UP | Bullish momentum, price above MAs | Continuation long with pullback entries |
| TREND_DOWN | Bearish momentum, price below MAs | Continuation short with bounce entries |
| MEAN_REVERT_UP | Oversold bounce setup | Buy the bounce with tight stops |
| MEAN_REVERT_DOWN | Overbought reversal setup | Fade the rally with tight stops |
| HIGH_VOL_BREAKOUT | Volatility expansion with direction | Breakout entries with vol-based stops |
| CHOP | No clear direction | No trade — stay flat |

## Tech Stack

- **TypeScript** — Type-safe throughout
- **Next.js 15** — Demo web app
- **React** — UI components
- **Tailwind CSS v4** — Styling
- **Zod** — Schema validation
- **NVIDIA NIM** — AI inference (LLaMA 3.3 70B)
- **CoinMarketCap** — Market data source (live API returns price/volume/market cap; technical indicators estimated heuristically)

## Setup

```bash
# Clone
git clone https://github.com/Rohan5commit/regimforge.git
cd regimforge

# Install
npm install

# Environment
cp .env.example .env.local
# Add your NIM_API_KEY to .env.local

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NIM_API_KEY` | Yes | NVIDIA NIM API key |
| `CMC_API_KEY` | No | CoinMarketCap API key — live path returns price/volume/market cap only; technical indicators (RSI, MACD, funding rate, etc.) are heuristic estimates. Omit for demo mode with full indicator data. |

## Demo Flow

1. Select an asset (BTC, ETH, SOL, BNB, DOGE)
2. Toggle AI inference on/off
3. Click "Run Skill"
4. Inspect regime classification, strategy rules, explainability, and backtest results

## Project Structure

```
/
  src/
    ai/
      nim-client.ts       — NVIDIA NIM client with retry logic
    backtest/
      engine.ts           — Backtesting engine with unit-based position tracking
      metrics.ts          — Technical indicators (SMA, RSI, ATR)
      scenarios.ts        — Synthetic data generation for backtests
    data/
      adapters.ts         — Market data adapter layer
      cmc-client.ts       — CoinMarketCap API client
    lib/
      utils.ts            — Shared utilities
    orchestration/
      runner.ts           — Full orchestration pipeline
      critique-loop.ts    — AI strategy critique and regeneration
    regime/
      classifier.ts       — Regime classification engine
      classifiers.ts      — Zod schemas for strategy spec, market context, results
      features.ts         — Feature extraction from market data
      validators.ts       — Deterministic rule validation
    skill/
      cmc-skill.ts        — CoinMarketCap Agent Hub skill interface
      parser.ts           — Skill input/output parsing
      prompts.ts          — Structured AI prompts (regime, strategy, critique)
    ui/
      charts.tsx          — Equity curve and chart components
      inspectors.ts       — Output inspectors for regime, strategy, backtest
    app/
      page.tsx            — Main demo page
      layout.tsx          — Root layout
      globals.css         — Global styles (Tailwind v4)
      api/skill/route.ts  — Skill execution API endpoint
      architecture/       — Judge-facing architecture page
    __tests__/
      backtest.test.ts    — Backtest engine tests
      regime.test.ts      — Regime classification tests
      schemas.test.ts     — Schema validation tests
      validator.test.ts   — Rule validation tests
  docs/                   — Documentation
  README.md
```

## Documentation

- [Architecture](docs/architecture.md) — System architecture overview
- [Strategy Methodology](docs/strategy.md) — Regime classification and trading logic
- [CMC Skill Interface](docs/cmc-skill.md) — Input/output schemas and API
- [Demo Script](docs/demo-script.md) — 2-3 minute judge walkthrough
- [Setup Guide](docs/setup.md) — Installation and deployment
- [Prompts Used](docs/prompts-used.md) — AI prompt documentation
- [Build Log](docs/ai-build-log.md) — Development journal
- [Judging Hook](docs/judging-hook.md) — Why this should win
- [Credits](docs/credits.md) — Acknowledgments

## Limitations

- Demo uses synthetic historical data for backtesting (not live CMC historical data)
- AI inference requires NVIDIA NIM API key
- No live trading execution (Track 2 deliverable is a strategy spec, not an execution stack)
- Regime classification is approximate — not financial advice

## Future Work

- Real CMC historical OHLCV data for backtesting
- Multi-asset correlation analysis
- Portfolio-level strategy aggregation
- Live signal monitoring and alerting
- Integration with on-chain execution layers
- Community strategy sharing and rating

## License

MIT
