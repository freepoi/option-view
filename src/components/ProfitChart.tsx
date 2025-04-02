import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import * as d3 from "d3";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  useTheme,
  Paper,
  Collapse,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Grid,
  Chip,
  Stack,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Option, RiskReward } from "../types";

const calculateOptionProfit = (price: number, option: Option): number => {
  const { type, position, strike, premium, quantity } = option;

  if (type === "call") {
    const intrinsic = Math.max(0, price - strike);
    return position === "long"
      ? (intrinsic - premium) * quantity
      : (premium - intrinsic) * quantity;
  } else {
    const intrinsic = Math.max(0, strike - price);
    return position === "long"
      ? (intrinsic - premium) * quantity
      : (premium - intrinsic) * quantity;
  }
};

const calculateOptionRiskReward = (option: Option): RiskReward => {
  if (option.type === "call") {
    if (option.position === "long") {
      return {
        maxLoss: -option.premium * option.quantity,
        maxGain: Infinity,
        breakEven: option.strike + option.premium,
      };
    } else {
      return {
        maxGain: option.premium * option.quantity,
        maxLoss: -Infinity,
        breakEven: option.strike + option.premium,
      };
    }
  } else {
    if (option.position === "long") {
      return {
        maxLoss: -option.premium * option.quantity,
        maxGain: (option.strike - option.premium) * option.quantity,
        breakEven: option.strike - option.premium,
      };
    } else {
      return {
        maxGain: option.premium * option.quantity,
        maxLoss: (option.strike - option.premium) * option.quantity,
        breakEven: option.strike - option.premium,
      };
    }
  }
};

const calculatePortfolioRiskReward = (
  options: Option[]
): RiskReward & { breakEvens: number[] } => {
  let maxGain = 0;
  let maxLoss = 0;
  const breakEvens: number[] = [];

  options.forEach((option) => {
    const {
      maxGain: optionGain,
      maxLoss: optionLoss,
      breakEven,
    } = calculateOptionRiskReward(option);

    if (optionGain === Infinity) {
      maxGain = Infinity;
    } else if (maxGain !== Infinity) {
      maxGain += optionGain;
    }

    if (optionLoss === -Infinity) {
      maxLoss = -Infinity;
    } else if (maxLoss !== -Infinity) {
      maxLoss += optionLoss;
    }

    breakEvens.push(breakEven);
  });

  return {
    maxGain,
    maxLoss,
    breakEven: 0, // Not used for portfolio
    breakEvens: breakEvens.sort((a, b) => a - b),
  };
};

