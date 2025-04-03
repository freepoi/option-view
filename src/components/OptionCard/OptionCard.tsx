import React from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Option } from "../../types";
import OptionRiskAnalysis from "./OptionRiskAnalysis";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";

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
  updateOption,
  deleteOption,
  toggleOptionVisibility,
}) => {
  const formatRiskValue = (value: number) =>
    Math.abs(value) === Infinity ? "无限" : value.toLocaleString();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        // borderTop: `4px solid ${option.color}`,
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
        <Typography
          // color={option.color}
          variant="subtitle2"
          sx={{ fontWeight: 600 }}
        >
          {option.position === "long" ? "买入" : "卖出"}
          {option.type === "call" ? "看涨" : "看跌"}{" "}
          {`${option.strike > 0 ? "$" + option.strike : ""}`}
        </Typography>
        <Box>
          {/* <IconButton
            size="small"
            onClick={() => toggleEditOption(index)}
            color={option.editing ? "primary" : "default"}
          >
            {option.editing ? (
              <CheckIcon fontSize="small" />
            ) : (
              <EditIcon fontSize="small" />
            )}
          </IconButton> */}
          <IconButton
            color="primary"
            size="small"
            onClick={() => deleteOption(option.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

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
        {/* 期权类型选择 */}
        <ToggleButtonGroup
          size="small"
          exclusive
          value={option.position}
          // disabled={disabled}
          onChange={(_, newPos) =>
            newPos && updateOption(index, "position", newPos)
          }
          disabled={!option.editing}
        >
          <ToggleButton
            color="primary"
            value="long"
            sx={{
              textTransform: "none",
            }}
          >
            买入
          </ToggleButton>
          <ToggleButton
            value="short"
            sx={{
              textTransform: "none",
            }}
          >
            卖出
          </ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          color="primary"
          sx={{ ml: 1 }}
          size="small"
          exclusive
          value={option.type}
          onChange={(_, newPos) =>
            newPos && updateOption(index, "type", newPos)
          }
          disabled={!option.editing}
        >
          <ToggleButton
            value="call"
            sx={{
              textTransform: "none",
            }}
          >
            看涨
          </ToggleButton>
          <ToggleButton
            value="put"
            sx={{
              textTransform: "none",
            }}
          >
            看跌
          </ToggleButton>
        </ToggleButtonGroup>

        {/* 修复2：可编辑的行权价 */}
        <TextField
          size="small"
          label="行权价"
          type="number"
          variant="standard"
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
          variant="standard"
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
          variant="standard"
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
