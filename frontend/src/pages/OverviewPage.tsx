import PageLabel from "../components/PageLabel";
import InventoryAttention from "../features/overview/components/InventoryAttention";
import OverviewStats from "../features/overview/components/OverviewStats";
import RecentOrders from "../features/overview/components/RecentOrders";
import SalesPerformanceChart from "../features/overview/components/SalesPerformanceChart";
import { useOverviewData } from "../features/overview/hooks/useOverviewData";
import {
  formatCurrency,
  getOrderDate,
  isPaidOrder,
} from "../features/overview/utils";

export default function OverviewPage() {
  const {
    products,
    orders,
    loadingProducts,
    loadingOrders,
    productsError,
    ordersError,
  } = useOverviewData();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const lowStockCount = products.filter(
    (product) =>
      Number(product.stocks ?? 0) <= Number(product.reorder_at ?? 0),
  ).length;

  const ordersToday = orders.filter((order) => {
    const date = getOrderDate(order);
    return date >= todayStart && date < tomorrowStart;
  }).length;

  const revenueThisMonth = orders
    .filter((order) => {
      const date = getOrderDate(order);
      return (
        isPaidOrder(order.status) &&
        date >= currentMonthStart &&
        date < nextMonthStart
      );
    })
    .reduce((total, order) => total + Number(order.total ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageLabel
        Heading="Overview"
        SubHeading="Monitor your inventory and order performance."
      />

      {(productsError || ordersError) && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {productsError && <p>Products: {productsError}</p>}
          {ordersError && <p>Orders: {ordersError}</p>}
        </div>
      )}

      <OverviewStats
        totalProducts={products.length}
        lowStockCount={lowStockCount}
        ordersToday={ordersToday}
        revenueThisMonth={formatCurrency(revenueThisMonth)}
        loadingProducts={loadingProducts}
        loadingOrders={loadingOrders}
      />

      <SalesPerformanceChart orders={orders} loading={loadingOrders} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <InventoryAttention products={products} loading={loadingProducts} />
        <RecentOrders orders={orders} loading={loadingOrders} />
      </div>
    </div>
  );
}
