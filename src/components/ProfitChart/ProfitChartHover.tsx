import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Option } from "../../types";
import { calculateOptionProfit } from "../../utils/calculations";
import { formatCurrency, formatNumber } from "../../utils/formatters";

interface ProfitChartHoverProps {
  hoverPrice: number | null;
  options: Option[];
  visibleOptions: number[];
  showCombination: boolean;
  priceDomain: [number, number];
  getColor: (index: number) => string;
}

const ProfitChartHover: React.FC<ProfitChartHoverProps> = ({
  hoverPrice,
  options,
  visibleOptions,
  showCombination,
  priceDomain,
  getColor,
}) => {
  const theme = useTheme();

  if (!hoverPrice) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        left: `calc(${
          ((hoverPrice - priceDomain[0]) / (priceDomain[1] - priceDomain[0])) *
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
        {formatCurrency(hoverPrice)}
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
          {formatNumber(
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
            }手: ${formatNumber(calculateOptionProfit(hoverPrice, option))}`}
          </Typography>
        );
      })}
    </Box>
  );
};

export default ProfitChartHover;
