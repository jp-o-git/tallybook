export type ChartView = "daily" | "weekly" | "monthly";

export type ChartPoint = {
  label: string;
  revenue: number;
  orders: number;
};
