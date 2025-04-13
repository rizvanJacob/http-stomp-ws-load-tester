import React from "react";
import { Stack, TextField } from "@mui/material";

interface RateConfigProps {
  soakRate: number;
  burstRate: number;
  onChange: (field: "soakRate" | "burstRate", value: number) => void;
}

const RateConfig: React.FC<RateConfigProps> = ({
  soakRate,
  burstRate,
  onChange,
}) => {
  return (
    <Stack direction="row" alignItems="center">
      <TextField
        label="Soak Rate (per sec)"
        type="number"
        value={soakRate}
        onChange={(e) => onChange("soakRate", Number(e.target.value))}
        fullWidth
      />
      <TextField
        label="Burst Rate (per sec)"
        type="number"
        value={burstRate}
        onChange={(e) => onChange("burstRate", Number(e.target.value))}
        fullWidth
      />
    </Stack>
  );
};

export default RateConfig;
