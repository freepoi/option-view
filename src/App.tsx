import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Box,
  Button,
} from "@mui/material";
import {
  ProfitChart,
  RiskRewardMetrics,
  OptionCard,
  ChartControls,
} from "./components";
import { theme } from "./theme";
import { Option } from "./types";
import { calculatePortfolioRiskReward } from "./utils/calculations";

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
  const [showCombination, setShowCombination] = useState(true);
  const [visibleOptions, setVisibleOptions] = useState<number[]>([]);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);

  const portfolioRiskReward = useMemo(
    () => calculatePortfolioRiskReward(options),
    [options]
  );
  const priceDomain = useMemo(() => {
    if (options.length === 0) return [0, 100000] as [number, number];
    const strikes = options.map((o) => o.strike);
    return [Math.min(...strikes) * 0.7, Math.max(...strikes) * 1.3] as [
      number,
      number
    ];
  }, [options]);

  const getColor = useCallback((index: number) => {
    const colors = [
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
    ];
    return colors[index % colors.length];
  }, []);

  const toggleOptionVisibility = (index: number) => {
    setVisibleOptions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleEditOption = (index: number) => {
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === index ? { ...opt, editing: !opt.editing } : opt
      )
    );
  };

  const updateOption = (index: number, field: keyof Option, value: any) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  };

  const deleteOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setVisibleOptions((prev) => prev.filter((i) => i !== index));
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        type: "call",
        position: "long",
        strike: 0,
        premium: 0,
        quantity: 1,
        editing: true,
      },
    ]);
  };

  const allOptionsSelected = useMemo(() => {
    return options.length > 0 && visibleOptions.length === options.length;
  }, [options.length, visibleOptions.length]);

  const toggleAllOptions = () => {
    if (allOptionsSelected) {
      setVisibleOptions([]);
    } else {
      setVisibleOptions(options.map((_, index) => index));
    }
  };

  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

        <RiskRewardMetrics riskReward={portfolioRiskReward} />

        <Button variant="contained" onClick={addOption} sx={{ mb: 2 }}>
          添加新期权
        </Button>

        {options.map((option, index) => (
          <OptionCard
            key={index}
            option={option}
            index={index}
            visible={visibleOptions.includes(index)}
            getColor={getColor}
            toggleEditOption={toggleEditOption}
            updateOption={updateOption}
            deleteOption={deleteOption}
            toggleOptionVisibility={toggleOptionVisibility}
          />
        ))}

        <ChartControls
          showOptionsPanel={showOptionsPanel}
          setShowOptionsPanel={setShowOptionsPanel}
          showCombination={showCombination}
          setShowCombination={setShowCombination}
          allOptionsSelected={allOptionsSelected}
          toggleAllOptions={toggleAllOptions}
        />

        <ProfitChart
          options={options}
          priceDomain={priceDomain}
          showCombination={showCombination}
          visibleOptions={visibleOptions}
          hoverPrice={hoverPrice}
          setHoverPrice={setHoverPrice}
          getColor={getColor}
          containerRef={containerRef}
        />

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
