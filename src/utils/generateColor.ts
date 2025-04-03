type HSL = [number, number, number]; // [H: 0-360, S: 0-100, L: 0-100]

// 生成不重复且差异明显的颜色生成器
function createColorGenerator(
  hueThreshold = 30, // 最小色相差阈值
  saturationRange: [number, number] = [50, 90], // 饱和度范围
  lightnessRange: [number, number] = [30, 60] // 亮度范围
) {
  const generatedColors: HSL[] = [];

  // 检查两个颜色是否过于接近
  const isTooClose = (color1: HSL, color2: HSL): boolean => {
    const [h1] = color1;
    const [h2] = color2;
    const deltaH = Math.abs(h1 - h2) % 360;
    const minDeltaH = Math.min(deltaH, 360 - deltaH); // 环形色相差计算
    return minDeltaH < hueThreshold;
  };

  // 生成随机 HSL 颜色
  const generateRandomHSL = (): HSL => {
    const h = Math.floor(Math.random() * 360);
    const s =
      saturationRange[0] +
      Math.random() * (saturationRange[1] - saturationRange[0]);
    const l =
      lightnessRange[0] +
      Math.random() * (lightnessRange[1] - lightnessRange[0]);
    return [h, s, l];
  };

  // 主函数：生成新颜色
  return (): string => {
    let newColor: HSL;
    let attempts = 0;
    const maxAttempts = 100; // 避免无限循环

    do {
      newColor = generateRandomHSL();
      attempts++;
    } while (
      attempts < maxAttempts &&
      generatedColors.some((color) => isTooClose(color, newColor))
    );

    if (attempts >= maxAttempts) {
      console.warn("无法生成不接近的颜色，返回随机颜色");
    } else {
      generatedColors.push(newColor);
    }

    return hslToHex(...newColor);
  };
}

// HSL 转 Hex 工具函数
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.min(Math.max(color, 0), 1))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export const generateColor = createColorGenerator();
