import axios from "axios";

export type AllowedMethodsType = "get" | "post" | "put" | "delete" | "patch";

export type HttpTestConfigType = {
  url: string;
  method: AllowedMethodsType;
  body: object;
  soakRate: number; // requests per second continuously
  burstRate: number; // requests per second in bursts
};

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

export function runHttpTest(config: HttpTestConfigType, soakDuration: number): { cancel: () => void } {
  // Reset startTime on new test
  httpMetrics.startTime = Date.now();

  // Immediately send a burst of requests
  for (let i = 0; i < config.burstRate; i++) {
    axios.post(config.url, config.body).catch(() => {});
    httpMetrics.totalMessages++;
    httpMetrics._lastSecondCount++;
  }

  // Start the soak interval
  const intervalMs = 1000 / config.soakRate;
  const soakInterval = setInterval(() => {
    axios.post(config.url, config.body).catch(() => {});
    httpMetrics.totalMessages++;
    httpMetrics._lastSecondCount++;
  }, intervalMs);

  // After soakDuration seconds, stop the soak interval
  const soakTimeout = setTimeout(() => {
    clearInterval(soakInterval);
  }, soakDuration * 1000);

  return {
    cancel: () => {
      clearInterval(soakInterval);
      clearTimeout(soakTimeout);
    }
  };
}
