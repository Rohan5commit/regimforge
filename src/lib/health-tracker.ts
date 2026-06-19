/**
 * Shared health tracker for recording skill execution metrics.
 * Used by both /api/health (read) and runner.ts (write).
 */

let lastRunLatency: number | null = null;
let lastRunTimestamp: string | null = null;
let runCount = 0;

export function recordSkillLatency(ms: number): void {
  lastRunLatency = ms;
  lastRunTimestamp = new Date().toISOString();
  runCount++;
}

export function getHealthData() {
  return {
    last_run_latency_ms: lastRunLatency,
    last_run_at: lastRunTimestamp,
    total_runs: runCount,
    uptime_seconds: Math.floor(process.uptime()),
  };
}
