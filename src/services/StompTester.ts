import { Client } from "@stomp/stompjs";

export type StompMessageType = {
  destination: string;
  headers: Record<string, string>;
  body: object | string;
  soakRate: number; // messages per second continuously for this message
  burstRate: number; // messages per second in bursts for this message
};

export type StompTestConfigType = {
  endpoint: string;
  messages: StompMessageType[];
  soakRate: number; // messages per second continuously
  burstRate: number; // messages per second in bursts
};

// Metrics for STOMP tester
export const stompMetrics = {
  totalMessages: 0,
  messagesLastSecond: 0,
  startTime: Date.now(),
  _lastSecondCount: 0,
};

// Update the messagesLastSecond counter every second for STOMP
setInterval(() => {
  stompMetrics.messagesLastSecond = stompMetrics._lastSecondCount;
  stompMetrics._lastSecondCount = 0;
}, 1000);

export function getRunningTime(): number {
  return Math.floor((Date.now() - stompMetrics.startTime) / 1000);
}

export function runStompTest(config: StompTestConfigType, soakDuration: number): { cancel: () => void } {
  // Reset startTime on new test
  stompMetrics.startTime = Date.now();

  const client = new Client({
    brokerURL: config.endpoint,
    reconnectDelay: 5000,
  });

  let soakInterval: ReturnType<typeof setInterval>;
  let soakTimeout: ReturnType<typeof setTimeout>;

  client.onConnect = () => {
    // Immediately send a burst of messages
    for (let i = 0; i < config.burstRate; i++) {
      config.messages.forEach((message) => {
        client.publish({
          destination: message.destination,
          headers: message.headers,
          body: JSON.stringify(message.body),
        });
        stompMetrics.totalMessages++;
        stompMetrics._lastSecondCount++;
      });
    }

    // Start the soak interval
    const intervalMs = 1000 / config.soakRate;
    soakInterval = setInterval(() => {
      config.messages.forEach((message) => {
        client.publish({
          destination: message.destination,
          headers: message.headers,
          body: JSON.stringify(message.body),
        });
        stompMetrics.totalMessages++;
        stompMetrics._lastSecondCount++;
      });
    }, intervalMs);

    // After soakDuration seconds, stop the soak interval
    soakTimeout = setTimeout(() => {
      clearInterval(soakInterval);
    }, soakDuration * 1000);
  };

  client.activate();

  return {
    cancel: () => {
      if (soakInterval) clearInterval(soakInterval);
      if (soakTimeout) clearTimeout(soakTimeout);
      client.deactivate();
    }
  };
}
