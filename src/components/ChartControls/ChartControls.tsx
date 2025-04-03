import React from "react";
import {
  Button,
  Collapse,
  Paper,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

interface ChartControlsProps {
  showOptionsPanel: boolean;
  setShowOptionsPanel: (show: boolean) => void;
  showCombination: boolean;
  setShowCombination: (show: boolean) => void;
  allOptionsSelected: boolean;
  toggleAllOptions: () => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  showOptionsPanel,
  setShowOptionsPanel,
  showCombination,
  setShowCombination,
  allOptionsSelected,
  toggleAllOptions,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        startIcon={showOptionsPanel ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={() => setShowOptionsPanel(!showOptionsPanel)}
        size="small"
        sx={{ color: theme.palette.text.secondary }}
      >
        {showOptionsPanel ? "隐藏图表选项" : "显示图表选项"}
      </Button>

      <Collapse in={showOptionsPanel}>
        <Paper
          elevation={0}
          sx={{ p: 2, mt: 1, bgcolor: theme.palette.background.default }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={showCombination}
                onChange={() => setShowCombination(!showCombination)}
                color="primary"
              />
            }
            label="盈亏曲线"
            sx={{ mb: 1 }}
          />

          <Box sx={{ mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allOptionsSelected}
                  onChange={toggleAllOptions}
                  color="primary"
                />
              }
              label="显示全部期权"
            />
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ChartControls;
