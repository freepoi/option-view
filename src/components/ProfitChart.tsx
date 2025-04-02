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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Option } from "../types";

interface ProfitChartProps {
  options: Option[];
}

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

const ProfitChart: React.FC<ProfitChartProps> = ({ options }) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [showCombination, setShowCombination] = useState(true);
  const [visibleOptions, setVisibleOptions] = useState<number[]>([]);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  // const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // 检查是否所有单个期权都被选中
  const allOptionsSelected = useMemo(() => {
    return options.length > 0 && visibleOptions.length === options.length;
  }, [options.length, visibleOptions.length]);

  // 全选/全不选切换
  const toggleAllOptions = () => {
    if (allOptionsSelected) {
      setVisibleOptions([]);
    } else {
      setVisibleOptions(options.map((_, index) => index));
    }
  };

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

    // 动态计算Y轴范围
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

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={showOptionsPanel ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowOptionsPanel(!showOptionsPanel)}
          size="small"
          sx={{ color: theme.palette.text.secondary }}
        >
          {showOptionsPanel ? "隐藏期权选项" : "显示期权选项"}
        </Button>

        <Collapse in={showOptionsPanel}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mt: 1,
              bgcolor: theme.palette.background.default,
              borderRadius: 1,
            }}
          >
            {/* 组合盈亏曲线控制 */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={showCombination}
                  onChange={() => setShowCombination(!showCombination)}
                  color="primary"
                />
              }
              label={<Typography variant="subtitle2">组合盈亏</Typography>}
              sx={{ mb: 2 }}
            />

            {/* 单个期权全选控制 */}
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
                label={<Typography variant="body2">期权列表</Typography>}
              />
            </Box>

            {/* 单个期权列表 */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 1,
              }}
            >
              {options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      size="small"
                      checked={visibleOptions.includes(index)}
                      onChange={() => toggleOptionVisibility(index)}
                      sx={{
                        color: getColor(index),
                        "&.Mui-checked": { color: getColor(index) },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {`${option.position === "long" ? "买入" : "卖出"} ${
                        option.quantity
                      }手 ${option.type === "call" ? "看涨" : "看跌"}@${
                        option.strike
                      }`}
                    </Typography>
                  }
                />
              ))}
            </Box>
          </Paper>
        </Collapse>
      </Box>

      <Box
        ref={containerRef}
        sx={{ position: "relative", width: "100%", height: "500px" }}
      >
        <svg ref={svgRef} width="100%" height="100%" />

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
              p: 1.5,
              borderRadius: 1,
              boxShadow: 2,
              minWidth: 200,
              border: `1px solid ${theme.palette.divider}`,
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {d3.format("$,.2f")(hoverPrice)}
            </Typography>

            {showCombination && (
              <Typography variant="body2" color="primary">
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
                    mt: 0.5,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: getColor(index),
                      mr: 1,
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
