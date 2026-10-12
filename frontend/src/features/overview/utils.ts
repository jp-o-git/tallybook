import type { Order } from "../../components/Table";
import type { ChartPoint, ChartView } from "./types";

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(amount);

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getInitialDateRange = () => {
  const today = new Date();

  return {
    start: getLocalDateString(
      new Date(today.getFullYear(), today.getMonth(), 1),
    ),
    end: getLocalDateString(
      new Date(today.getFullYear(), today.getMonth() + 1, 0),
    ),
  };
};

export const isPaidOrder = (status: Order["status"]) =>
  status === "Paid" || status === "Fulfilled";

export const getOrderDate = (order: Order) => new Date(order.createdAt);

export function buildChartPoints(
  orders: Order[],
  startDate: string,
  endDate: string,
  view: ChartView,
): ChartPoint[] {
  if (!startDate || !endDate || startDate > endDate) {
    return [];
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return [];
  }

  const rangeEnd = new Date(end);
  rangeEnd.setDate(rangeEnd.getDate() + 1);

  const rangeStartTime = start.getTime();
  const rangeEndTime = rangeEnd.getTime();
  const filteredOrders = orders.filter((order) => {
    const date = getOrderDate(order).getTime();
    return (
      !Number.isNaN(date) && date >= rangeStartTime && date < rangeEndTime
    );
  });
  const daysInRange =
    Math.floor((rangeEndTime - rangeStartTime) / 86400000);
  const points: ChartPoint[] = [];

  const addPoint = (label: string, from: Date, to: Date) => {
    const matchingOrders = filteredOrders.filter((order) => {
      const date = getOrderDate(order);
      return date >= from && date < to;
    });
    const revenue = matchingOrders
      .filter((order) => isPaidOrder(order.status))
      .reduce((total, order) => total + Number(order.total ?? 0), 0);

    points.push({ label, revenue, orders: matchingOrders.length });
  };

  if (view === "daily") {
    for (let i = 0; i < daysInRange; i++) {
      const dayStart = new Date(start);
      dayStart.setDate(start.getDate() + i);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      addPoint(
        dayStart.toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
        }),
        dayStart,
        dayEnd,
      );
    }
  } else if (view === "weekly") {
    for (let i = 0; i < daysInRange; i += 7) {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + i);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const actualEnd = weekEnd < rangeEnd ? weekEnd : rangeEnd;

      addPoint(`Week ${Math.floor(i / 7) + 1}`, weekStart, actualEnd);
    }
  } else {
    const cursor = new Date(start);
    let index = 0;

    while (cursor < rangeEnd && index <= 120) {
      const monthStart = new Date(cursor);
      const monthEnd = new Date(
        cursor.getFullYear(),
        cursor.getMonth() + 1,
        1,
      );
      const actualEnd = monthEnd < rangeEnd ? monthEnd : rangeEnd;

      addPoint(
        monthStart.toLocaleDateString("en-PH", {
          month: "short",
          year: "numeric",
        }),
        monthStart,
        actualEnd,
      );

      cursor.setTime(actualEnd.getTime());
      index++;
    }
  }

  return points;
}
