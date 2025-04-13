import React from "react";
import { Box, TextField, Typography, Button, IconButton } from "@mui/material";
import { StompTestConfig, StompMessage } from "../services/StompTester";

interface StompConfigFormProps {
  config: StompTestConfig;
  onChange: (config: StompTestConfig) => void;
  onRemove: () => void;
}

const StompConfigForm: React.FC<StompConfigFormProps> = ({
  config,
  onChange,
  onRemove,
}) => {
  const handleChange =
    (field: keyof Omit<StompTestConfig, "messages">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue: any = e.target.value;
      if (field === "soakRate" || field === "burstRate") {
        newValue = Number(newValue);
      }
      onChange({ ...config, [field]: newValue });
    };

  const handleMessageChange =
    (index: number, field: keyof StompMessage) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const messages = [...config.messages];
      let newValue: any = e.target.value;
      if (field === "headers" || field === "body") {
        try {
          newValue = JSON.parse(newValue);
        } catch (error) {
          newValue = newValue;
        }
      }
      messages[index] = { ...messages[index], [field]: newValue };
      onChange({ ...config, messages });
    };

  const addMessage = () => {
    const newMessage: StompMessage = { destination: "", headers: {}, body: {} };
    onChange({ ...config, messages: [...config.messages, newMessage] });
  };

  const removeMessage = (index: number) => {
    const messages = config.messages.filter((_, i) => i !== index);
    onChange({ ...config, messages });
  };

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid #ccc",
        borderRadius: "8px",
        mb: 2,
        position: "relative",
      }}
    >
      <IconButton
        onClick={onRemove}
        sx={{ position: "absolute", top: 0, right: 0 }}
      >
        Delete
      </IconButton>
      <Typography variant="h6" gutterBottom>
        STOMP Load Test Configuration
      </Typography>
      <TextField
        label="WebSocket Endpoint"
        value={config.endpoint}
        onChange={handleChange("endpoint")}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Soak Rate (messages/sec)"
        type="number"
        value={config.soakRate}
        onChange={handleChange("soakRate")}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Burst Rate (messages/sec)"
        type="number"
        value={config.burstRate}
        onChange={handleChange("burstRate")}
        fullWidth
        margin="normal"
      />
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
        Messages
      </Typography>
      {config.messages.map((message, index) => (
        <Box
          key={index}
          sx={{ border: "1px dashed #aaa", p: 1, mb: 1, position: "relative" }}
        >
          <IconButton
            onClick={() => removeMessage(index)}
            sx={{ position: "absolute", top: 0, right: 0 }}
          >
            Delete
          </IconButton>
          <TextField
            label="Destination"
            value={message.destination}
            onChange={handleMessageChange(index, "destination")}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Headers (JSON)"
            value={
              typeof message.headers === "object"
                ? JSON.stringify(message.headers)
                : message.headers
            }
            onChange={handleMessageChange(index, "headers")}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
          <TextField
            label="Body (JSON)"
            value={
              typeof message.body === "object"
                ? JSON.stringify(message.body)
                : message.body
            }
            onChange={handleMessageChange(index, "body")}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
        </Box>
      ))}
      <Button variant="outlined" onClick={addMessage} sx={{ mt: 1 }}>
        Add Message
      </Button>
    </Box>
  );
};

export default StompConfigForm;
