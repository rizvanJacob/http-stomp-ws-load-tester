import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  Stack,
} from "@mui/material";
import HttpConfigForm from "./components/HttpConfigForm";
import StompConfigForm from "./components/StompConfigForm";
import {
  HttpTestConfigType,
  runHttpTest,
  httpMetrics,
  getRunningTime as getHttpRunningTime,
} from "./services/HttpTester";
import {
  StompTestConfigType,
  runStompTest,
  stompMetrics,
  getRunningTime as getStompRunningTime,
} from "./services/StompTester";

// Utility to generate unique IDs
let idCounter = 1;
const getUniqueId = () => idCounter++;

const defaultHttpConfig: HttpTestConfigType = {
  url: "",
  method: "get",
  body: {},
  soakRate: 1,
  burstRate: 1,
};

const defaultStompConfig: StompTestConfigType = {
  endpoint: "",
  messages: [],
  soakRate: 1,
  burstRate: 1,
};

// Types for stored configs
interface ConfigType<T> {
  id: number;
  config: T;
}

const httpConfigsKey = "httpConfigs";
const stompConfigsKey = "stompConfigs";

function App() {
  // State for configurations
  const [httpConfigs, setHttpConfigs] = useState<
    ConfigType<HttpTestConfigType>[]
  >(() => {
    const saved = localStorage.getItem(httpConfigsKey);
    return saved
      ? JSON.parse(saved)
      : [{ id: getUniqueId(), config: { ...defaultHttpConfig } }];
  });

  const [stompConfigs, setStompConfigs] = useState<
    ConfigType<StompTestConfigType>[]
  >(() => {
    const saved = localStorage.getItem(stompConfigsKey);
    return saved
      ? JSON.parse(saved)
      : [{ id: getUniqueId(), config: { ...defaultStompConfig } }];
  });

  useEffect(() => {
    localStorage.setItem(httpConfigsKey, JSON.stringify(httpConfigs));
  }, [httpConfigs]);

  useEffect(() => {
    localStorage.setItem(stompConfigsKey, JSON.stringify(stompConfigs));
  }, [stompConfigs]);

  // Global soak duration state
  const [soakDuration, setSoakDuration] = useState(60); // default 60 seconds

  // Dummy state for re-rendering metrics
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Active test cancellation handles
  const [httpCancelHandles, setHttpCancelHandles] = useState<
    { cancel: () => void }[]
  >([]);
  const [stompCancelHandles, setStompCancelHandles] = useState<
    { cancel: () => void }[]
  >([]);

  // Handlers for HTTP configs
  const updateHttpConfig = (id: number, newConfig: HttpTestConfigType) => {
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
  const updateStompConfig = (id: number, newConfig: StompTestConfigType) => {
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
    // Clear any existing test handles
    httpCancelHandles.forEach((handle) => handle.cancel());
    stompCancelHandles.forEach((handle) => handle.cancel());
    setHttpCancelHandles([]);
    setStompCancelHandles([]);

    const newHttpHandles = httpConfigs.map((item) => {
      if (item.config.url) {
        return runHttpTest(item.config, soakDuration);
      }
      return { cancel: () => {} };
    });
    setHttpCancelHandles(newHttpHandles);

    const newStompHandles = stompConfigs.map((item) => {
      if (item.config.endpoint) {
        return runStompTest(item.config, soakDuration);
      }
      return { cancel: () => {} };
    });
    setStompCancelHandles(newStompHandles);
  };

  // Cancel all running tests
  const cancelTesting = () => {
    httpCancelHandles.forEach((handle) => handle.cancel());
    stompCancelHandles.forEach((handle) => handle.cancel());
    setHttpCancelHandles([]);
    setStompCancelHandles([]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        HTTP and STOMP (over WebSocket) Load Tester
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        This load test will send a burst of requests/messages immediately, then
        continue sending at the specified soak rate for the test duration.
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        HTTP Requests and STOMP (over WebSocket) messages are supported. Use the
        forms below to configure your test as desired, then start the test.
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
          Add HTTP Request
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
          Add STOMP over WebSocket Connection
        </Button>
      </Box>
      <Alert severity="warning" sx={{ mb: 2 }}>
        WARNING: Only use this tool against systems where you have explicit
        permission. Misuse may be considered a DDOS attack.
      </Alert>
      <Stack direction="row" spacing={1}>
        <TextField
          label="Test Duration (seconds)"
          type="number"
          value={soakDuration}
          onChange={(e) => setSoakDuration(Number(e.target.value))}
        />
        <Button variant="contained" color="primary" onClick={startTesting}>
          Start Testing
        </Button>
        <Button variant="outlined" color="error" onClick={cancelTesting}>
          Cancel Test
        </Button>
      </Stack>
      <Box sx={{ mt: 4 }}>
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