const ProfitChart: React.FC<{
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
}> = ({ options, setOptions }) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [showCombination, setShowCombination] = useState(true);
  const [visibleOptions, setVisibleOptions] = useState<number[]>([]);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  // const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  const portfolioRiskReward = useMemo(
    () => calculatePortfolioRiskReward(options),
    [options]
  );
  const optionsRiskReward = useMemo(
    () => options.map((option) => calculateOptionRiskReward(option)),
    [options]
  );

  const getColor = useCallback(
    (index: number) => {
      const colors = [
        theme.palette.secondary.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.success.main,
      ];
      return colors[index % colors.length];
    },
    [theme]
  );

  const priceDomain = useMemo(() => {
    if (options.length === 0) return [0, 100000] as [number, number];
    const strikes = options.map((o) => o.strike);
    return [Math.min(...strikes) * 0.7, Math.max(...strikes) * 1.3] as [
      number,
      number
    ];
  }, [options]);

  const drawChart = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    // setDimensions({ width, height });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3
      .scaleLinear()
      .domain(priceDomain)
      .range([margin.left, width - margin.right]);

    const allPrices = d3.range(priceDomain[0], priceDomain[1], 100);
    let yExtent: [number, number] = [0, 0];

    if (showCombination || visibleOptions.length > 0) {
      const allValues = allPrices.flatMap((price) => {
        const values = [];
        if (showCombination) {
          values.push(
            options.reduce(
              (sum, opt) => sum + calculateOptionProfit(price, opt),
              0
            )
          );
        }
        visibleOptions.forEach((index) => {
          values.push(calculateOptionProfit(price, options[index]));
        });
        return values;
      });
      yExtent = d3.extent(allValues) as [number, number];
    }

    const yScale = d3
      .scaleLinear()
      .domain(yExtent)
      .range([height - margin.bottom, margin.top])
      .nice();

    // 绘制网格
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-height + margin.top + margin.bottom)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", theme.palette.divider)
      .attr("stroke-opacity", 0.3);

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", theme.palette.divider)
      .attr("stroke-opacity", 0.3);

    // 绘制坐标轴
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("$,.0f")))
      .selectAll(".domain, .tick line")
      .attr("stroke", theme.palette.divider);

    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d3.format("+,.0f")))
      .selectAll(".domain, .tick line")
      .attr("stroke", theme.palette.divider);

    // 绘制零线
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", theme.palette.text.secondary)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2 2");

    // 绘制组合盈亏曲线
    if (showCombination) {
      const line = d3
        .line<number>()
        .x((d) => xScale(d))
        .y((d) =>
          yScale(
            options.reduce((sum, opt) => sum + calculateOptionProfit(d, opt), 0)
          )
        )
        .curve(d3.curveLinear);

      svg
        .append("path")
        .datum(allPrices)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", theme.palette.primary.main)
        .attr("stroke-width", 2.5)
        .attr("class", "combination-line");
    }

    // 绘制单个期权曲线
    visibleOptions.forEach((optionIndex, idx) => {
      const option = options[optionIndex];
      const line = d3
        .line<number>()
        .x((d) => xScale(d))
        .y((d) => yScale(calculateOptionProfit(d, option)))
        .curve(d3.curveLinear);

      svg
        .append("path")
        .datum(allPrices)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", getColor(idx))
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", idx % 2 === 0 ? "4 2" : null)
        .attr("class", `option-line-${optionIndex}`);
    });

    // 鼠标交互
    const tracker = svg
      .append("rect")
      .attr("class", "tracker")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .style("opacity", 0);

    tracker
      .on("mousemove", (event) => {
        const [x] = d3.pointer(event);
        const price = xScale.invert(x);
        setHoverPrice(price);

        // 绘制悬停辅助线
        svg.selectAll(".hover-line").remove();
        svg
          .append("line")
          .attr("class", "hover-line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", margin.top)
          .attr("y2", height - margin.bottom)
          .attr("stroke", theme.palette.text.secondary)
          .attr("stroke-dasharray", "3 3");
      })
      .on("mouseleave", () => {
        setHoverPrice(null);
        svg.selectAll(".hover-line").remove();
      });
  }, [options, showCombination, visibleOptions, priceDomain, theme, getColor]);

  useEffect(() => {
    const handleResize = () => drawChart();
    drawChart();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawChart]);

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

  return (
    <Box>
      {/* 风险收益指标展示 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          风险收益指标
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip
            label={`最大收益: ${
              portfolioRiskReward.maxGain === Infinity
                ? "无限"
                : d3.format("+,.2f")(portfolioRiskReward.maxGain)
            }`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`最大亏损: ${
              portfolioRiskReward.maxLoss === -Infinity
                ? "无限"
                : d3.format("+,.2f")(portfolioRiskReward.maxLoss)
            }`}
            color="error"
            variant="outlined"
          />
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          盈亏平衡点:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {portfolioRiskReward.breakEvens.map((point, i) => (
            <Chip
              key={i}
              label={`${d3.format("$,.2f")(point)}`}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      </Paper>

      {/* 期权管理面板 */}
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" onClick={addOption} sx={{ mb: 2 }}>
          添加新期权
        </Button>

        {options.map((option, index) => (
          <Paper key={index} elevation={2} sx={{ p: 3, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* 标题和操作按钮 */}
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

              {/* 期权类型和方向 */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>期权类型</InputLabel>
                  <Select
                    value={option.type}
                    onChange={(e) =>
                      updateOption(index, "type", e.target.value)
                    }
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
                    onChange={(e) =>
                      updateOption(index, "position", e.target.value)
                    }
                    label="交易方向"
                    disabled={!option.editing}
                  >
                    <MenuItem value="long">买入</MenuItem>
                    <MenuItem value="short">卖出</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* 数值输入 */}
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

              {/* 风险分析 */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 1,
                    mt: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    风险分析:
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 1 }}
                  >
                    <Chip
                      label={`最大收益: ${
                        optionsRiskReward[index].maxGain === Infinity
                          ? "无限"
                          : d3.format("+,.2f")(optionsRiskReward[index].maxGain)
                      }`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      label={`最大亏损: ${
                        optionsRiskReward[index].maxLoss === -Infinity
                          ? "无限"
                          : d3.format("+,.2f")(optionsRiskReward[index].maxLoss)
                      }`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                    <Chip
                      label={`盈亏平衡: ${d3.format("$,.2f")(
                        optionsRiskReward[index].breakEven
                      )}`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              </Grid>

              {/* 显示控制 */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={visibleOptions.includes(index)}
                      onChange={() => toggleOptionVisibility(index)}
                      sx={{
                        color: getColor(index),
                        "&.Mui-checked": { color: getColor(index) },
                      }}
                    />
                  }
                  label="在图表中显示此期权"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* 图表显示控制面板 */}
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
              label="显示组合盈亏曲线"
              sx={{ mb: 1 }}
            />

            <Box sx={{ mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allOptionsSelected}
                    onChange={toggleAllOptions}
                    indeterminate={
                      visibleOptions.length > 0 && !allOptionsSelected
                    }
                    color="primary"
                  />
                }
                label="全选/全不选单个期权"
              />
            </Box>
          </Paper>
        </Collapse>
      </Box>

      {/* 图表容器 */}
      <Box
        ref={containerRef}
        sx={{ position: "relative", width: "100%", height: "500px" }}
      >
        <svg ref={svgRef} width="100%" height="100%" />

        {/* 悬停信息框 */}
        {hoverPrice && (
          <Box
            sx={{
              position: "absolute",
              left: `calc(${
                ((hoverPrice - priceDomain[0]) /
                  (priceDomain[1] - priceDomain[0])) *
                100
              }% + 30px)`,
              top: "20px",
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 1,
              boxShadow: 3,
              minWidth: 220,
              border: `1px solid ${theme.palette.divider}`,
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              {d3.format("$,.2f")(hoverPrice)}
            </Typography>

            {showCombination && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                组合盈亏:{" "}
                {d3.format("+,.2f")(
                  options.reduce(
                    (sum, opt) => sum + calculateOptionProfit(hoverPrice, opt),
                    0
                  )
                )}
              </Typography>
            )}

            {visibleOptions.map((index) => {
              const option = options[index];
              return (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    color: getColor(index),
                    mt: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: getColor(index),
                      mr: 1.5,
                    }}
                  />
                  {`${option.position === "long" ? "买入" : "卖出"} ${
                    option.quantity
                  }手: ${d3.format("+,.2f")(
                    calculateOptionProfit(hoverPrice, option)
                  )}`}
                </Typography>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfitChart;
