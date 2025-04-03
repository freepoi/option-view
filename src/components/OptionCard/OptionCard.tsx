import React from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Stack,
  ButtonGroup,
  TextField,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { Option } from "../../types";
import OptionRiskAnalysis from "./OptionRiskAnalysis";

interface OptionCardProps {
  option: Option;
  index: number;
  visible: boolean;
  toggleEditOption: (index: number) => void;
  updateOption: (index: number, field: keyof Option, value: any) => void;
  deleteOption: (id: string) => void;
  toggleOptionVisibility: (id: string) => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  option,
  index,
  visible,
  toggleEditOption,
  updateOption,
  deleteOption,
  toggleOptionVisibility,
}) => {
  // 修复1：统一无限值显示
  const formatRiskValue = (value: number) =>
    Math.abs(value) === Infinity ? "无限" : value.toLocaleString();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        borderLeft: `4px solid ${option.color}`,
      }}
    >
      {/* 标题和操作按钮 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {option.position === "long" ? "买入" : "卖出"}
          {option.type === "call" ? "看涨" : "看跌"} #{index + 1}
        </Typography>
        <Box>
          <IconButton
            size="small"
            onClick={() => toggleEditOption(index)}
            color={option.editing ? "primary" : "default"}
          >
            {option.editing ? (
              <CheckIcon fontSize="small" />
            ) : (
              <EditIcon fontSize="small" />
            )}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => deleteOption(option.id)}
            color="error"
          >
            {option.id}
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* 修复3：所有表单元素在一行 */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mt: 1.5,
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
        }}
      >
        {/* 修复4：美化样式后的期权类型选择 */}
        <ButtonGroup
          size="small"
          variant="outlined"
          disabled={!option.editing}
          sx={{
            "& .MuiButton-root": {
              minWidth: 60,
              fontWeight: 500,
              px: 1,
            },
          }}
        >
          <button
            onClick={() => updateOption(index, "type", "call")}
            style={{
              fontWeight: option.type === "call" ? 600 : 400,
              backgroundColor:
                option.type === "call" ? "#e3f2fd" : "transparent",
              color: option.type === "call" ? "#1976d2" : "inherit",
            }}
          >
            看涨
          </button>
          <button
            onClick={() => updateOption(index, "type", "put")}
            style={{
              fontWeight: option.type === "put" ? 600 : 400,
              backgroundColor:
                option.type === "put" ? "#ffebee" : "transparent",
              color: option.type === "put" ? "#d32f2f" : "inherit",
            }}
          >
            看跌
          </button>
        </ButtonGroup>

        {/* 修复4：美化后的买卖方向选择 */}
        <ButtonGroup
          size="small"
          variant="outlined"
          disabled={!option.editing}
          sx={{
            "& .MuiButton-root": {
              minWidth: 60,
              fontWeight: 500,
              px: 1,
            },
          }}
        >
          <button
            onClick={() => updateOption(index, "position", "long")}
            style={{
              fontWeight: option.position === "long" ? 600 : 400,
              backgroundColor:
                option.position === "long" ? "#e8f5e9" : "transparent",
              color: option.position === "long" ? "#2e7d32" : "inherit",
            }}
          >
            买入
          </button>
          <button
            onClick={() => updateOption(index, "position", "short")}
            style={{
              fontWeight: option.position === "short" ? 600 : 400,
              backgroundColor:
                option.position === "short" ? "#fff3e0" : "transparent",
              color: option.position === "short" ? "#ef6c00" : "inherit",
            }}
          >
            卖出
          </button>
        </ButtonGroup>

        {/* 修复2：可编辑的行权价 */}
        <TextField
          size="small"
          label="行权价"
          type="number"
          value={option.strike}
          onChange={(e) =>
            updateOption(index, "strike", Number(e.target.value))
          }
          disabled={!option.editing}
          sx={{ width: 110 }}
          inputProps={{ step: "0.01" }}
        />

        <TextField
          size="small"
          label="权利金"
          type="number"
          value={option.premium}
          onChange={(e) =>
            updateOption(index, "premium", Number(e.target.value))
          }
          disabled={!option.editing}
          sx={{ width: 100 }}
          inputProps={{ step: "0.0001" }}
        />

        <TextField
          size="small"
          label="数量"
          type="number"
          value={option.quantity}
          onChange={(e) =>
            updateOption(index, "quantity", Number(e.target.value))
          }
          disabled={!option.editing}
          sx={{ width: 80 }}
          inputProps={{ min: 1 }}
        />
      </Stack>

      {/* 风险分析 */}
      <OptionRiskAnalysis
        option={option}
        index={index}
        formatValue={formatRiskValue} // 修复1：传入格式化函数
      />

      {/* 显示控制 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 1,
          cursor: "pointer",
          "&:hover": { opacity: 0.8 },
        }}
        onClick={() => toggleOptionVisibility(option.id)}
      >
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            bgcolor: visible ? option.color : "transparent",
            border: `2px solid ${option.color}`,
            mr: 1,
          }}
        />
        <Typography variant="caption">
          {visible ? "隐藏曲线" : "显示曲线"}
        </Typography>
      </Box>
    </Paper>
  );
};

export default OptionCard;
