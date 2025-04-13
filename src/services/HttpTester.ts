import axios from "axios";

export interface HttpTestConfig {
  url: string;
  body: any;
  soakRate: number; // requests per second continuously
  burstRate: number; // requests per second in bursts
}

// Metrics for HTTP tester
export const httpMetrics = {
  totalMessages: 0,
  messagesLastSecond: 0,
  startTime: Date.now(),
  _lastSecondCount: 0,
};

// Update the messagesLastSecond counter every second
setInterval(() => {
  httpMetrics.messagesLastSecond = httpMetrics._lastSecondCount;
  httpMetrics._lastSecondCount = 0;
}, 1000);

export function getRunningTime(): number {
  return Math.floor((Date.now() - httpMetrics.startTime) / 1000);
}

export function runHttpTest(config: HttpTestConfig): void {
  // Reset startTime on new test
  httpMetrics.startTime = Date.now();

  // Soak test: send requests continuously at the specified soakRate
  const intervalMs = 1000 / config.soakRate;
  setInterval(() => {
    axios.post(config.url, config.body).catch(() => {});
    httpMetrics.totalMessages++;
    httpMetrics._lastSecondCount++;
  }, intervalMs);

  // Burst test: send requests in bursts every second
  setInterval(() => {
    for (let i = 0; i < config.burstRate; i++) {
      axios.post(config.url, config.body).catch(() => {});
      httpMetrics.totalMessages++;
      httpMetrics._lastSecondCount++;
    }
  }, 1000);
}
