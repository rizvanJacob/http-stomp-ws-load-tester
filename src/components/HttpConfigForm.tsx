import { TextField, Box, Typography, IconButton } from "@mui/material";
import { HttpTestConfig } from "../services/HttpTester";
import { RemoveCircleOutline } from "@mui/icons-material";

interface HttpConfigFormProps {
  config: HttpTestConfig;
  onChange: (config: HttpTestConfig) => void;
  onRemove: () => void;
}

const HttpConfigForm: React.FC<HttpConfigFormProps> = ({
  config,
  onChange,
  onRemove,
}) => {
  const handleChange =
    (field: keyof HttpTestConfig) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue: unknown = e.target.value;
      if (field === "soakRate" || field === "burstRate") {
        newValue = Number(newValue);
      } else if (field === "body") {
        // Try to parse JSON, if fails then keep as string
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
        <RemoveCircleOutline />
      </IconButton>
      <Typography variant="h6" gutterBottom>
        Configure HTTP Load Test
      </Typography>
      <TextField
        label="URL"
        value={config.url}
        onChange={handleChange("url")}
        fullWidth
        margin="normal"
      />
      <TextField
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
      />
      <TextField
        label="Soak Rate (requests/sec)"
        type="number"
        value={config.soakRate}
        onChange={handleChange("soakRate")}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Burst Rate (requests/sec)"
        type="number"
        value={config.burstRate}
        onChange={handleChange("burstRate")}
        fullWidth
        margin="normal"
      />
    </Box>
  );
};

export default HttpConfigForm;
