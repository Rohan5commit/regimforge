/**
 * Backtesting Engine
 * Simulates strategy performance over historical windows
 */
import type { StrategySpec, BacktestResult } from "./schemas";
import type { Regime } from "./schemas";

interface OHLCVBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface BacktestConfig {
  initial_capital: number;
  commission_rate: number;
  max_position_pct: number;
}

const DEFAULT_CONFIG: BacktestConfig = {
  initial_capital: 10000,
  commission_rate: 0.001, // 0.1%
  max_position_pct: 0.3,
};

/**
 * Simple technical indicator calculations
 */
function sma(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      result.push(slice.reduce((a, b) => a + b, 0) / period);
    }
  }
  return result;
}

function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

function rsi(closes: number[], period: number): number[] {
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }
  const result: number[] = [50]; // default
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < changes.length; i++) {
    if (i < period) {
      if (changes[i] > 0) avgGain += changes[i];
      else avgLoss += Math.abs(changes[i]);
      if (i === period - 1) {
        avgGain /= period;
        avgLoss /= period;
      }
      result.push(50);
    } else {
      const gain = changes[i] > 0 ? changes[i] : 0;
      const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }
  return result;
}

function atr(bars: OHLCVBar[], period: number): number[] {
  const trs: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i === 0) {
      trs.push(bars[i].high - bars[i].low);
    } else {
      const tr = Math.max(
        bars[i].high - bars[i].low,
        Math.abs(bars[i].high - bars[i - 1].close),
        Math.abs(bars[i].low - bars[i - 1].close)
      );
      trs.push(tr);
    }
  }
  return sma(trs, period);
}

/**
 * Evaluate entry/exit conditions based on strategy regime
 */
function evaluateBar(
  bar: OHLCVBar,
  bars: OHLCVBar[],
  index: number,
  spec: StrategySpec,
  indicators: { sma20: number[]; sma50: number[]; rsi14: number[]; atr14: number[] }
): { action: "BUY" | "SELL" | "HOLD"; reason: string } {
  const closes = bars.map((b) => b.close);
  const currentRSI = indicators.rsi14[index];
  const currentSMA20 = indicators.sma20[index];
  const currentSMA50 = indicators.sma50[index];
  const prevClose = index > 0 ? bars[index - 1].close : bar.close;

  if (isNaN(currentRSI) || isNaN(currentSMA20)) {
    return { action: "HOLD", reason: "Insufficient data" };
  }

  switch (spec.regime) {
    case "TREND_UP": {
      // Buy on pullback to SMA20 in uptrend
      if (
        bar.close <= currentSMA20 * 1.01 &&
        bar.close > currentSMA50 &&
        currentRSI < 60 &&
        prevClose > currentSMA20
      ) {
        return { action: "BUY", reason: "Pullback to SMA20 in uptrend" };
      }
      if (currentRSI > 80 || bar.close < currentSMA50) {
        return { action: "SELL", reason: "Overbought or trend break" };
      }
      return { action: "HOLD", reason: "Holding in uptrend" };
    }

    case "TREND_DOWN": {
      // Short on bounce to SMA20 in downtrend
      if (
        bar.close >= currentSMA20 * 0.99 &&
        bar.close < currentSMA50 &&
        currentRSI > 40 &&
        prevClose < currentSMA20
      ) {
        return { action: "SELL", reason: "Bounce to SMA20 in downtrend" };
      }
      if (currentRSI < 20 || bar.close > currentSMA50) {
        return { action: "BUY", reason: "Oversold or trend break" };
      }
      return { action: "HOLD", reason: "Holding in downtrend" };
    }

    case "MEAN_REVERT_UP": {
      // Buy oversold bounce
      if (currentRSI < 30 && bar.close > prevClose) {
        return { action: "BUY", reason: "Oversold bounce (RSI < 30)" };
      }
      if (currentRSI > 55) {
        return { action: "SELL", reason: "Mean reversion target reached" };
      }
      return { action: "HOLD", reason: "Waiting for oversold signal" };
    }

    case "MEAN_REVERT_DOWN": {
      // Short overbought
      if (currentRSI > 70 && bar.close < prevClose) {
        return { action: "SELL", reason: "Overbought reversal (RSI > 70)" };
      }
      if (currentRSI < 45) {
        return { action: "BUY", reason: "Mean reversion target reached" };
      }
      return { action: "HOLD", reason: "Waiting for overbought signal" };
    }

    case "HIGH_VOL_BREAKOUT": {
      // Buy breakouts
      const high20 = Math.max(...bars.slice(Math.max(0, index - 20), index).map((b) => b.high));
      const low20 = Math.min(...bars.slice(Math.max(0, index - 20), index).map((b) => b.low));
      if (bar.close > high20) {
        return { action: "BUY", reason: "Breakout above 20-bar high" };
      }
      if (bar.close < low20) {
        return { action: "SELL", reason: "Breakdown below 20-bar low" };
      }
      return { action: "HOLD", reason: "Waiting for breakout" };
    }

    case "CHOP":
    default:
      return { action: "HOLD", reason: "CHOP regime — no trade" };
  }
}

