import React from "react";
import { Paper, Grid, Typography, IconButton, Box, Stack } from "@mui/material";
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Option } from "../../types";
import OptionForm from "./OptionForm";
import OptionRiskAnalysis from "./OptionRiskAnalysis";

interface OptionCardProps {
  option: Option;
  index: number;
  visible: boolean;
  getColor: (index: number) => string;
  toggleEditOption: (index: number) => void;
  updateOption: (index: number, field: keyof Option, value: any) => void;
  deleteOption: (index: number) => void;
  toggleOptionVisibility: (index: number) => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  option,
  index,
  visible,
  getColor,
  toggleEditOption,
  updateOption,
  deleteOption,
  toggleOptionVisibility,
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Typography variant="subtitle1">期权 #{index + 1}</Typography>
          <Box>
            <IconButton
              onClick={() => toggleEditOption(index)}
              color={option.editing ? "primary" : "default"}
            >
              {option.editing ? <CheckIcon /> : <EditIcon />}
            </IconButton>
            <IconButton onClick={() => deleteOption(index)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Grid>

        <OptionForm option={option} index={index} updateOption={updateOption} />

        <OptionRiskAnalysis option={option} index={index} getColor={getColor} />

        <Grid item xs={12}>
          <Stack direction="row" alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: visible ? getColor(index) : "transparent",
                border: `1px solid ${getColor(index)}`,
                mr: 1.5,
              }}
            />
            <Typography variant="body2">在图表中显示此期权</Typography>
            <Box sx={{ ml: "auto" }}>
              <input
                type="checkbox"
                checked={visible}
                onChange={() => toggleOptionVisibility(index)}
                style={{
                  accentColor: getColor(index),
                  width: 18,
                  height: 18,
                  cursor: "pointer",
                }}
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OptionCard;
