import { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import HttpConfigForm from "./components/HttpConfigForm";
import StompConfigForm from "./components/StompConfigForm";
import {
  HttpTestConfig,
  runHttpTest,
  httpMetrics,
  getRunningTime as getHttpRunningTime,
} from "./services/HttpTester";
import {
  StompTestConfig,
  runStompTest,
  stompMetrics,
  getRunningTime as getStompRunningTime,
} from "./services/StompTester";

// Utility to generate unique IDs
let idCounter = 1;
const getUniqueId = () => idCounter++;

const defaultHttpConfig: HttpTestConfig = {
  url: "",
  body: {},
  soakRate: 1,
  burstRate: 1,
};

const defaultStompConfig: StompTestConfig = {
  endpoint: "",
  messages: [],
  soakRate: 1,
  burstRate: 1,
};

function App() {
  // States for config lists
  const [httpConfigs, setHttpConfigs] = useState([
    { id: getUniqueId(), config: { ...defaultHttpConfig } },
  ]);
  const [stompConfigs, setStompConfigs] = useState([
    { id: getUniqueId(), config: { ...defaultStompConfig } },
  ]);

  // Dummy state for re-rendering metrics
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Handlers for HTTP configs
  const updateHttpConfig = (id: number, newConfig: HttpTestConfig) => {
    setHttpConfigs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, config: newConfig } : item
      )
    );
  };
  const removeHttpConfig = (id: number) => {
    setHttpConfigs((prev) => prev.filter((item) => item.id !== id));
  };
  const addHttpConfig = () => {
    setHttpConfigs((prev) => [
      ...prev,
      { id: getUniqueId(), config: { ...defaultHttpConfig } },
    ]);
  };

  // Handlers for STOMP configs
  const updateStompConfig = (id: number, newConfig: StompTestConfig) => {
    setStompConfigs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, config: newConfig } : item
      )
    );
  };
  const removeStompConfig = (id: number) => {
    setStompConfigs((prev) => prev.filter((item) => item.id !== id));
  };
  const addStompConfig = () => {
    setStompConfigs((prev) => [
      ...prev,
      { id: getUniqueId(), config: { ...defaultStompConfig } },
    ]);
  };

  // Start all tests
  const startTesting = () => {
    httpConfigs.forEach((item) => {
      // Only start if URL is provided
      if (item.config.url) {
        runHttpTest(item.config);
      }
    });
    stompConfigs.forEach((item) => {
      // Only start if endpoint is provided
      if (item.config.endpoint) {
        runStompTest(item.config);
      }
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        HTTP and STOMP (over WebSocket) Load Tester
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5">HTTP Requests</Typography>
        {httpConfigs.map((item) => (
          <HttpConfigForm
            key={item.id}
            config={item.config}
            onChange={(config) => updateHttpConfig(item.id, config)}
            onRemove={() => removeHttpConfig(item.id)}
          />
        ))}
        <Button variant="outlined" onClick={addHttpConfig} sx={{ mt: 1 }}>
          Add HTTP Config
        </Button>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5">STOMP over WebSocket Messages</Typography>
        {stompConfigs.map((item) => (
          <StompConfigForm
            key={item.id}
            config={item.config}
            onChange={(config) => updateStompConfig(item.id, config)}
            onRemove={() => removeStompConfig(item.id)}
          />
        ))}
        <Button variant="outlined" onClick={addStompConfig} sx={{ mt: 1 }}>
          Add STOMP Config
        </Button>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={startTesting}
        sx={{ mb: 4 }}
      >
        Start Testing
      </Button>
      <Box>
        <Typography variant="h5">Metrics</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">HTTP Metrics</Typography>
          <Typography>
            Total Requests Sent: {httpMetrics.totalMessages}
          </Typography>
          <Typography>
            Requests Sent in Last Second: {httpMetrics.messagesLastSecond}
          </Typography>
          <Typography>Running Time: {getHttpRunningTime()} seconds</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">STOMP Metrics</Typography>
          <Typography>
            Total Messages Sent: {stompMetrics.totalMessages}
          </Typography>
          <Typography>
            Messages Sent in Last Second: {stompMetrics.messagesLastSecond}
          </Typography>
          <Typography>Running Time: {getStompRunningTime()} seconds</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
