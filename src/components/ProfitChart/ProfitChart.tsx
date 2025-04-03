import React, { useRef, useCallback, useEffect } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Option, VisibleOptions } from "../../types";
import {
  calculateOptionProfit,
  generatePricePoints,
} from "../../utils/calculations";
import useChartDimensions from "../../hooks/useChartDimensions";
import ProfitChartHover from "./ProfitChartHover";

interface ProfitChartProps {
  options: Option[];
  priceDomain: [number, number];
  showCombination: boolean;
  visibleOptions: VisibleOptions;
  hoverPrice: number | null;
  setHoverPrice: (price: number | null) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const ProfitChart: React.FC<ProfitChartProps> = ({
  options,
  priceDomain,
  showCombination,
  visibleOptions,
  hoverPrice,
  setHoverPrice,
  containerRef,
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const dimensions = useChartDimensions(containerRef);

  const drawChart = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const { width, height } = dimensions;
    const margin = { top: 20, right: 20, bottom: 40, left: 10 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // 过滤无效期权
    const validOptions = options.filter((o) => o.strike > 0 && o.premium >= 0);
    // 使用过滤后的期权生成价格点
    const pricePoints = generatePricePoints(validOptions);

    const xScale = d3
      .scaleLinear()
      .domain(priceDomain)
      .range([margin.left, width - margin.right]);

    // 计算Y轴范围
    let yValues: number[] = [];
    if (showCombination) {
      yValues = yValues.concat(
        pricePoints.map((price) =>
          options.reduce(
            (sum, opt) => sum + calculateOptionProfit(price, opt),
            0
          )
        )
      );
    }

    visibleOptions.forEach((id) => {
      const index = options.findIndex((o) => o.id === id);
      if (index === -1) return;
      yValues = yValues.concat(
        pricePoints.map((price) => calculateOptionProfit(price, options[index]))
      );
    });

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(yValues) as [number, number])
      .range([height - margin.bottom, margin.top])
      .nice();

    // 绘制网格和坐标轴
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // 绘制零线
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", theme.palette.text.secondary)
      .attr("stroke-dasharray", "2 2");

    // 绘制组合盈亏线（严格折线）
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
        .datum(pricePoints)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", theme.palette.primary.main)
        .attr("stroke-width", 2.5);
    }

    // 绘制单个期权线（严格折线）
    visibleOptions.forEach((optionId) => {
      const option = options.find((o) => o.id === optionId);
      if (!option) return;
      const line = d3
        .line<number>()
        .x((d) => xScale(d))
        .y((d) => yScale(calculateOptionProfit(d, option)))
        .curve(d3.curveLinear);

      svg
        .append("path")
        .datum(pricePoints)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", option.color)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3 3");
    });

    // 添加垂直辅助线（在鼠标交互区域代码之后添加）
    const verticalGuide = svg
      .append("line")
      .attr("class", "vertical-guide")
      .attr("stroke", theme.palette.text.secondary)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 3")
      .attr("opacity", 0);

    // 鼠标交互区域
    svg
      .append("rect")
      .attr("class", "tracker")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .style("opacity", 0)
      .on("mousemove", (event) => {
        const [x] = d3.pointer(event);
        setHoverPrice(xScale.invert(x));
      })
      .on("mouseleave", () => setHoverPrice(null));

    // 更新鼠标交互逻辑
    svg
      .select(".tracker")
      .on("mousemove", (event) => {
        const [x] = d3.pointer(event);
        const price = xScale.invert(x);
        setHoverPrice(price);

        // 更新垂直辅助线位置
        verticalGuide
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", margin.top)
          .attr("y2", height - margin.bottom)
          .attr("opacity", 1);
      })
      .on("mouseleave", () => {
        setHoverPrice(null);
        verticalGuide.attr("opacity", 0); // 隐藏辅助线
      });
  }, [
    options,
    showCombination,
    visibleOptions,
    priceDomain,
    dimensions,
    theme,
    setHoverPrice,
  ]);

  useEffect(() => {
    drawChart();
    window.addEventListener("resize", drawChart);
    return () => window.removeEventListener("resize", drawChart);
  }, [drawChart]);

  return (
    <Box
      ref={containerRef}
      sx={{
        bgcolor: "white",
        position: "relative",
        width: "100%",
        height: "500px",
      }}
    >
      <svg ref={svgRef} width="100%" height="100%" />
      {hoverPrice && (
        <ProfitChartHover
          hoverPrice={hoverPrice}
          options={options}
          visibleOptions={visibleOptions}
          showCombination={showCombination}
          priceDomain={priceDomain}
        />
      )}
    </Box>
  );
};

export default ProfitChart;
