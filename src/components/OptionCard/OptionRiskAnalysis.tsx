import React from "react";
import { Box, Typography, Chip, Stack, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  calculateOptionRiskReward,
  formatCurrency,
  formatNumber,
  Option,
} from "../../utils";

interface OptionRiskAnalysisProps {
  option: Option;
  index: number;
  getColor: (index: number) => string;
}

const OptionRiskAnalysis: React.FC<OptionRiskAnalysisProps> = ({ option }) => {
  const theme = useTheme();
  const riskReward = calculateOptionRiskReward(option);

  return (
    <Grid item xs={12}>
      <Box
        sx={{
          p: 2,
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          mt: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          风险分析:
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          <Chip
            label={`最大收益: ${
              riskReward.maxGain === Infinity
                ? "无限"
                : formatNumber(riskReward.maxGain)
            }`}
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip
            label={`最大亏损: ${
              riskReward.maxLoss === -Infinity
                ? "无限"
                : formatNumber(riskReward.maxLoss)
            }`}
            size="small"
            color="error"
            variant="outlined"
          />
          <Chip
            label={`盈亏平衡: ${formatCurrency(riskReward.breakEven)}`}
            size="small"
            variant="outlined"
          />
        </Stack>
      </Box>
    </Grid>
  );
};

export default OptionRiskAnalysis;
