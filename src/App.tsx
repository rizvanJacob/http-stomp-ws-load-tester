import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  Stack,
  Tooltip,
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
import { IsTestingContext } from "./contexts/IsTestingContext";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { setUsernames } from "./services/BasiscAuthUsernameProvider";

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
const usernamesKey = "usernames";

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
  useEffect(() => {
    localStorage.setItem(httpConfigsKey, JSON.stringify(httpConfigs));
  }, [httpConfigs]);

  const [stompConfigs, setStompConfigs] = useState<
    ConfigType<StompTestConfigType>[]
  >(() => {
    const saved = localStorage.getItem(stompConfigsKey);
    return saved
      ? JSON.parse(saved)
      : [{ id: getUniqueId(), config: { ...defaultStompConfig } }];
  });
  useEffect(() => {
    localStorage.setItem(stompConfigsKey, JSON.stringify(stompConfigs));
  }, [stompConfigs]);

  // Usernames for basic auth
  const [usernamesInput, setUsernamesInput] = useState<string>(() => {
    const saved = localStorage.getItem(usernamesKey);
    return saved || "";
  });
  useEffect(() => {
    localStorage.setItem(usernamesKey, usernamesInput);
    const names = usernamesInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setUsernames(names);
  }, [usernamesInput]);

  // Global soak duration state
  const [isTesting, setIsTesting] = useState(false);
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

  const toggleTest = () => {
    if (isTesting) {
      cancelTesting();
    } else {
      startTesting();
    }
    setIsTesting((prev) => !prev);
  };

  // Start all tests
  const startTesting = async () => {
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

    const newStompHandles = await Promise.all(
      stompConfigs.map(async (item) => {
        if (item.config.endpoint) {
          return await runStompTest(item.config, soakDuration);
        }
        return { cancel: () => {} };
      })
    );
    setStompCancelHandles(newStompHandles);

    // Automatically stop testing after soakDuration
    setTimeout(() => {
      cancelTesting();
      setIsTesting(false);
    }, soakDuration * 1000);
  };

  // Cancel all running tests
  const cancelTesting = () => {
    httpCancelHandles.forEach((handle) => handle.cancel());
    stompCancelHandles.forEach((handle) => handle.cancel());
    setHttpCancelHandles([]);
    setStompCancelHandles([]);
  };

  const getRunningTime = () => {
    const httpRunningTime = getHttpRunningTime();
    const stompRunningTime = getStompRunningTime();
    return httpRunningTime > stompRunningTime
      ? httpRunningTime
      : stompRunningTime;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          HTTP and STOMP (over WebSocket) Load Tester
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This load test will send a burst of requests/messages immediately,
          then continue sending at the specified soak rate for the test
          duration.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          HTTP Requests and STOMP (over WebSocket) messages are supported. Use
          the forms below to configure your test as desired, then start the
          test.
        </Typography>
        <IsTestingContext.Provider value={isTesting}>
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
            <Button
              variant="outlined"
              onClick={addHttpConfig}
              sx={{ mt: 1 }}
              disabled={isTesting}
            >
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
            <Button
              variant="outlined"
              onClick={addStompConfig}
              sx={{ mt: 1 }}
              disabled={isTesting}
            >
              Add STOMP over WebSocket Connection
            </Button>
          </Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            WARNING: Only use this tool against systems where you have explicit
            permission. Misuse may be considered a DDOS attack.
          </Alert>
          <Stack direction="row" spacing={1}>
            <Tooltip
              sx={{ flex: 1 }}
              title="Enter a comma-separated list of usernames to be used for Basic Authentication. Each username will be looped through and attached to HTTP requests during the test."
            >
              <TextField
                label="Basic Auth Usernames (comma separated)"
                value={usernamesInput}
                onChange={(e) => setUsernamesInput(e.target.value)}
                fullWidth
                disabled={isTesting}
              />
            </Tooltip>
            <TextField
              label="Test Duration (seconds)"
              type="number"
              value={soakDuration}
              onChange={(e) => setSoakDuration(Number(e.target.value))}
              disabled={isTesting}
            />
            <Button
              variant={isTesting ? "outlined" : "contained"}
              color={isTesting ? "error" : "primary"}
              onClick={toggleTest}
            >
              {isTesting ? "Cancel Test" : "Start Test"}
            </Button>
          </Stack>
        </IsTestingContext.Provider>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Metrics</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography>
              Total HTTP Requests Sent: {httpMetrics.totalMessages}
            </Typography>
            <Typography>
              HTTP Requests Sent in Last Second:{" "}
              {httpMetrics.messagesLastSecond}
            </Typography>
            <Typography>
              Total STOMP Messages Sent: {stompMetrics.totalMessages}
            </Typography>
            <Typography>
              STOMP Messages Sent in Last Second:{" "}
              {stompMetrics.messagesLastSecond}
            </Typography>
            {isTesting && (
              <Typography>Running Time: {getRunningTime()} seconds</Typography>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
