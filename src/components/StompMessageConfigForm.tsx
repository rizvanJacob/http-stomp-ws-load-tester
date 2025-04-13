import React, { useContext } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { StompMessageType } from "../services/StompTester";
import RateConfig from "./RateConfig";
import { IsTestingContext } from "../contexts/IsTestingContext";

interface StompMessageConfigFormProps {
  message: StompMessageType;
  index: number;
  onChange: (
    index: number,
    field: keyof StompMessageType,
    value: unknown
  ) => void;
  onRateChange: (
    index: number,
    field: "soakRate" | "burstRate",
    value: number
  ) => void;
  onRemove: (index: number) => void;
}

const StompMessageConfigForm: React.FC<StompMessageConfigFormProps> = ({
  message,
  index,
  onChange,
  onRateChange,
  onRemove,
}) => {
  const isTesting = useContext(IsTestingContext);

  const handleFieldChange =
    (field: keyof StompMessageType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue: unknown | object | string = e.target.value;
      if (field === "headers" || field === "body") {
        try {
          newValue = JSON.parse(newValue as string);
        } catch (err) {
          console.error(err);
        }
      } else if (field === "soakRate" || field === "burstRate") {
        newValue = Number(newValue);
      }
      onChange(index, field, newValue);
    };

  return (
    <Accordion sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">
          {message.destination
            ? `Message to ${message.destination}`
            : "New Message Configuration"}
        </Typography>
        <IconButton
          onClick={() => onRemove(index)}
          sx={{ ml: "auto" }}
          disabled={isTesting}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        <TextField
          label="Destination"
          value={message.destination}
          onChange={handleFieldChange("destination")}
          fullWidth
          margin="normal"
          disabled={isTesting}
        />
        <TextField
          label="Headers (JSON)"
          value={
            typeof message.headers === "object"
              ? JSON.stringify(message.headers)
              : message.headers
          }
          onChange={handleFieldChange("headers")}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
          disabled={isTesting}
        />
        <TextField
          label="Body (JSON)"
          value={
            typeof message.body === "object"
              ? JSON.stringify(message.body)
              : message.body
          }
          onChange={handleFieldChange("body")}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
          disabled={isTesting}
        />
        <RateConfig
          soakRate={message.soakRate}
          burstRate={message.burstRate}
          onChange={(field, value) => onRateChange(index, field, value)}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default StompMessageConfigForm;
