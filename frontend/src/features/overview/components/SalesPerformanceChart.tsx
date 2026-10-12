import { useMemo, useState } from "react";
import type { Order } from "../../../components/Table";
import {
  buildChartPoints,
  formatCurrency,
  getInitialDateRange,
} from "../utils";
import type { ChartView } from "../types";

const views: { value: ChartView; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function SalesPerformanceChart({
  orders,
  loading,
}: {
  orders: Order[];
  loading: boolean;
}) {
  const [chartView, setChartView] = useState<ChartView>("daily");
  const [initialRange] = useState(getInitialDateRange);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);

  const chartPoints = useMemo(
    () => buildChartPoints(orders, startDate, endDate, chartView),
    [orders, startDate, endDate, chartView],
  );
  const chartTotal = chartPoints.reduce(
    (total, point) => total + point.revenue,
    0,
  );
  const chartOrderCount = chartPoints.reduce(
    (total, point) => total + point.orders,
    0,
  );
  const chartScale = Math.max(...chartPoints.map((point) => point.revenue), 1);

  const resetDateRange = () => {
    const range = getInitialDateRange();
    setStartDate(range.start);
    setEndDate(range.end);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Sales Performance
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Revenue and order activity for your selected date range.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label
            htmlFor="chart-start-date"
            className="flex flex-col gap-1 text-xs font-medium text-gray-500"
          >
            Start date
            <input
              id="chart-start-date"
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="field-control min-h-10 px-3 py-2 text-sm text-gray-700"
            />
          </label>

          <label
            htmlFor="chart-end-date"
            className="flex flex-col gap-1 text-xs font-medium text-gray-500"
          >
            End date
            <input
              id="chart-end-date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="field-control min-h-10 px-3 py-2 text-sm text-gray-700"
            />
          </label>

          <button
            type="button"
            onClick={resetDateRange}
            className="min-h-10 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Chart interval"
        >
          {views.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={chartView === value}
              onClick={() => setChartView(value)}
              className={`min-h-10 rounded-lg px-4 text-sm font-medium transition ${
                chartView === value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-gray-500">Total revenue</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(chartTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total orders</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {chartOrderCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-gray-500">
            Loading chart data...
          </div>
        ) : startDate > endDate ? (
          <div className="flex h-64 items-center justify-center text-sm text-red-500">
            The start date must be before the end date.
          </div>
        ) : chartPoints.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-gray-500">
            No chart data available for this date range.
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              Revenue
            </div>

            <div className="overflow-x-auto pb-3">
              <div
                className="flex h-64 items-end gap-3 border-b border-gray-200 px-2"
                style={{
                  minWidth:
                    chartView === "daily" && chartPoints.length > 10
                      ? `${chartPoints.length * 44}px`
                      : "100%",
                }}
              >
                {chartPoints.map((point, index) => {
                  const height =
                    point.revenue > 0
                      ? Math.max((point.revenue / chartScale) * 100, 4)
                      : 0;

                  return (
                    <div
                      key={`${point.label}-${index}`}
                      className="group flex h-full min-w-[64px] flex-1 flex-col items-center justify-end"
                    >
                      <div className="mb-2 whitespace-nowrap text-center text-[10px] text-gray-500 sm:text-xs">
                        {point.revenue > 0
                          ? formatCurrency(point.revenue)
                          : ""}
                      </div>
                      <div className="flex h-[72%] w-full items-end justify-center">
                        <div
                          title={`${point.label}: ${formatCurrency(point.revenue)} (${point.orders} orders)`}
                          className={`w-full max-w-12 rounded-t-md transition-all ${
                            point.revenue > 0
                              ? "bg-blue-500 group-hover:bg-blue-600"
                              : "bg-gray-100"
                          }`}
                          style={{
                            height: `${height}%`,
                            minHeight: point.revenue > 0 ? "4px" : "2px",
                          }}
                        />
                      </div>
                      <p className="mt-3 whitespace-nowrap text-center text-[10px] text-gray-500 sm:text-xs">
                        {point.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Revenue includes paid and fulfilled orders. Order counts include
              all statuses.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
