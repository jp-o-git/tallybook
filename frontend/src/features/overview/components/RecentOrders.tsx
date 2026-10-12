import { useMemo } from "react";
import { ClipboardList } from "lucide-react";
import type { Order } from "../../../components/Table";
import { formatCurrency, formatDate, getOrderDate } from "../utils";

const statusStyles: Record<Order["status"], string> = {
  Pending: "bg-amber-50 text-amber-700",
  Paid: "bg-blue-50 text-blue-700",
  Fulfilled: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

function OrderStatus({ status }: { status: Order["status"] }) {
  return (
    <span
      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export default function RecentOrders({
  orders,
  loading,
}: {
  orders: Order[];
  loading: boolean;
}) {
  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => getOrderDate(b).getTime() - getOrderDate(a).getTime())
        .slice(0, 5),
    [orders],
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <p className="mt-1 text-sm text-gray-500">
            Latest orders from your system.
          </p>
        </div>

        <ClipboardList size={22} className="text-gray-400" aria-hidden="true" />
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-500">
          Loading orders...
        </p>
      ) : recentOrders.length === 0 ? (
        <div className="py-10 text-center">
          <ClipboardList size={30} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">No orders found.</p>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-gray-100">
          {recentOrders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">
                  {order.orderNumber}
                </p>
                <p className="mt-1 truncate text-xs text-gray-500">
                  {order.customer} · {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(Number(order.total ?? 0))}
                </p>
                <OrderStatus status={order.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
