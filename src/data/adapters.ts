import type { MarketContext } from "@/regime/classifiers";
import { DEMO_PRESETS } from "@/data/cmc-client";

/** Adapters transform raw market data into the MarketContext schema */
export function adaptCoinMarketCapQuote(quote: Record<string, unknown>, symbol: string): MarketContext {
  const q = quote as { price?: number; percent_change_24h?: number; percent_change_7d?: number; volume_24h?: number; market_cap?: number; };
  return { symbol: symbol.toUpperCase(), name: symbol.toUpperCase(), price: q.price ?? 0, price_change_24h: q.percent_change_24h ?? 0, price_change_7d: q.percent_change_7d ?? 0, volume_24h: q.volume_24h ?? 0, volume_change_24h: 0, market_cap: q.market_cap ?? 0, high_24h: q.price ? q.price * 1.02 : 0, low_24h: q.price ? q.price * 0.98 : 0 };
}

export function adaptGenericPriceData(data: { price: number; change24h?: number; volume?: number; }, symbol: string): MarketContext {
  return { symbol, name: symbol, price: data.price, price_change_24h: data.change24h ?? 0, volume_24h: data.volume ?? 0 };
}

export function getPresetContext(symbol: string): MarketContext | undefined {
  return DEMO_PRESETS[symbol.toUpperCase()];
}