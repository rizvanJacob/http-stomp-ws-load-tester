import React, { useContext } from "react";
import { Stack, TextField } from "@mui/material";
import { IsTestingContext } from "../contexts/IsTestingContext";

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
  const isTesting = useContext(IsTestingContext);

  return (
    <Stack direction="row" alignItems="center">
      <TextField
        label="Soak Rate (per sec)"
        type="number"
        value={soakRate}
        onChange={(e) => onChange("soakRate", Number(e.target.value))}
        fullWidth
        disabled={isTesting}
      />
      <TextField
        label="Burst Rate (per sec)"
        type="number"
        value={burstRate}
        onChange={(e) => onChange("burstRate", Number(e.target.value))}
        fullWidth
        disabled={isTesting}
      />
    </Stack>
  );
};

export default RateConfig;
