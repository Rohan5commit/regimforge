export function sma(data: number[], period: number): number[] {
  const r: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) r.push(NaN);
    else r.push(data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
  }
  return r;
}
export function rsi(closes: number[], period: number): number[] {
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) changes.push(closes[i] - closes[i - 1]);
  const result: number[] = [50];
  let avgGain = 0, avgLoss = 0;
  for (let i = 0; i < changes.length; i++) {
    if (i < period) {
      if (changes[i] > 0) avgGain += changes[i]; else avgLoss += Math.abs(changes[i]);
      if (i === period - 1) { avgGain /= period; avgLoss /= period; }
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
export interface OHLCVBar { timestamp: number; open: number; high: number; low: number; close: number; volume: number; }
export function atr(bars: OHLCVBar[], period: number): number[] {
  const trs: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i === 0) trs.push(bars[i].high - bars[i].low);
    else trs.push(Math.max(bars[i].high - bars[i].low, Math.abs(bars[i].high - bars[i-1].close), Math.abs(bars[i].low - bars[i-1].close)));
  }
  return sma(trs, period);
}