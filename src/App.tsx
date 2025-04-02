import React, { useState } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import ProfitChart from "./components/ProfitChart";
import { theme } from "./theme";
import { Option } from "./types";

const initialOptions: Option[] = [
  {
    type: "call",
    position: "long",
    strike: 85000,
    premium: 2000,
    quantity: 1,
  },
  {
    type: "call",
    position: "short",
    strike: 87000,
    premium: 1130,
    quantity: 1,
  },
];

const App: React.FC = () => {
  const [options, setOptions] = useState<Option[]>(initialOptions);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            mb: 3,
            fontWeight: 600,
            color: theme.palette.primary.main,
          }}
        >
          加密货币期权组合分析工具
        </Typography>

        <ProfitChart options={options} setOptions={setOptions} />

        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            提示：添加期权后，点击编辑图标修改参数，使用复选框控制曲线显示
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
