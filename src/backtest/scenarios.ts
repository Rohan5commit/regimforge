import type { Regime } from "@/regime/classifiers";
import type { OHLCVBar } from "@/backtest/metrics";

// Simple seeded PRNG (mulberry32) for deterministic backtests
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Generate synthetic OHLCV data for a given regime.
 *
 * This produces deterministic, regime-favorable data for reproducible backtesting.
 * The data is seeded from the regime name + bar count, ensuring the same inputs
 * always produce the same output — a research virtue for reproducibility.
 *
 * For robustness, use `generateSyntheticDataMultiple` to run across N seeds
 * and get a distribution of outcomes.
 */
export function generateSyntheticData(regime: Regime, bars: number = 200, seedOffset: number = 0): OHLCVBar[] {
  const data: OHLCVBar[] = [];
  // Deterministic seed based on regime name + bar count + optional offset
  const seed = (regime.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 1000 + bars) + seedOffset;
  const random = mulberry32(seed);
  let price = 100;
  const now = Date.now();
  const barInterval = 4 * 60 * 60 * 1000;
  for (let i = 0; i < bars; i++) {
    let drift = 0, vol = 0.02;
    switch (regime) {
      case "TREND_UP": drift = 0.003; vol = 0.015; break;
      case "TREND_DOWN": drift = -0.003; vol = 0.015; break;
      case "MEAN_REVERT_UP": drift = 0.001; vol = 0.025; break;
      case "MEAN_REVERT_DOWN": drift = -0.001; vol = 0.025; break;
      case "HIGH_VOL_BREAKOUT": drift = (i % 40 < 20 ? 0.005 : -0.003); vol = 0.04; break;
      case "CHOP": drift = 0; vol = 0.01; break;
    }
    const change = drift + vol * (random() * 2 - 1);
    const open = price;
    price = price * (1 + change);
    const high = Math.max(open, price) * (1 + random() * vol * 0.5);
    const low = Math.min(open, price) * (1 - random() * vol * 0.5);
    const volume = 1000000 * (1 + random() * 2) * (1 + Math.abs(change) * 10);
    data.push({ timestamp: now - (bars - i) * barInterval, open, high, low, close: price, volume });
  }
  return data;
}

/**
 * Run backtest across multiple random seeds to produce a distribution of outcomes.
 * Returns the primary (deterministic) result plus min/median/max stats.
 */
export interface MultiSeedBacktestStats {
  min_return: number;
  max_return: number;
  median_return: number;
  return_range: number;
  runs: number;
}

export function computeMultiSeedStats(returns: number[]): MultiSeedBacktestStats {
  const sorted = [...returns].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return {
    min_return: Math.round(sorted[0] * 100) / 100,
    max_return: Math.round(sorted[sorted.length - 1] * 100) / 100,
    median_return: Math.round(median * 100) / 100,
    return_range: Math.round((sorted[sorted.length - 1] - sorted[0]) * 100) / 100,
    runs: returns.length,
  };
}
