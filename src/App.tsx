import React, { useState } from "react";
import { OptionForm } from "./components/OptionForm";
import ProfitChart from "./components/ProfitChart";
import { StrategySummary } from "./components/StrategySummary";
import { ThemeProvider, CssBaseline } from "@mui/material";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { lightTheme } from "./theme";
import { Option } from "./types";

function App() {
  const [options, setOptions] = useState<Option[]>([]);

  const addOption = (option: Option) => {
    setOptions([...options, option]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const updateOption = (index: number, updatedOption: Option) => {
    const newOptions = [...options];
    newOptions[index] = updatedOption;
    setOptions(newOptions);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            加密货币期权组合分析工具
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <OptionForm addOption={addOption} />
        </Paper>

        {options.length > 0 && (
          <>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <ProfitChart options={options} />
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
              <StrategySummary
                options={options}
                removeOption={removeOption}
                updateOption={updateOption}
              />
            </Paper>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
