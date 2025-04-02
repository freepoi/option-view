export interface Option {
  type: "call" | "put";
  strike: number;
  premium: number;
  position: "long" | "short";
  quantity: number;
}

export interface ChartDataPoint {
  price: number;
  profit: number;
}
