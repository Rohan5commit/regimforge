# RegimeForge Architecture

## Overview

RegimeForge is a modular crypto strategy skill built in TypeScript. It consumes CoinMarketCap Agent Hub data, classifies market regimes using AI inference (NVIDIA NIM), generates structured backtestable trading strategies, and provides full explainability.

## System Flow

```
Market Data (CMC) → Signal Computation → AI Regime Classification → Strategy Generation → Validation → Critique → Backtest → Output
```

## Modules

### 1. Data Layer (`src/lib/cmc-client.ts`)
- Fetches market data from CoinMarketCap API
- Provides demo presets for BTC, ETH, SOL, BNB, DOGE
- Falls back to demo data when no API key is available

### 2. Signal Computation (`src/lib/regime.ts`)
- Computes deterministic signals from market context
- 5 signal dimensions: momentum, sentiment, volatility, derivatives, on-chain
- Each signal scored from -1 (bearish) to +1 (bullish)
- Provides pre-classification as a hint for AI

### 3. AI Inference (`src/lib/nim-client.ts`, `src/lib/prompts.ts`)
- NVIDIA NIM client using OpenAI-compatible API
- Structured prompts for regime classification, strategy generation, and critique
- JSON output with schema validation via zod
- Retry logic with temperature reduction on malformed output

### 4. Regime Classification
- 6 distinct regimes: TREND_UP, TREND_DOWN, MEAN_REVERT_UP, MEAN_REVERT_DOWN, HIGH_VOL_BREAKOUT, CHOP
- AI classifies based on computed signals and raw market data
- Deterministic fallback when AI is unavailable

### 5. Strategy Generation (`src/lib/runner.ts`)
- Generates structured strategy spec with quantifiable rules
- Entry/exit/invalidation rules must be evaluable from OHLCV data
- Sizing guidance and holding horizon
- Do-not-trade conditions

### 6. Validation (`src/lib/validator.ts`)
- Rejects vague rules (e.g., "buy when it feels right")
- Checks regime/direction consistency
- Validates confidence/sizing alignment
- Ensures backtestability

### 7. Backtesting (`src/lib/backtest.ts`)
- Technical indicators: SMA, EMA, RSI, ATR
- Rule evaluation per bar based on strategy regime
- Equity curve generation
- Performance metrics: return, drawdown, win rate, trade count
- Synthetic data generation per regime for demo

### 8. Explainability (`src/lib/explain.ts`)
- Signal weights and contributions
- Weak point identification
- Thesis invalidators
- Do-not-trade conditions

## Deployment
- Next.js 15 on Vercel
- API route at `/api/skill` for skill execution
- Static pages for demo and architecture
- Environment variables for NIM and CMC API keys