/**
 * Run backtest on historical data
 */
export function runBacktest(
  spec: StrategySpec,
  bars: OHLCVBar[],
  config: BacktestConfig = DEFAULT_CONFIG
): BacktestResult {
  if (bars.length < 50) {
    return {
      total_return: 0,
      max_drawdown: 0,
      trade_count: 0,
      win_rate: 0,
      avg_holding_period: "N/A",
      summary: "Insufficient data for backtest (need at least 50 bars)",
      equity_curve: [config.initial_capital],
      trades: [],
    };
  }

  const closes = bars.map((b) => b.close);
  const indicators = {
    sma20: sma(closes, 20),
    sma50: sma(closes, 50),
    rsi14: rsi(closes, 14),
    atr14: atr(bars, 14),
  };

  let cash = config.initial_capital;
  let position = 0; // 0 = flat, 1 = long, -1 = short
  let entryPrice = 0;
  const equityCurve: number[] = [];
  const trades: BacktestResult["trades"] = [];
  let peakEquity = config.initial_capital;
  let maxDrawdown = 0;

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    const { action, reason } = evaluateBar(bar, bars, i, spec, indicators);

    const equity = cash + (position !== 0 ? position * (bar.close - entryPrice) * (cash * config.max_position_pct) / entryPrice : 0);
    equityCurve.push(equity);
    peakEquity = Math.max(peakEquity, equity);
    const dd = (peakEquity - equity) / peakEquity;
    maxDrawdown = Math.max(maxDrawdown, dd);

    if (position === 0) {
      // Entry
      if (action === "BUY" && spec.directional_bias !== "SHORT") {
        const size = cash * config.max_position_pct;
        const shares = size / bar.close;
        position = 1;
        entryPrice = bar.close;
        cash -= size + size * config.commission_rate;
      } else if (action === "SELL" && spec.directional_bias !== "LONG") {
        const size = cash * config.max_position_pct;
        const shares = size / bar.close;
        position = -1;
        entryPrice = bar.close;
        cash -= size * config.commission_rate;
      }
    } else {
      // Exit
      if (
        (position === 1 && (action === "SELL" || reason.includes("target reached"))) ||
        (position === -1 && (action === "BUY" || reason.includes("target reached")))
      ) {
        const exitValue = position * (bar.close - entryPrice) * (cash * config.max_position_pct + entryPrice * config.max_position_pct) / entryPrice;
        cash += exitValue;
        cash -= Math.abs(exitValue) * config.commission_rate;
        trades.push({
          entry_price: entryPrice,
          exit_price: bar.close,
          direction: position === 1 ? "LONG" : "SHORT",
          return_pct: ((bar.close - entryPrice) / entryPrice) * position * 100,
          holding_bars: 1,
        });
        position = 0;
        entryPrice = 0;
      }
    }
  }

  // Close any open position at end
  if (position !== 0 && bars.length > 0) {
    const lastBar = bars[bars.length - 1];
    const exitValue = position * (lastBar.close - entryPrice) * (cash * config.max_position_pct + entryPrice * config.max_position_pct) / entryPrice;
    cash += exitValue;
    trades.push({
      entry_price: entryPrice,
      exit_price: lastBar.close,
      direction: position === 1 ? "LONG" : "SHORT",
      return_pct: ((lastBar.close - entryPrice) / entryPrice) * position * 100,
      holding_bars: 1,
    });
  }

  const totalReturn = ((cash - config.initial_capital) / config.initial_capital) * 100;
  const winCount = trades.filter((t) => t.return_pct > 0).length;
  const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;

  return {
    total_return: round(totalReturn),
    max_drawdown: round(maxDrawdown * 100),
    trade_count: trades.length,
    win_rate: round(winRate),
    avg_holding_period: trades.length > 0 ? `${Math.round(trades.reduce((a, t) => a + t.holding_bars, 0) / trades.length)} bars` : "N/A",
    summary: generateSummary(totalReturn, maxDrawdown * 100, trades.length, winRate, spec),
    equity_curve: equityCurve,
    trades,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function generateSummary(
  totalReturn: number,
  maxDrawdown: number,
  tradeCount: number,
  winRate: number,
  spec: StrategySpec
): string {
  if (tradeCount === 0) {
    return `No trades executed. Regime: ${spec.regime}. The strategy correctly stayed flat — no qualifying setups occurred during this period.`;
  }
  const parts: string[] = [];
  parts.push(`Backtest over ${spec.regime} regime.`);
  parts.push(`${tradeCount} trades with ${winRate.toFixed(0)}% win rate.`);
  parts.push(`Total return: ${totalReturn > 0 ? "+" : ""}${totalReturn.toFixed(2)}%.`);
  parts.push(`Max drawdown: ${maxDrawdown.toFixed(2)}%.`);
  if (totalReturn > 0 && maxDrawdown < 10) {
    parts.push("Risk-adjusted performance is favorable.");
  } else if (maxDrawdown > 15) {
    parts.push("Drawdown is significant — sizing should be reduced in live deployment.");
  }
  return parts.join(" ");
}

/**
 * Generate synthetic historical data for demo purposes
 */
export function generateSyntheticData(
  regime: Regime,
  bars: number = 200
): OHLCVBar[] {
  const data: OHLCVBar[] = [];
  let price = 100;
  const now = Date.now();
  const barInterval = 4 * 60 * 60 * 1000; // 4h candles

  for (let i = 0; i < bars; i++) {
    let drift = 0;
    let vol = 0.02;

    switch (regime) {
      case "TREND_UP":
        drift = 0.003;
        vol = 0.015;
        break;
      case "TREND_DOWN":
        drift = -0.003;
        vol = 0.015;
        break;
      case "MEAN_REVERT_UP":
        drift = 0.001;
        vol = 0.025;
        break;
      case "MEAN_REVERT_DOWN":
        drift = -0.001;
        vol = 0.025;
        break;
      case "HIGH_VOL_BREAKOUT":
        drift = (i % 40 < 20 ? 0.005 : -0.003);
        vol = 0.04;
        break;
      case "CHOP":
        drift = 0;
        vol = 0.01;
        break;
    }

    const change = drift + vol * (Math.random() * 2 - 1);
    const open = price;
    price = price * (1 + change);
    const high = Math.max(open, price) * (1 + Math.random() * vol * 0.5);
    const low = Math.min(open, price) * (1 - Math.random() * vol * 0.5);
    const volume = 1000000 * (1 + Math.random() * 2) * (1 + Math.abs(change) * 10);

    data.push({
      timestamp: now - (bars - i) * barInterval,
      open,
      high,
      low,
      close: price,
      volume,
    });
  }

  return data;
}
