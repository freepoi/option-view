import React from "react";
import { Box, Chip, Stack } from "@mui/material";
import { calculateOptionRiskReward, Option } from "../../utils/calculations";

interface OptionRiskAnalysisProps {
  option: Option;
  index: number;
  formatValue: (value: number) => string;
}

const OptionRiskAnalysis: React.FC<OptionRiskAnalysisProps> = ({
  option,
  formatValue,
}) => {
  const riskReward = calculateOptionRiskReward(option);

  return (
    <Box sx={{ mt: 1.5 }}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        <Chip
          label={`盈亏平衡: ${formatValue(riskReward.breakEven)}`}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`最大收益: ${formatValue(riskReward.maxGain)}`}
          size="small"
          color="success"
          variant="outlined"
        />
        <Chip
          label={`最大亏损: ${formatValue(riskReward.maxLoss)}`}
          size="small"
          color="error"
          variant="outlined"
        />
      </Stack>
    </Box>
  );
};

export default OptionRiskAnalysis;
