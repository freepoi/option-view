export interface Option {
  type: "call" | "put";
  position: "long" | "short";
  strike: number;
  premium: number;
  quantity: number;
  editing?: boolean;
}

export const calculateOptionProfit = (
  price: number,
  option: Option
): number => {
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

export const generatePricePoints = (
  domain: [number, number],
  strikes: number[]
): number[] => {
  const points = new Set<number>();

  // 保证行权价±5%范围内有足够点
  strikes.forEach((strike) => {
    for (let ratio = 0.95; ratio <= 1.05; ratio += 0.01) {
      points.add(strike * ratio);
    }
  });

  // 添加域边界
  points.add(domain[0]);
  points.add(domain[1]);

  return Array.from(points).sort((a, b) => a - b);
};

// 在原有内容后添加以下代码
export interface RiskReward {
  maxGain: number;
  maxLoss: number;
  breakEven: number;
}

export const calculateOptionRiskReward = (option: Option): RiskReward => {
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
        maxGain: option.strike - option.premium,
        breakEven: option.strike - option.premium,
      };
    } else {
      return {
        maxGain: option.premium * option.quantity,
        maxLoss: -(option.strike - option.premium),
        breakEven: option.strike - option.premium,
      };
    }
  }
};

export const calculatePortfolioRiskReward = (
  options: Option[]
): RiskReward & { breakEvens: number[] } => {
  if (options.length === 0) {
    return { maxGain: 0, maxLoss: 0, breakEven: 0, breakEvens: [] };
  }

  // 1. 计算所有可能的关键价格点（行权价±1%）
  const criticalPrices = options.flatMap((o) => [
    o.strike * 0.99,
    o.strike,
    o.strike * 1.01,
  ]);
  const pricePoints = Array.from(
    new Set([
      ...criticalPrices,
      ...options.flatMap((o) => [o.strike + o.premium, o.strike - o.premium]),
      0, // 确保包含0价格
      Math.max(...options.map((o) => o.strike)) * 2, // 足够高的价格
    ])
  ).sort((a, b) => a - b);

  // 2. 计算每个关键点的组合盈亏
  const profits = pricePoints.map((price) => ({
    price,
    value: options.reduce(
      (sum, opt) => sum + calculateOptionProfit(price, opt),
      0
    ),
  }));

  // 3. 自动识别上下限
  const values = profits.map((p) => p.value);
  const maxGain = Math.max(...values);
  const maxLoss = Math.min(...values);

  // 4. 计算盈亏平衡点（利润为零的点）
  const breakEvens: number[] = [];
  for (let i = 0; i < profits.length - 1; i++) {
    const p1 = profits[i];
    const p2 = profits[i + 1];
    if (p1.value * p2.value <= 0) {
      // 符号变化
      const breakeven = linearInterpolation(p1, p2);
      breakEvens.push(breakeven);
    }
  }

  return {
    maxGain,
    maxLoss,
    breakEven: breakEvens[0] || 0, // 主要平衡点
    breakEvens: breakEvens.filter(Boolean).sort((a, b) => a - b),
  };
};

// 线性插值辅助函数
const linearInterpolation = (
  p1: { price: number; value: number },
  p2: { price: number; value: number }
): number => {
  if (p1.value === p2.value) return p1.price;
  return p1.price - (p1.value * (p2.price - p1.price)) / (p2.value - p1.value);
};
