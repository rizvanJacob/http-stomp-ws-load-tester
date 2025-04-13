import React, { useContext } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { StompTestConfigType, StompMessageType } from "../services/StompTester";
import StompMessageConfigForm from "./StompMessageConfigForm";
import { IsTestingContext } from "../contexts/IsTestingContext";

interface StompConfigFormProps {
  config: StompTestConfigType;
  onChange: (config: StompTestConfigType) => void;
  onRemove: () => void;
}

const StompConfigForm: React.FC<StompConfigFormProps> = ({
  config,
  onChange,
  onRemove,
}) => {
  const isTesting = useContext(IsTestingContext);

  const handleChange =
    (field: keyof Omit<StompTestConfigType, "messages">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue: unknown = e.target.value;
      onChange({ ...config, [field]: newValue });
    };

  const addMessage = () => {
    const newMessage: StompMessageType = {
      destination: "",
      headers: {},
      body: {},
      soakRate: 1,
      burstRate: 1,
    };
    onChange({ ...config, messages: [...config.messages, newMessage] });
  };

  return (
    <Accordion sx={{ mb: 2, position: "relative" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">
          {config.endpoint
            ? `Websocket Connection: ${config.endpoint}`
            : "New Websocket Connection Configuration"}
        </Typography>
        <IconButton onClick={onRemove} sx={{ ml: "auto" }} disabled={isTesting}>
          <DeleteIcon />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ p: 2 }}>
          <TextField
            label="WebSocket Endpoint"
            value={config.endpoint}
            onChange={handleChange("endpoint")}
            fullWidth
            margin="normal"
            disabled={isTesting}
          />
          {config.messages.map((message, index) => (
            <StompMessageConfigForm
              key={index}
              message={message}
              index={index}
              onChange={(idx, field, value) => {
                const messages = [...config.messages];
                messages[idx] = { ...messages[idx], [field]: value };
                onChange({ ...config, messages });
              }}
              onRateChange={(idx, field, value) => {
                const messages = [...config.messages];
                messages[idx] = { ...messages[idx], [field]: value };
                onChange({ ...config, messages });
              }}
              onRemove={(idx) => {
                const messages = config.messages.filter((_, i) => i !== idx);
                onChange({ ...config, messages });
              }}
            />
          ))}
          <Button
            variant="outlined"
            onClick={addMessage}
            sx={{ mt: 1 }}
            disabled={isTesting}
          >
            Add STOMP Message
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default StompConfigForm;
