import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Divider,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Option } from "../types";

interface OptionFormProps {
  addOption: (option: Option) => void;
}

export const OptionForm: React.FC<OptionFormProps> = ({ addOption }) => {
  const [type, setType] = useState<"call" | "put">("call");
  const [strike, setStrike] = useState<string>("");
  const [premium, setPremium] = useState<string>("");
  const [position, setPosition] = useState<"long" | "short">("long");
  const [quantity, setQuantity] = useState<string>("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const option: Option = {
      type,
      strike: parseFloat(strike),
      premium: parseFloat(premium),
      position,
      quantity: parseInt(quantity, 10),
    };
    addOption(option);
    setStrike("");
    setPremium("");
    setQuantity("1");
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        添加期权合约
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="option-type-label">期权类型</InputLabel>
            <Select
              labelId="option-type-label"
              value={type}
              onChange={(e) => setType(e.target.value as "call" | "put")}
              label="期权类型"
            >
              <MenuItem value="call">看涨期权</MenuItem>
              <MenuItem value="put">看跌期权</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="position-label">头寸方向</InputLabel>
            <Select
              labelId="position-label"
              value={position}
              onChange={(e) => setPosition(e.target.value as "long" | "short")}
              label="头寸方向"
            >
              <MenuItem value="long">买入</MenuItem>
              <MenuItem value="short">卖出</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="行权价"
            type="number"
            value={strike}
            onChange={(e) => setStrike(e.target.value)}
            required
            inputProps={{ step: "0.01" }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="权利金"
            type="number"
            value={premium}
            onChange={(e) => setPremium(e.target.value)}
            required
            inputProps={{ step: "0.0001" }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="数量"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 1 }}
            startIcon={<AddIcon />}
          >
            添加期权合约
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
