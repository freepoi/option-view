import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Box,
  Button,
  Collapse,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  ProfitChart,
  RiskRewardMetrics,
  OptionCard,
  ChartControls,
} from "./components";
import { theme } from "./theme";
import { Option, VisibleOptions } from "./types";
import { calculatePortfolioRiskReward } from "./utils/calculations";
import { generateColor } from "./utils/generateColor";

const App: React.FC = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [visibleOptions, setVisibleOptions] = useState<VisibleOptions>([]);
  const [showCombination, setShowCombination] = useState(true);
  const [isOptionsCollapsed, setIsOptionsCollapsed] = useState(false);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [allOptionsSelected, setAllOptionsSelected] = useState(false);

  const toggleAllOptions = useCallback(() => {
    setAllOptionsSelected((prev) => !prev);
  }, []);

  // 生成合理的默认期权参数
  const getDefaultOption = useCallback((): Option => {
    const lastStrike =
      options.length > 0 ? Math.max(...options.map((o) => o.strike)) : 50000;
    return {
      type: "call",
      position: "long",
      strike: Math.round(lastStrike * 1.1),
      premium: Math.round(lastStrike * 0.02 * 100) / 100, // 2% of strike
      quantity: 1,
      editing: true,
      id: Date.now().toString(), // 使用时间戳作为唯一ID
      color: generateColor(),
    };
  }, [options]);

  // 添加新期权（置顶）
  const addOption = () => {
    const newOption: Option = getDefaultOption();
    setOptions((prev) => [newOption, ...prev]);
  };

  // 折叠/展开期权列表
  const toggleOptionsCollapse = () => {
    setIsOptionsCollapsed(!isOptionsCollapsed);
  };

  // 计算风险收益指标
  const portfolioRiskReward = useMemo(
    () => calculatePortfolioRiskReward(options),
    [options]
  );

  // 价格范围计算（自动调整）
  const priceDomain = useMemo(() => {
    const validOptions = options.filter((o) => o.strike > 0);
    if (validOptions.length === 0) return [0, 100000] as [number, number];

    const strikes = validOptions.map((o) => o.strike);
    const min = Math.min(...strikes);
    const max = Math.max(...strikes);
    return [min * 0.7, max * 1.3] as [number, number];
  }, [options]);

  // 期权操作函数
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

  const deleteOption = (id: string) => {
    setOptions((prev) => {
      const a = prev.filter((option) => option.id !== id);
      console.log("删除期权", a);
      return a;
    });
    setVisibleOptions((prev) => prev.filter((optionId) => optionId !== id)); // 统一使用string类型比较
  };

  const toggleOptionVisibility = (id: string) => {
    setVisibleOptions((prev) =>
      prev.includes(id)
        ? prev.filter((optionId) => optionId !== id)
        : [...prev, id]
    );
  };

  console.log(
    "当前期权列表",
    options.map((option) => option.id)
  );
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

        {/* 控制按钮区 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={addOption}
            startIcon={<AddIcon />}
          >
            添加期权
          </Button>

          <Button
            onClick={toggleOptionsCollapse}
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transform: isOptionsCollapsed
                    ? "rotate(0deg)"
                    : "rotate(180deg)",
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            }
            sx={{
              color: "text.secondary",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            {isOptionsCollapsed ? "展开期权列表" : "收起期权列表"}
          </Button>
        </Box>

        {/* 期权卡片列表 */}
        <Collapse in={!isOptionsCollapsed}>
          {options.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              index={index}
              visible={visibleOptions.includes(option.id)}
              toggleEditOption={toggleEditOption}
              updateOption={updateOption}
              deleteOption={deleteOption}
              toggleOptionVisibility={toggleOptionVisibility}
            />
          ))}
        </Collapse>

        {/* 风险指标和图表 */}
        <RiskRewardMetrics riskReward={portfolioRiskReward} />

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
            提示：新添加的期权会自动出现在列表顶部
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
