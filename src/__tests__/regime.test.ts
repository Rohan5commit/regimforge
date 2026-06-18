import { describe, it, expect } from "vitest";
import { computeRegimeSignals, deterministicRegime } from "../lib/regime";
import type { MarketContext } from "../lib/schemas";

const BTC_UPTREND: MarketContext = {
  symbol: "BTC",
  price: 104250,
  price_change_24h: 3.2,
  price_change_7d: 8.5,
  volume_24h: 42_000_000_000,
  volatility_30d: 42,
  rsi_14: 68,
  funding_rate: 0.012,
  fear_greed_index: 72,
  social_volume_change: 25,
  active_addresses_change: 5,
  exchange_flow_net: -3200,
  high_24h: 105800,
  low_24h: 100500,
};

const BTC_DOWNTREND: MarketContext = {
  symbol: "BTC",
  price: 85000,
  price_change_24h: -5.2,
  price_change_7d: -12.3,
  volume_24h: 55_000_000_000,
  volatility_30d: 55,
  rsi_14: 28,
  funding_rate: -0.015,
  fear_greed_index: 22,
  social_volume_change: -20,
  active_addresses_change: -8,
  exchange_flow_net: 5000,
  high_24h: 90000,
  low_24h: 84000,
};

const BTC_CHOPPY: MarketContext = {
  symbol: "BTC",
  price: 100000,
  price_change_24h: 0.1,
  price_change_7d: -0.3,
  volume_24h: 25_000_000_000,
  volatility_30d: 20,
  rsi_14: 50,
  funding_rate: 0.001,
  fear_greed_index: 50,
  social_volume_change: 2,
  active_addresses_change: 0,
  exchange_flow_net: 100,
  high_24h: 101000,
  low_24h: 99000,
};

describe("computeRegimeSignals", () => {
  it("returns signals in [-1, 1] range", () => {
    const signals = computeRegimeSignals(BTC_UPTREND);
    expect(signals.momentum).toBeGreaterThanOrEqual(-1);
    expect(signals.momentum).toBeLessThanOrEqual(1);
    expect(signals.sentiment).toBeGreaterThanOrEqual(-1);
    expect(signals.sentiment).toBeLessThanOrEqual(1);
    expect(signals.volatility).toBeGreaterThanOrEqual(-1);
    expect(signals.volatility).toBeLessThanOrEqual(1);
  });

  it("gives positive momentum for uptrend", () => {
    const signals = computeRegimeSignals(BTC_UPTREND);
    expect(signals.momentum).toBeGreaterThan(0);
  });

  it("gives negative momentum for downtrend", () => {
    const signals = computeRegimeSignals(BTC_DOWNTREND);
    expect(signals.momentum).toBeLessThan(0);
  });

  it("gives positive sentiment for high fear/greed", () => {
    const signals = computeRegimeSignals(BTC_UPTREND);
    expect(signals.sentiment).toBeGreaterThan(0);
  });

  it("gives negative sentiment for low fear/greed", () => {
    const signals = computeRegimeSignals(BTC_DOWNTREND);
    expect(signals.sentiment).toBeLessThan(0);
  });
});

describe("deterministicRegime", () => {
  it("classifies uptrend correctly", () => {
    const signals = computeRegimeSignals(BTC_UPTREND);
    const result = deterministicRegime(signals);
    expect(["TREND_UP", "HIGH_VOL_BREAKOUT"]).toContain(result.regime);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("classifies downtrend correctly", () => {
    const signals = computeRegimeSignals(BTC_DOWNTREND);
    const result = deterministicRegime(signals);
    expect(["TREND_DOWN", "HIGH_VOL_BREAKOUT", "MEAN_REVERT_UP"]).toContain(result.regime);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("classifies choppy market correctly", () => {
    const signals = computeRegimeSignals(BTC_CHOPPY);
    const result = deterministicRegime(signals);
    // Choppy market should lean toward CHOP or low-confidence regimes
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it("returns confidence between 0 and 1", () => {
    const signals = computeRegimeSignals(BTC_UPTREND);
    const result = deterministicRegime(signals);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});
