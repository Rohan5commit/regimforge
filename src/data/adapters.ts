import type { MarketContext } from "@/regime/classifiers";
import { DEMO_PRESETS } from "@/data/cmc-client";

/**
 * CoinMarketCap v1 /cryptocurrency/quotes/latest returns:
 *   price, percent_change_24h, percent_change_7d, volume_24h, market_cap,
 *   high_24h, low_24h (within the quote.USD object).
 *
 * It does NOT return technical indicators (RSI, MACD, funding rate, etc.).
 * Those require separate CMC endpoints or on-chain analytics providers.
 * When using live CMC data, technical indicator fields will be undefined
 * and the system falls back to heuristic estimates derived from price action.
 */
export function adaptCoinMarketCapQuote(
  quote: Record<string, unknown>,
  symbol: string,
): MarketContext {
  const q = quote as {
    price?: number;
    percent_change_24h?: number;
    percent_change_7d?: number;
    volume_24h?: number;
    market_cap?: number;
    high_24h?: number;
    low_24h?: number;
  };

  // Fields actually available from CMC v1 quotes/latest endpoint
  const available: MarketContext = {
    symbol: symbol.toUpperCase(),
    name: symbol.toUpperCase(),
    price: q.price ?? 0,
    price_change_24h: q.percent_change_24h ?? 0,
    price_change_7d: q.percent_change_7d ?? 0,
    volume_24h: q.volume_24h ?? 0,
    volume_change_24h: (q as Record<string, unknown>).volume_change_24h as number ?? 0,
    market_cap: q.market_cap ?? 0,
    // CMC provides high_24h/low_24h in v2; v1 estimates ±2% from price
    high_24h: q.high_24h ?? (q.price ? q.price * 1.02 : 0),
    low_24h: q.low_24h ?? (q.price ? q.price * 0.98 : 0),
  };

  // Fields NOT available from CMC quotes/latest:
  // rsi_14, macd, macd_signal, funding_rate, open_interest_change,
  // fear_greed_index, social_volume_change, active_addresses_change,
  // exchange_flow_net, volatility_30d, market_cap_change_24h
  // These remain undefined; downstream code uses heuristic estimates.

  return available;
}

export function adaptGenericPriceData(
  data: { price: number; change24h?: number; volume?: number },
  symbol: string,
): MarketContext {
  return {
    symbol, name: symbol, price: data.price, price_change_24h: data.change24h ?? 0,
    volume_24h: data.volume ?? 0, volume_change_24h: 0, market_cap: 0,
  };
}

export function getPresetContext(symbol: string): MarketContext | undefined {
  return DEMO_PRESETS[symbol.toUpperCase()];
}
