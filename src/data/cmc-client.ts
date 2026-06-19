import type { MarketContext } from "@/regime/classifiers";
import { adaptCoinMarketCapQuote } from "@/data/adapters";

const CMC_BASE_URL = "https://pro-api.coinmarketcap.com/v1";

/**
 * Fetch live market data from CoinMarketCap.
 *
 * CMC v1 /cryptocurrency/quotes/latest provides:
 *   ✓ price, percent_change_24h, percent_change_7d
 *   ✓ volume_24h, market_cap
 *   ✓ high_24h, low_24h (estimated ±2% from price in v1)
 *
 * CMC v1 does NOT provide (these remain undefined):
 *   ✗ rsi_14, macd, macd_signal (require separate technical indicator API)
 *   ✗ funding_rate, open_interest_change (require derivatives exchange feeds)
 *   ✗ fear_greed_index (requires alternative.me API)
 *   ✗ social_volume_change, active_addresses_change (require on-chain analytics)
 *   ✗ exchange_flow_net, volatility_30d (require historical computation)
 *
 * When these fields are undefined, the regime classifier uses heuristic
 * estimates derived from available price/volume data.
 */
export async function fetchMarketContext(symbol: string): Promise<MarketContext> {
  const apiKey = process.env.CMC_API_KEY;
  if (!apiKey) return getDemoMarketContext(symbol);
  try {
    const res = await fetch(
      `${CMC_BASE_URL}/cryptocurrency/quotes/latest?symbol=${symbol.toUpperCase()}`,
      { headers: { "X-CMC_PRO_API_KEY": apiKey } },
    );
    if (!res.ok) throw new Error(`CMC API error: ${res.status}`);
    const data = await res.json();
    const q = data.data?.[symbol.toUpperCase()]?.quote?.USD;
    if (!q) throw new Error(`No data for ${symbol}`);
    return adaptCoinMarketCapQuote(q as Record<string, unknown>, symbol);
  } catch (e) {
    console.warn(`[cmc-client] Live CMC API failed, falling back to demo data: ${e}`);
    return getDemoMarketContext(symbol);
  }
}

export const DEMO_PRESETS: Record<string, MarketContext> = {
  BTC: { symbol: "BTC", name: "Bitcoin", price: 104250, price_change_24h: 3.2, price_change_7d: 8.5, volume_24h: 42000000000, volume_change_24h: 15, market_cap: 2050000000000, market_cap_change_24h: 3.1, high_24h: 105800, low_24h: 100500, volatility_30d: 42, rsi_14: 68, macd: 850, macd_signal: 720, funding_rate: 0.012, open_interest_change: 8, fear_greed_index: 72, social_volume_change: 25, active_addresses_change: 5, exchange_flow_net: -3200 },
  ETH: { symbol: "ETH", name: "Ethereum", price: 3850, price_change_24h: 5.1, price_change_7d: 12.3, volume_24h: 22000000000, volume_change_24h: 30, market_cap: 463000000000, market_cap_change_24h: 4.8, high_24h: 3920, low_24h: 3650, volatility_30d: 55, rsi_14: 72, macd: 45, macd_signal: 38, funding_rate: 0.018, open_interest_change: 12, fear_greed_index: 78, social_volume_change: 40, active_addresses_change: 8, exchange_flow_net: -1800 },
  SOL: { symbol: "SOL", name: "Solana", price: 245, price_change_24h: -2.8, price_change_7d: -5.2, volume_24h: 4500000000, volume_change_24h: -10, market_cap: 115000000000, market_cap_change_24h: -2.5, high_24h: 258, low_24h: 238, volatility_30d: 65, rsi_14: 38, macd: -2.5, macd_signal: -1.8, funding_rate: -0.005, open_interest_change: -5, fear_greed_index: 35, social_volume_change: -15, active_addresses_change: -3, exchange_flow_net: 1200 },
  BNB: { symbol: "BNB", name: "BNB", price: 685, price_change_24h: 1.2, price_change_7d: -0.5, volume_24h: 2100000000, volume_change_24h: 5, market_cap: 102000000000, market_cap_change_24h: 1.0, high_24h: 695, low_24h: 672, volatility_30d: 28, rsi_14: 52, macd: 1.2, macd_signal: 1.0, funding_rate: 0.003, open_interest_change: 2, fear_greed_index: 55, social_volume_change: 8, active_addresses_change: 2, exchange_flow_net: -400 },
  DOGE: { symbol: "DOGE", name: "Dogecoin", price: 0.42, price_change_24h: 15.2, price_change_7d: 35.8, volume_24h: 8900000000, volume_change_24h: 120, market_cap: 62000000000, market_cap_change_24h: 14.5, high_24h: 0.45, low_24h: 0.36, volatility_30d: 85, rsi_14: 82, macd: 0.035, macd_signal: 0.028, funding_rate: 0.035, open_interest_change: 45, fear_greed_index: 88, social_volume_change: 200, active_addresses_change: 30, exchange_flow_net: -8000 },
  CAKE: { symbol: "CAKE", name: "PancakeSwap", price: 2.85, price_change_24h: 4.2, price_change_7d: 11.5, volume_24h: 180000000, volume_change_24h: 22, market_cap: 850000000, market_cap_change_24h: 3.8, high_24h: 2.98, low_24h: 2.71, volatility_30d: 52, rsi_14: 62, macd: 0.045, macd_signal: 0.038, funding_rate: 0.008, open_interest_change: 5, fear_greed_index: 65, social_volume_change: 18, active_addresses_change: 7, exchange_flow_net: -280 },
};

function getDemoMarketContext(symbol: string): MarketContext {
  const u = symbol.toUpperCase();
  if (DEMO_PRESETS[u]) return DEMO_PRESETS[u];
  return { symbol: u, name: u, price: 100, price_change_24h: 0, price_change_7d: 0, volume_24h: 1000000, volume_change_24h: 0, market_cap: 100000000, high_24h: 105, low_24h: 95, volatility_30d: 35, rsi_14: 50, fear_greed_index: 50 };
}
