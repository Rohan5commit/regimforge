import { describe, it, expect } from "vitest";
import { computeRegimeSignals } from "@/regime/features";
import { deterministicRegime } from "@/regime/classifier";
import type { MarketContext } from "@/regime/classifiers";

const UP: MarketContext = { symbol: "BTC", price: 104250, price_change_24h: 3.2, price_change_7d: 8.5, volume_24h: 42e9, volatility_30d: 42, rsi_14: 68, funding_rate: 0.012, fear_greed_index: 72, social_volume_change: 25, active_addresses_change: 5, exchange_flow_net: -3200, high_24h: 105800, low_24h: 100500 };
const DOWN: MarketContext = { symbol: "BTC", price: 85000, price_change_24h: -5.2, price_change_7d: -12.3, volume_24h: 55e9, volatility_30d: 55, rsi_14: 28, funding_rate: -0.015, fear_greed_index: 22, social_volume_change: -20, active_addresses_change: -8, exchange_flow_net: 5000, high_24h: 90000, low_24h: 84000 };


describe("computeRegimeSignals", () => {
  it("returns [-1,1] range", () => { const s = computeRegimeSignals(UP); expect(s.momentum).toBeGreaterThanOrEqual(-1); expect(s.momentum).toBeLessThanOrEqual(1); });
  it("positive momentum for uptrend", () => { expect(computeRegimeSignals(UP).momentum).toBeGreaterThan(0); });
  it("negative momentum for downtrend", () => { expect(computeRegimeSignals(DOWN).momentum).toBeLessThan(0); });
  it("positive sentiment for high fear/greed", () => { expect(computeRegimeSignals(UP).sentiment).toBeGreaterThan(0); });
});

describe("deterministicRegime", () => {
  it("classifies uptrend", () => { const s = computeRegimeSignals(UP); const r = deterministicRegime(s); expect(["TREND_UP","HIGH_VOL_BREAKOUT"]).toContain(r.regime); expect(r.confidence).toBeGreaterThan(0); });
  it("confidence in [0,1]", () => { const r = deterministicRegime(computeRegimeSignals(UP)); expect(r.confidence).toBeGreaterThanOrEqual(0); expect(r.confidence).toBeLessThanOrEqual(1); });
});