import React from "react";
import { Chip, Stack, Typography, Paper, Box } from "@mui/material";
import { RiskReward } from "../../types";
import { formatCurrency, formatNumber } from "../../utils/formatters";

interface RiskRewardMetricsProps {
  riskReward: RiskReward & { breakEvens: number[] };
  isSpread?: boolean; // 新增标记是否为价差策略
}

const RiskRewardMetrics: React.FC<RiskRewardMetricsProps> = ({
  riskReward,
  isSpread = false,
}) => {
  // 修正无限值的显示逻辑
  const displayValue = (value: number, isGain: boolean) => {
    if (isSpread) {
      return formatNumber(value); // 价差策略总是显示具体值
    }
    return value === Infinity
      ? "无限"
      : value === -Infinity
      ? "无限"
      : formatNumber(value);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        风险收益指标
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip
          label={`最大收益: ${displayValue(riskReward.maxGain, true)}`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`最大亏损: ${displayValue(riskReward.maxLoss, false)}`}
          color="error"
          variant="outlined"
        />
      </Stack>

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        盈亏平衡点:
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {riskReward.breakEvens.map((point, i) => (
          <Chip
            key={i}
            label={formatCurrency(point)}
            size="small"
            variant="outlined"
          />
        ))}
      </Box>
    </Paper>
  );
};

export default RiskRewardMetrics;
