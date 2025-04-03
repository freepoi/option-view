export interface Option {
  type: "call" | "put";
  position: "long" | "short";
  strike: number;
  premium: number;
  quantity: number;
  editing?: boolean;
  id: string;
  color: string;
  disabled: boolean;
}

export interface RiskReward {
  maxGain: number;
  maxLoss: number;
  breakEven: number;
}

export type VisibleOptions = string[];
