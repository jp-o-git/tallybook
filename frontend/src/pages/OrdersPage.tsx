import PageLabel from "../components/PageLabel";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import SearchBar from "../components/SearchBar";
import Table, { type Order } from "../components/Table";
import { getOrders, updateOrderStatus } from "../services/orders";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const handleStatusChange = async (order: Order, status: Order["status"]) => {
    try {
      await updateOrderStatus(order.orderNumber, status);

      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setOrders(await getOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    return orders.filter((o) => {
      const matchesStatus =
        status === "all" || o.status.toLowerCase() === status;
      const matchesText =
        q === "" ||
        o.customer.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q);

      return matchesStatus && matchesText;
    });
  }, [orders, search, status]);

  return (
    <section>
      <PageLabel Heading="Orders" SubHeading="Sales" />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-4 sm:max-w-2xl sm:flex-1 sm:flex-row sm:items-end">
          <div className="sm:flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div className="sm:w-56">
            <Dropdown
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All statuses" },
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "fulfilled", label: "Fulfilled" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
          </div>
        </div>

        <Button Label="New Order" onClick={() => navigate("/orders/new")} />
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="border-y border-gray-300 py-10 text-center text-gray-500">
            Loading orders…
          </p>
        ) : error ? (
          <div
            role="alert"
            className="border-y border-gray-300 py-10 text-center"
          >
            <p className="text-red-700">Could not load orders: {error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-3 min-h-11 cursor-pointer underline"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <p className="border-y border-gray-300 py-10 text-center text-gray-500">
            No orders match your search.
          </p>
        ) : (
          <Table
            type="orders"
            items={visible}
            onOrderClick={(order) =>
              navigate(`/orders/${encodeURIComponent(order.orderNumber)}`)
            }
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </section>
  );
}
