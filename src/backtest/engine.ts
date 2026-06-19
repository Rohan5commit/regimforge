import type { StrategySpec, BacktestResult } from "@/regime/classifiers";
import { sma, rsi, atr, rollingMax, rollingMin, type OHLCVBar } from "@/backtest/metrics";

export interface BacktestConfig {
  initial_capital: number;
  commission_rate: number;
  max_position_pct: number;
}
const DEFAULT_CONFIG: BacktestConfig = {
  initial_capital: 10000,
  commission_rate: 0.001,
  max_position_pct: 0.3,
};

function evaluateBar(
  bar: OHLCVBar,
  bars: OHLCVBar[],
  index: number,
  spec: StrategySpec,
  ind: { sma20: number[]; sma50: number[]; rsi14: number[]; atr14: number[]; high20: number[]; low20: number[] },
): { action: "BUY" | "SELL" | "HOLD"; reason: string } {
  const currentRSI = ind.rsi14[index];
  const currentSMA20 = ind.sma20[index];
  const currentSMA50 = ind.sma50[index];
  const prevClose = index > 0 ? bars[index - 1].close : bar.close;
  if (isNaN(currentRSI) || isNaN(currentSMA20))
    return { action: "HOLD", reason: "Insufficient data" };
  switch (spec.regime) {
    case "TREND_UP":
      if (
        bar.close <= currentSMA20 * 1.01 &&
        bar.close > currentSMA50 &&
        currentRSI < 60 &&
        prevClose > currentSMA20
      )
        return {
          action: "BUY",
          reason: "Pullback to SMA20 in uptrend",
        };
      if (currentRSI > 80 || bar.close < currentSMA50)
        return { action: "SELL", reason: "Overbought or trend break" };
      return { action: "HOLD", reason: "Holding" };
    case "TREND_DOWN":
      if (
        bar.close >= currentSMA20 * 0.99 &&
        bar.close < currentSMA50 &&
        currentRSI > 40 &&
        prevClose < currentSMA20
      )
        return {
          action: "SELL",
          reason: "Bounce to SMA20 in downtrend",
        };
      if (currentRSI < 20 || bar.close > currentSMA50)
        return { action: "BUY", reason: "Oversold or trend break" };
      return { action: "HOLD", reason: "Holding" };
    case "MEAN_REVERT_UP":
      if (currentRSI < 30 && bar.close > prevClose)
        return { action: "BUY", reason: "Oversold bounce" };
      if (currentRSI > 55)
        return { action: "SELL", reason: "Target reached" };
      return { action: "HOLD", reason: "Waiting" };
    case "MEAN_REVERT_DOWN":
      if (currentRSI > 70 && bar.close < prevClose)
        return { action: "SELL", reason: "Overbought reversal" };
      if (currentRSI < 45)
        return { action: "BUY", reason: "Target reached" };
      return { action: "HOLD", reason: "Waiting" };
    case "HIGH_VOL_BREAKOUT": {
      // Use index-1 to compare against previous 20 bars (excluding current bar)
      if (index === 0) return { action: "HOLD", reason: "Insufficient data" };
      const h20 = ind.high20[index - 1];
      const l20 = ind.low20[index - 1];
      if (isNaN(h20) || isNaN(l20))
        return { action: "HOLD", reason: "Insufficient data" };
      if (bar.close > h20)
        return { action: "BUY", reason: "Breakout above 20-bar high" };
      if (bar.close < l20)
        return { action: "SELL", reason: "Breakdown below 20-bar low" };
      return { action: "HOLD", reason: "Waiting" };
    }
    case "CHOP":
    default:
      return { action: "HOLD", reason: "CHOP - no trade" };
  }
}

/**
 * Run a backtest with unit-based position tracking.
 *
 * Positions are tracked as units (shares/coins) rather than dollar amounts.
 * On entry, positionSize (dollar amount) is deducted from cash and converted
 * to units at the entry price. On exit, units are converted back to dollars
 * and the P&L is applied. This avoids double-counting the principal.
 */
