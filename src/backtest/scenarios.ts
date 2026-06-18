import type { Regime } from "@/regime/classifiers";
import type { OHLCVBar } from "@/backtest/metrics";

export interface PresetScenario { name: string; regime: Regime; description: string; symbol: string; }
export const PRESET_SCENARIOS: PresetScenario[] = [
  { name: "BTC Bull Run", regime: "TREND_UP", description: "Bitcoin in a strong uptrend", symbol: "BTC" },
  { name: "ETH Bear Market", regime: "TREND_DOWN", description: "Ethereum in a downtrend", symbol: "ETH" },
  { name: "SOL Oversold Bounce", regime: "MEAN_REVERT_UP", description: "Solana oversold after capitulation", symbol: "SOL" },
  { name: "BNB Overbought Fade", regime: "MEAN_REVERT_DOWN", description: "BNB overextended to upside", symbol: "BNB" },
  { name: "DOGE Volatility Breakout", regime: "HIGH_VOL_BREAKOUT", description: "Dogecoin extreme volatility", symbol: "DOGE" },
  { name: "Market Chop", regime: "CHOP", description: "Sideways choppy market", symbol: "BTC" },
];

export function generateSyntheticData(regime: Regime, bars: number = 200): OHLCVBar[] {
  const data: OHLCVBar[] = [];
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
    const change = drift + vol * (Math.random() * 2 - 1);
    const open = price;
    price = price * (1 + change);
    const high = Math.max(open, price) * (1 + Math.random() * vol * 0.5);
    const low = Math.min(open, price) * (1 - Math.random() * vol * 0.5);
    const volume = 1000000 * (1 + Math.random() * 2) * (1 + Math.abs(change) * 10);
    data.push({ timestamp: now - (bars - i) * barInterval, open, high, low, close: price, volume });
  }
  return data;
}