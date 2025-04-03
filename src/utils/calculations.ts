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
  // 修复3：处理无效值
  if (!option || option.strike <= 0 || option.premium < 0) return 0;

  const { type, position, strike, premium, quantity } = option;
  const intrinsic =
    type === "call" ? Math.max(0, price - strike) : Math.max(0, strike - price);

  return position === "long"
    ? (intrinsic - premium) * quantity
    : (premium - intrinsic) * quantity;
};

export const generatePricePoints = (options: Option[]): number[] => {
  // 过滤无效期权
  const validOptions = options.filter((o) => o.strike > 0 && o.premium >= 0);

  if (validOptions.length === 0) return [0, 100000];

  // 获取有效行权价
  const strikes = validOptions.map((o) => o.strike);
  const minStrike = Math.min(...strikes);
  const maxStrike = Math.max(...strikes);

  // 生成关键点（包含边界和行权价附近）
  const points = new Set<number>([
    0,
    ...strikes.flatMap((strike) => [
      strike * 0.9,
      strike * 0.95,
      strike,
      strike * 1.05,
      strike * 1.1,
    ]),
    maxStrike * 1.5,
  ]);

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

  // 1. 生成关键测试价格点（包含所有行权价、盈亏平衡点和边界值）
  const strikes = options.map((o) => o.strike);
  const testPrices = new Set<number>([
    0, // 标的价为零的情况
    ...strikes,
    ...strikes.map((s) => s * 1.5), // 高价测试点
    ...options.map((o) =>
      o.type === "call" ? o.strike + o.premium : o.strike - o.premium
    ), // 单腿盈亏平衡点
  ]);

  // 2. 计算每个关键点的组合盈亏
  const testResults = Array.from(testPrices).map((price) => ({
    price,
    value: options.reduce(
      (sum, opt) => sum + calculateOptionProfit(price, opt),
      0
    ),
  }));

  // 3. 精确查找盈亏平衡点（利润为零的交叉点）
  const breakEvens: number[] = [];
  testResults.sort((a, b) => a.price - b.price); // 按价格排序

  for (let i = 0; i < testResults.length - 1; i++) {
    const a = testResults[i];
    const b = testResults[i + 1];

    if (a.value * b.value <= 0) {
      // 存在零点
      const breakeven = linearInterpolate(a, b);
      if (!breakEvens.some((x) => Math.abs(x - breakeven) < 0.01)) {
        breakEvens.push(Number(breakeven.toFixed(2)));
      }
    }
  }

  // 4. 计算最大收益/亏损
  const allValues = testResults.map((r) => r.value);
  const maxGain = Math.max(...allValues);
  const maxLoss = Math.min(...allValues);

  // 5. 特殊处理无限收益的情况
  const hasUnlimitedGain = options.some(
    (o) =>
      o.position === "long" &&
      o.type === "call" &&
      !options.some(
        (oo) =>
          oo.type === "call" && oo.position === "short" && oo.strike > o.strike
      )
  );

  const hasUnlimitedLoss = options.some(
    (o) =>
      o.position === "short" &&
      o.type === "call" &&
      !options.some(
        (oo) =>
          oo.type === "call" && oo.position === "long" && oo.strike < o.strike
      )
  );

  return {
    maxGain: hasUnlimitedGain ? Infinity : maxGain,
    maxLoss: hasUnlimitedLoss ? -Infinity : maxLoss,
    breakEven: breakEvens[0] || 0,
    breakEvens: [...new Set(breakEvens)].sort((a, b) => a - b),
  };
};

// 线性插值辅助函数
const linearInterpolate = (
  a: { price: number; value: number },
  b: { price: number; value: number }
): number => {
  return a.price - (a.value * (b.price - a.price)) / (b.value - a.value);
};
