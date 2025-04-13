import {
  TextField,
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { AllowedMethodsType, HttpTestConfigType } from "../services/HttpTester";
import RateConfig from "./RateConfig";
import { useContext } from "react";
import { IsTestingContext } from "../contexts/IsTestingContext";

type HttpConfigFormPropsType = {
  config: HttpTestConfigType;
  onChange: (config: HttpTestConfigType) => void;
  onRemove: () => void;
};

const HttpConfigForm: React.FC<HttpConfigFormPropsType> = ({
  config,
  onChange,
  onRemove,
}) => {
  const isTesting = useContext(IsTestingContext);

  const handleChange =
    (field: keyof HttpTestConfigType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue: unknown = e.target.value;
      if (field === "soakRate" || field === "burstRate") {
        newValue = Number(newValue);
      } else if (field === "method") {
        newValue = newValue as AllowedMethodsType;
      } else if (field === "body") {
        try {
          newValue = JSON.parse(newValue as string);
        } catch (err) {
          console.error(err);
          newValue = newValue as string;
        }
      }
      onChange({ ...config, [field]: newValue });
    };

  return (
    <Accordion sx={{ mb: 2, position: "relative" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">
          {config.url && config.method
            ? `${config.method.toUpperCase()} to ${config.url}`
            : "New HTTP Request"}
        </Typography>
        <IconButton onClick={onRemove} sx={{ ml: "auto" }} disabled={isTesting}>
          <DeleteIcon />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            alignContent="center"
            alignItems="center"
          >
            <FormControl sx={{ width: "25%" }}>
              <InputLabel>Method</InputLabel>
              <Select
                value={config.method}
                label="Method"
                onChange={(e) =>
                  handleChange("method")(
                    e as React.ChangeEvent<HTMLInputElement>
                  )
                }
                disabled={isTesting}
              >
                <MenuItem value={"get"}>GET</MenuItem>
                <MenuItem value={"post"}>POST</MenuItem>
                <MenuItem value={"put"}>PUT</MenuItem>
                <MenuItem value={"patch"}>PATH</MenuItem>
                <MenuItem value={"delete"}>DELETE</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="URL"
              value={config.url}
              onChange={handleChange("url")}
              fullWidth
              margin="none"
              disabled={isTesting}
            />
          </Stack>
          <TextField
            sx={{ flex: 1 }}
            label="JSON Body"
            value={
              typeof config.body === "object"
                ? JSON.stringify(config.body, null, 2)
                : config.body
            }
            onChange={handleChange("body")}
            fullWidth
            margin="normal"
            multiline
            minRows={3}
            disabled={isTesting}
          />
          <RateConfig
            soakRate={config.soakRate}
            burstRate={config.burstRate}
            onChange={(field, value) => onChange({ ...config, [field]: value })}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default HttpConfigForm;
