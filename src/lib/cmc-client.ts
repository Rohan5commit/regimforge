/**
 * CoinMarketCap Data Adapter
 * Fetches market data from CMC API, with fallback demo data
 */
import type { MarketContext } from "./schemas";

const CMC_BASE_URL = "https://pro-api.coinmarketcap.com/v1";

/**
 * Fetch market context from CoinMarketCap
 */
export async function fetchMarketContext(symbol: string): Promise<MarketContext> {
  const apiKey = process.env.CMC_API_KEY;

  if (!apiKey) {
    // Return demo data if no API key
    return getDemoMarketContext(symbol);
  }

  try {
    // Fetch basic market data
    const quoteRes = await fetch(
      `${CMC_BASE_URL}/cryptocurrency/quotes/latest?symbol=${symbol.toUpperCase()}`,
      {
        headers: { "X-CMC_PRO_API_KEY": apiKey },
      }
    );

    if (!quoteRes.ok) throw new Error(`CMC API error: ${quoteRes.status}`);
    const quoteData = await quoteRes.json();
    const quote = quoteData.data?.[symbol.toUpperCase()]?.quote?.USD;

    if (!quote) throw new Error(`No data for ${symbol}`);

    return {
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      price: quote.price ?? 0,
      price_change_24h: quote.percent_change_24h ?? 0,
      price_change_7d: quote.percent_change_7d ?? 0,
      volume_24h: quote.volume_24h ?? 0,
      volume_change_24h: quote.volume_change_24h ?? 0,
      market_cap: quote.market_cap ?? 0,
      market_cap_change_24h: quote.market_cap_dominance ?? 0,
      high_24h: quote.percent_change_24h > 0 ? quote.price * 1.02 : quote.price,
      low_24h: quote.percent_change_24h > 0 ? quote.price * 0.98 : quote.price,
    };
  } catch (e) {
    console.error("CMC fetch failed, using demo data:", e);
    return getDemoMarketContext(symbol);
  }
}

/**
 * Pre-built demo market contexts for showcase
 */
export const DEMO_PRESETS: Record<string, MarketContext> = {
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    price: 104250,
    price_change_24h: 3.2,
    price_change_7d: 8.5,
    volume_24h: 42_000_000_000,
    volume_change_24h: 15,
    market_cap: 2_050_000_000_000,
    market_cap_change_24h: 3.1,
    high_24h: 105800,
    low_24h: 100500,
    volatility_30d: 42,
    rsi_14: 68,
    macd: 850,
    macd_signal: 720,
    funding_rate: 0.012,
    open_interest_change: 8,
    fear_greed_index: 72,
    social_volume_change: 25,
    active_addresses_change: 5,
    exchange_flow_net: -3200,
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    price: 3850,
    price_change_24h: 5.1,
    price_change_7d: 12.3,
    volume_24h: 22_000_000_000,
    volume_change_24h: 30,
    market_cap: 463_000_000_000,
    market_cap_change_24h: 4.8,
    high_24h: 3920,
    low_24h: 3650,
    volatility_30d: 55,
    rsi_14: 72,
    macd: 45,
    macd_signal: 38,
    funding_rate: 0.018,
    open_interest_change: 12,
    fear_greed_index: 78,
    social_volume_change: 40,
    active_addresses_change: 8,
    exchange_flow_net: -1800,
  },
  SOL: {
    symbol: "SOL",
    name: "Solana",
    price: 245,
    price_change_24h: -2.8,
    price_change_7d: -5.2,
    volume_24h: 4_500_000_000,
    volume_change_24h: -10,
    market_cap: 115_000_000_000,
    market_cap_change_24h: -2.5,
    high_24h: 258,
    low_24h: 238,
    volatility_30d: 65,
    rsi_14: 38,
    macd: -2.5,
    macd_signal: -1.8,
    funding_rate: -0.005,
    open_interest_change: -5,
    fear_greed_index: 35,
    social_volume_change: -15,
    active_addresses_change: -3,
    exchange_flow_net: 1200,
  },
  BNB: {
    symbol: "BNB",
    name: "BNB",
    price: 685,
    price_change_24h: 1.2,
    price_change_7d: -0.5,
    volume_24h: 2_100_000_000,
    volume_change_24h: 5,
    market_cap: 102_000_000_000,
    market_cap_change_24h: 1.0,
    high_24h: 695,
    low_24h: 672,
    volatility_30d: 28,
    rsi_14: 52,
    macd: 1.2,
    macd_signal: 1.0,
    funding_rate: 0.003,
    open_interest_change: 2,
    fear_greed_index: 55,
    social_volume_change: 8,
    active_addresses_change: 2,
    exchange_flow_net: -400,
  },
  DOGE: {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.42,
    price_change_24h: 15.2,
    price_change_7d: 35.8,
    volume_24h: 8_900_000_000,
    volume_change_24h: 120,
    market_cap: 62_000_000_000,
    market_cap_change_24h: 14.5,
    high_24h: 0.45,
    low_24h: 0.36,
    volatility_30d: 85,
    rsi_14: 82,
    macd: 0.035,
    macd_signal: 0.028,
    funding_rate: 0.035,
    open_interest_change: 45,
    fear_greed_index: 88,
    social_volume_change: 200,
    active_addresses_change: 30,
    exchange_flow_net: -8000,
  },
};

function getDemoMarketContext(symbol: string): MarketContext {
  const upper = symbol.toUpperCase();
  if (DEMO_PRESETS[upper]) return DEMO_PRESETS[upper];

  // Generic fallback
  return {
    symbol: upper,
    name: upper,
    price: 100,
    price_change_24h: 0,
    price_change_7d: 0,
    volume_24h: 1_000_000,
    volume_change_24h: 0,
    market_cap: 100_000_000,
    high_24h: 105,
    low_24h: 95,
    volatility_30d: 35,
    rsi_14: 50,
    fear_greed_index: 50,
  };
}
