# AI Build Log

## Session 1: Project Setup
- Created GitHub repo
- Set up Next.js 15 with TypeScript, Tailwind v4, zod
- Configured project structure

## Session 2: Core Library
- Built schema definitions (zod) for strategy spec, market context, backtest results
- Implemented NVIDIA NIM client with retry logic
- Created structured prompts for regime classification, strategy generation, critique
- Built regime classification engine with 5 signal dimensions
- Implemented deterministic regime pre-classification
- Built strategy generation with fallback deterministic paths
- Created rule validator for backtestability
- Built backtesting engine with SMA, EMA, RSI, ATR indicators
- Implemented explainability layer with signal weights
- Created CMC data adapter with demo presets

## Session 3: Demo App
- Built main demo page with asset selector, strategy viewer, backtest charts
- Created architecture page for judges
- Built API route for skill execution
- Designed dark theme with emerald accent colors

## Session 4: Documentation & Testing
- Wrote architecture, strategy, CMC skill, demo script, setup docs
- Added unit tests for schemas, regime signals, backtest, validator
- Created README with comprehensive project information

## Key Decisions
- TypeScript-only (no Python in core path)
- NVIDIA NIM for all AI inference (OpenAI-compatible API)
- Demo presets for instant demo without CMC API key
- Deterministic fallback when AI is unavailable
- Synthetic data generation for backtest demo
- Schema validation at every AI output boundary
