import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import PageLabel from "../components/PageLabel";
import { getProducts } from "../services/products";
import type { ApiProduct } from "../services/products";
import { getOrders } from "../services/orders";
import type { Order } from "../components/Table";

export default function OverviewPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const data = await getProducts();

        if (isMounted) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    }

    async function loadOrders() {
      try {
        const data = await getOrders();

        if (isMounted) {
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        if (isMounted) {
          setLoadingOrders(false);
        }
      }
    }

    loadProducts();
    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedReorders = products
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

  const now = new Date();

  const ordersToday = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);

    return (
      !Number.isNaN(orderDate.getTime()) &&
      orderDate.getFullYear() === now.getFullYear() &&
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getDate() === now.getDate()
    );
  }).length;

  const revenueThisMonth = orders.reduce((total, order) => {
    const orderDate = new Date(order.createdAt);

    const isThisMonth =
      !Number.isNaN(orderDate.getTime()) &&
      orderDate.getFullYear() === now.getFullYear() &&
      orderDate.getMonth() === now.getMonth();

    const countsAsRevenue =
      order.status === "Paid" || order.status === "Fulfilled";

    return isThisMonth && countsAsRevenue ? total + Number(order.total) : total;
  }, 0);

  const formatCurrency = (amount: number) =>
    `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Products",
      value: products.length.toLocaleString(),
      loading: loadingProducts,
    },
    {
      label: "Low on stock",
      value: products
        .filter((product) => product.stock_status === "Low Stock")
        .length.toLocaleString(),
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

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-1 lg:grid-cols-2">
        {/* Products needing reordering */}
        <div>
          <div className="mb-3 mt-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500">
                Needs Reordering
              </p>
              <h2 className="Georgia text-2xl font-bold">Attention Needed</h2>
            </div>

            <NavLink to="/products" className="nbg-dark-blue mb-1 text-sm">
              View All
            </NavLink>
          </div>

          {loadingProducts ? (
            <p className="border-y border-gray-300 px-6 py-10 text-gray-500">
              Loading products...
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

                  <div className="flex flex-wrap items-center gap-5">
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
        </div>

        {/* Recent orders from the API */}
        <div>
          <div className="mb-3 mt-6">
            <p className="text-xs uppercase text-gray-500">Latest Activity</p>
            <h2 className="Georgia text-2xl font-bold">Recent orders</h2>
          </div>

          {loadingOrders ? (
            <p className="border-y border-gray-300 px-6 py-10 text-gray-500">
              Loading orders...
            </p>
          ) : recentOrders.length === 0 ? (
            <p className="border-y border-gray-300 px-6 py-10 text-gray-500">
              No orders found.
            </p>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 border-y border-gray-300 px-6 py-6"
              >
                <p className="label text-xs font-semibold uppercase">
                  {order.orderNumber}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm">{order.customer}</p>

                  <p className="text-sm font-semibold">
                    {formatCurrency(Number(order.total))}
                  </p>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === "Fulfilled"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Paid"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString("en-PH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
