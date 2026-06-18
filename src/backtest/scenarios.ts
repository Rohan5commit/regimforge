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


export function generateSyntheticData(regime: Regime, bars: number = 200): OHLCVBar[] {
  const data: OHLCVBar[] = [];
  // Deterministic seed based on regime name + bar count
  const seed = regime.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 1000 + bars;
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