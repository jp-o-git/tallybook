import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import PageLabel from "../components/PageLabel";
import type { Order } from "../components/Table";
import { getProducts } from "../services/products";
import type { ApiProduct } from "../services/products";
import { getOrders } from "../services/orders";

export default function OverviewPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [productsError, setProductsError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      const [productResult, orderResult] = await Promise.allSettled([
        getProducts(),
        getOrders(),
      ]);

      if (!isMounted) return;

      if (productResult.status === "fulfilled") {
        setProducts(productResult.value);
      } else {
        console.error("Failed to load products:", productResult.reason);
        setProductsError("Failed to load products. Please try again.");
      }

      setLoadingProducts(false);

      if (orderResult.status === "fulfilled") {
        setOrders(orderResult.value);
      } else {
        console.error("Failed to load orders:", orderResult.reason);
        setOrdersError("Failed to load orders. Please try again.");
      }

      setLoadingOrders(false);
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const now = new Date();

  const lowStockCount = products.filter(
    (product) => product.stock_status === "Low Stock",
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.stock_status === "Out of Stock",
  ).length;

  const ordersToday = orders.filter((order) => {
    const date = new Date(order.createdAt);

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }).length;

  const revenueThisMonth = orders.reduce((total, order) => {
    const date = new Date(order.createdAt);

    const isThisMonth =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth();

    const countsAsRevenue =
      order.status === "Paid" || order.status === "Fulfilled";

    return isThisMonth && countsAsRevenue ? total + Number(order.total) : total;
  }, 0);

  const formatCurrency = (amount: number) =>
    `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const stats = [
    {
      label: "Products",
      value: products.length.toLocaleString(),
      loading: loadingProducts,
    },
    {
      label: "Low on stock",
      value: lowStockCount.toLocaleString(),
      loading: loadingProducts,
    },
    {
      label: "Orders today",
      value: ordersToday.toLocaleString(),
      loading: loadingOrders,
    },
    {
      label: "Revenue this month",
      value: formatCurrency(revenueThisMonth),
      loading: loadingOrders,
    },
  ];

  const sortedReorders = [...products]
    .filter(
      (product) =>
        product.stock_status === "Low Stock" ||
        product.stock_status === "Out of Stock",
    )
    .sort((a, b) => {
      if (a.stock_status !== b.stock_status) {
        return a.stock_status === "Out of Stock" ? -1 : 1;
      }

      return (
        a.stocks / Math.max(a.reorder_at, 1) -
        b.stocks / Math.max(b.reorder_at, 1)
      );
    });

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <section>
      <PageLabel Heading="Your stock, at a glance" SubHeading="Overview" />

      {/* Dashboard statistics */}
      <div className="mt-6 grid grid-cols-1 border-y border-gray-300 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((data) => (
          <div
            key={data.label}
            className="flex flex-col gap-4 border-b border-gray-300 px-6 py-10 last:border-b-0 sm:border-r sm:nth-[2n]:border-r-0 lg:border-b-0 lg:nth-[2n]:border-r lg:nth-[4n]:border-r-0"
          >
            <p className="label text-xs font-semibold uppercase">
              {data.label}
            </p>
            <h3 className="text-5xl">{data.loading ? "..." : data.value}</h3>
          </div>
        ))}
      </div>

      {/* Main dashboard content */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Products needing reordering */}
        <div>
          <div className="mb-3 mt-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500">
                Needs Reordering
              </p>
              <h2 className="Georgia text-2xl font-bold">Attention Needed</h2>
            </div>

            <NavLink to="/products" className="mb-1 text-sm nbg-dark-blue">
              View All
            </NavLink>
          </div>

          {loadingProducts ? (
            <p className="border-y border-gray-300 px-6 py-10 text-gray-500">
              Loading products...
            </p>
          ) : productsError ? (
            <p
              role="alert"
              className="border-y border-gray-300 px-6 py-10 text-red-600"
            >
              {productsError}
            </p>
          ) : sortedReorders.length === 0 ? (
            <p className="border-y border-gray-300 px-6 py-10 text-gray-500">
              No products need reordering.
            </p>
          ) : (
            sortedReorders.map((product) => (
              <div
                key={product.id}
                className="border-y border-gray-300 px-6 py-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{product.products}</p>
                    <p className="mt-1 font-mono text-xs text-gray-500">
                      {product.sku}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <p className="text-sm">
                      <span className="font-semibold">{product.stocks}</span>{" "}
                      left
                    </p>

                    <p className="text-sm text-gray-500">
                      Reorder at{" "}
                      <span className="font-semibold text-gray-900">
                        {product.reorder_at}
                      </span>
                    </p>

                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        product.stock_status === "Out of Stock"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {product.stock_status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {!loadingProducts && !productsError && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <p>
                Low stock:{" "}
                <span className="font-semibold text-amber-700">
                  {lowStockCount}
                </span>
              </p>

              <p>
                Out of stock:{" "}
                <span className="font-semibold text-red-700">
                  {outOfStockCount}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div>
          <div className="mb-3 mt-6">
            <p className="text-xs uppercase text-gray-500">Latest Activity</p>
            <h2 className="Georgia text-2xl font-bold">Recent orders</h2>
          </div>

          {loadingOrders ? (
            <p className="border-y border-gray-300 px-6 py-10 text-gray-500">
              Loading orders...
            </p>
          ) : ordersError ? (
            <p
              role="alert"
              className="border-y border-gray-300 px-6 py-10 text-red-600"
            >
              {ordersError}
            </p>
          ) : recentOrders.length === 0 ? (
            <p className="border-y border-gray-300 px-6 py-10 text-gray-500">
              No orders yet.
            </p>
          ) : (
            recentOrders.map((order) => (
              <NavLink
                key={order.id}
                to={`/orders/${encodeURIComponent(order.orderNumber)}`}
                className="block border-y border-gray-300 px-6 py-6 transition-colors hover:bg-gray-50"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="label font-mono text-xs font-semibold">
                      {order.orderNumber}
                    </p>

                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        order.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : order.status === "Paid"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "Fulfilled"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString("en-PH")}
                      </p>
                    </div>

                    <p className="text-sm font-semibold">
                      {formatCurrency(Number(order.total))}
                    </p>
                  </div>
                </div>
              </NavLink>
            ))
          )}

          <div className="mt-4">
            <NavLink to="/orders" className="text-sm nbg-dark-blue">
              View All Orders
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
}