export function runBacktest(
  spec: StrategySpec,
  bars: OHLCVBar[],
  config: BacktestConfig = DEFAULT_CONFIG,
): BacktestResult {
  if (bars.length < 50)
    return {
      total_return: 0,
      max_drawdown: 0,
      trade_count: 0,
      win_rate: 0,
      avg_holding_period: "N/A",
      summary: "Insufficient data",
      equity_curve: [config.initial_capital],
      trades: [],
    };
  const closes = bars.map((b) => b.close);
  const indicators = {
    sma20: sma(closes, 20),
    sma50: sma(closes, 50),
    rsi14: rsi(closes, 14),
    atr14: atr(bars, 14),
    high20: rollingMax(bars.map((b) => b.high), 20),
    low20: rollingMin(bars.map((b) => b.low), 20),
  };
  let cash = config.initial_capital;
  let position = 0; // 0 = flat, 1 = long, -1 = short
  let entryPrice = 0;
  let positionSize = 0; // dollar amount invested at entry
  let units = 0; // shares/coins held
  let entryBarIndex = 0;
  const equityCurve: number[] = [];
  const trades: BacktestResult["trades"] = [];
  let peakEquity = config.initial_capital;
  let maxDrawdown = 0;

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    const { action, reason } = evaluateBar(bar, bars, i, spec, indicators);

    // Equity = cash + unrealized position value
    // For long: position value = units * bar.close
    // For short: we posted positionSize as collateral, liability = units * bar.close
    //   so net position value = positionSize - units * bar.close = positionSize * (2 - bar.close/entryPrice)
    //   Simplified: positionSize + position * (bar.close - entryPrice) * units
    const positionValue =
      position !== 0 ? positionSize + position * (bar.close - entryPrice) * units : 0;
    const equity = cash + positionValue;
    equityCurve.push(equity);
    peakEquity = Math.max(peakEquity, equity);
    maxDrawdown = Math.max(maxDrawdown, (peakEquity - equity) / peakEquity);

    if (position === 0) {
      if (action === "BUY" && spec.directional_bias !== "SHORT") {
        // Long entry: spend positionSize dollars to buy units shares
        positionSize = cash * config.max_position_pct;
        units = positionSize / bar.close;
        position = 1;
        entryPrice = bar.close;
        entryBarIndex = i;
        cash -= positionSize + positionSize * config.commission_rate;
      } else if (action === "SELL" && spec.directional_bias !== "LONG") {
        // Short entry: post positionSize as collateral, short units shares
        positionSize = cash * config.max_position_pct;
        units = positionSize / bar.close;
        position = -1;
        entryPrice = bar.close;
        entryBarIndex = i;
        cash -= positionSize + positionSize * config.commission_rate;
      }
    } else {
      if (
        (position === 1 &&
          (action === "SELL" || reason.toLowerCase().includes("target"))) ||
        (position === -1 &&
          (action === "BUY" || reason.toLowerCase().includes("target")))
      ) {
        // Exit: convert units back to dollars, compute P&L
        const exitValue = units * bar.close;
        const pnl = (exitValue - positionSize) * position;
        cash += positionSize + pnl - Math.abs(pnl) * config.commission_rate;
        trades.push({
          entry_price: entryPrice,
          exit_price: bar.close,
          direction: position === 1 ? "LONG" : "SHORT",
          return_pct:
            ((bar.close - entryPrice) / entryPrice) * position * 100,
          holding_bars: Math.max(1, i - entryBarIndex),
        });
        position = 0;
        entryPrice = 0;
        positionSize = 0;
        units = 0;
      }
    }
  }

  // Force-close any open position at end of backtest
  if (position !== 0 && bars.length > 0) {
    const lastBar = bars[bars.length - 1];
    const exitValue = units * lastBar.close;
    const pnl = (exitValue - positionSize) * position;
    cash += positionSize + pnl - Math.abs(pnl) * config.commission_rate;
    trades.push({
      entry_price: entryPrice,
      exit_price: lastBar.close,
      direction: position === 1 ? "LONG" : "SHORT",
      return_pct:
        ((lastBar.close - entryPrice) / entryPrice) * position * 100,
      holding_bars: Math.max(1, bars.length - 1 - entryBarIndex),
    });
  }

  const totalReturn =
    ((cash - config.initial_capital) / config.initial_capital) * 100;
  const winCount = trades.filter((t) => t.return_pct > 0).length;
  const winRate =
    trades.length > 0 ? (winCount / trades.length) * 100 : 0;
  const round = (n: number) => Math.round(n * 100) / 100;
  let summary = `Backtest over ${spec.regime} regime. `;
  if (trades.length === 0) summary += "No trades executed.";
  else
    summary += `${trades.length} trades with ${winRate.toFixed(0)}% win rate. Return: ${totalReturn > 0 ? "+" : ""}${totalReturn.toFixed(2)}%. Drawdown: ${(maxDrawdown * 100).toFixed(2)}%.`;
  return {
    total_return: round(totalReturn),
    max_drawdown: round(maxDrawdown * 100),
    trade_count: trades.length,
    win_rate: round(winRate),
    avg_holding_period:
      trades.length > 0
        ? `${Math.round(trades.reduce((a, t) => a + t.holding_bars, 0) / trades.length)} bars`
        : "N/A",
    summary,
    equity_curve: equityCurve,
    trades,
  };
}
