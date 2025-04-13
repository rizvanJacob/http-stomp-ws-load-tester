import React, { useContext } from "react";
import { Stack, TextField, Tooltip } from "@mui/material";
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
      <Tooltip
        title="The rate at which to send this request/message for the duration of this test"
        followCursor
        placement="right"
      >
        <TextField
          label="Soak Rate (per sec)"
          type="number"
          value={soakRate}
          onChange={(e) => onChange("soakRate", Number(e.target.value))}
          fullWidth
          disabled={isTesting}
        />
      </Tooltip>
      <Tooltip
        title="The number of requests/messages to send at the start of this test (burst)"
        followCursor
        placement="right"
      >
        <TextField
          label="Burst Count"
          type="number"
          value={burstRate}
          onChange={(e) => onChange("burstRate", Number(e.target.value))}
          fullWidth
          disabled={isTesting}
        />
      </Tooltip>
    </Stack>
  );
};

export default RateConfig;
