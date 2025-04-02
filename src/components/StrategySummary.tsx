import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { Option } from "../types";

interface StrategySummaryProps {
  options: Option[];
  removeOption: (index: number) => void;
  updateOption: (index: number, option: Option) => void;
}

interface EditableFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onChange,
  type = "text",
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempValue, setTempValue] = React.useState(value.toString());

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  return isEditing ? (
    <Box display="flex" alignItems="center">
      <TextField
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        type={type}
        size="small"
        sx={{ width: 80 }}
      />
      <Button onClick={handleSave} size="small" sx={{ minWidth: 0 }}>
        <CheckIcon fontSize="small" />
      </Button>
    </Box>
  ) : (
    <Box display="flex" alignItems="center">
      <Typography>{value}</Typography>
      <Button
        onClick={() => setIsEditing(true)}
        size="small"
        sx={{ minWidth: 0 }}
      >
        <EditIcon fontSize="small" />
      </Button>
    </Box>
  );
};

export const StrategySummary: React.FC<StrategySummaryProps> = ({
  options,
  removeOption,
  updateOption,
}) => {
  const calculateBreakEvenPoints = (): number[] => {
    if (options.length === 0) return [];

    // For complex strategies, we need to find where the profit crosses zero
    const prices = [0];
    options.forEach((opt) => {
      prices.push(opt.strike);
      prices.push(opt.strike * 0.8);
      prices.push(opt.strike * 1.2);
    });
    prices.sort((a, b) => a - b);

    const zeroCrossings: number[] = [];
    for (let i = 0; i < prices.length - 1; i++) {
      const p1 = prices[i];
      const p2 = prices[i + 1];
      const profit1 = calculateProfitAtPrice(p1);
      const profit2 = calculateProfitAtPrice(p2);

      if (profit1 * profit2 < 0) {
        // Linear approximation for zero crossing
        const zeroPoint = p1 - (profit1 * (p2 - p1)) / (profit2 - profit1);
        zeroCrossings.push(zeroPoint);
      } else if (profit1 === 0) {
        zeroCrossings.push(p1);
      }
    }

    return zeroCrossings
      .map((p) => parseFloat(p.toFixed(2)))
      .sort((a, b) => a - b);
  };

  const calculateProfitAtPrice = (price: number): number => {
    return options.reduce((total, option) => {
      let optionProfit = 0;
      if (option.type === "call") {
        const intrinsic = Math.max(0, price - option.strike);
        optionProfit =
          option.position === "long"
            ? intrinsic - option.premium
            : option.premium - intrinsic;
      } else {
        const intrinsic = Math.max(0, option.strike - price);
        optionProfit =
          option.position === "long"
            ? intrinsic - option.premium
            : option.premium - intrinsic;
      }
      return total + optionProfit * option.quantity;
    }, 0);
  };

  const calculateMaxProfitLoss = () => {
    if (options.length === 0) return { maxProfit: 0, maxLoss: 0 };

    // Check extreme points: 0, all strikes, and infinity
    const testPrices = [0];
    options.forEach((opt) => {
      testPrices.push(opt.strike);
      testPrices.push(opt.strike * 0.9);
      testPrices.push(opt.strike * 1.1);
    });
    testPrices.push(1e6); // A very large number to simulate infinity

    const profits = testPrices.map((price) => calculateProfitAtPrice(price));
    const maxProfit = Math.max(...profits);
    const maxLoss = Math.min(...profits);

    return {
      maxProfit: parseFloat(maxProfit.toFixed(2)),
      maxLoss: parseFloat(maxLoss.toFixed(2)),
    };
  };

  const breakEvenPoints = calculateBreakEvenPoints();
  const { maxProfit, maxLoss } = calculateMaxProfitLoss();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        策略摘要
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              盈亏平衡点
            </Typography>
            {breakEvenPoints.length > 0 ? (
              breakEvenPoints.map((point, index) => (
                <Chip
                  key={index}
                  label={`$${point}`}
                  color="primary"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))
            ) : (
              <Typography variant="body2">无明确盈亏平衡点</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              最大收益
            </Typography>
            <Typography variant="h5" color="success.main">
              ${maxProfit}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              最大亏损
            </Typography>
            <Typography variant="h5" color="error">
              ${maxLoss}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" gutterBottom>
        当前期权组合
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>类型</TableCell>
              <TableCell>方向</TableCell>
              <TableCell>行权价</TableCell>
              <TableCell>权利金</TableCell>
              <TableCell>数量</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {options.map((option, index) => (
              <TableRow key={index}>
                <TableCell>
                  <EditableField
                    value={option.type === "call" ? "看涨" : "看跌"}
                    onChange={(value) =>
                      updateOption(index, {
                        ...option,
                        type: value === "看涨" ? "call" : "put",
                      })
                    }
                  />
                </TableCell>
                <TableCell>
                  <EditableField
                    value={option.position === "long" ? "买入" : "卖出"}
                    onChange={(value) =>
                      updateOption(index, {
                        ...option,
                        position: value === "买入" ? "long" : "short",
                      })
                    }
                  />
                </TableCell>
                <TableCell>
                  <EditableField
                    value={option.strike.toFixed(2)}
                    onChange={(value) =>
                      updateOption(index, {
                        ...option,
                        strike: parseFloat(value),
                      })
                    }
                    type="number"
                  />
                </TableCell>
                <TableCell>
                  <EditableField
                    value={option.premium.toFixed(4)}
                    onChange={(value) =>
                      updateOption(index, {
                        ...option,
                        premium: parseFloat(value),
                      })
                    }
                    type="number"
                  />
                </TableCell>
                <TableCell>
                  <EditableField
                    value={option.quantity}
                    onChange={(value) =>
                      updateOption(index, {
                        ...option,
                        quantity: parseInt(value, 10),
                      })
                    }
                    type="number"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => removeOption(index)}
                  >
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
