import React from "react";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { Option } from "../../types";

interface OptionFormProps {
  option: Option;
  index: number;
  updateOption: (index: number, field: keyof Option, value: any) => void;
}

const OptionForm: React.FC<OptionFormProps> = ({
  option,
  index,
  updateOption,
}) => {
  return (
    <>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>期权类型</InputLabel>
          <Select
            value={option.type}
            onChange={(e) => updateOption(index, "type", e.target.value)}
            label="期权类型"
            disabled={!option.editing}
          >
            <MenuItem value="call">看涨期权</MenuItem>
            <MenuItem value="put">看跌期权</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>交易方向</InputLabel>
          <Select
            value={option.position}
            onChange={(e) => updateOption(index, "position", e.target.value)}
            label="交易方向"
            disabled={!option.editing}
          >
            <MenuItem value="long">买入</MenuItem>
            <MenuItem value="short">卖出</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="行权价"
          type="number"
          value={option.strike}
          onChange={(e) =>
            updateOption(index, "strike", Number(e.target.value))
          }
          disabled={!option.editing}
          inputProps={{ step: "0.01" }}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="权利金"
          type="number"
          value={option.premium}
          onChange={(e) =>
            updateOption(index, "premium", Number(e.target.value))
          }
          disabled={!option.editing}
          inputProps={{ step: "0.0001" }}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="数量"
          type="number"
          value={option.quantity}
          onChange={(e) =>
            updateOption(index, "quantity", Number(e.target.value))
          }
          disabled={!option.editing}
          inputProps={{ min: 1 }}
        />
      </Grid>
    </>
  );
};

export default OptionForm;
