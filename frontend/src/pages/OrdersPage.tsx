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
      setOrders(await getOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }

  function retryLoad() {
    setLoading(true);
    setError(null);
    void load();
  }

  useEffect(() => {
    let isMounted = true;
    getOrders()
      .then((data) => {
        if (isMounted) setOrders(data);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Could not load orders.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
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
    <section className="space-y-6">
      <PageLabel Heading="Orders" SubHeading="Sales" />

      <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div>
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div>
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

        <Button Label="New order" onClick={() => navigate("/orders/new")} />
      </div>

      <div>
        {loading ? (
          <p className="panel empty-state">
            Loading orders…
          </p>
        ) : error ? (
          <div
            role="alert"
            className="panel empty-state"
          >
            <p className="text-rose-700">Could not load orders: {error}</p>
            <button
              type="button"
              onClick={retryLoad}
              className="mt-4 min-h-10 cursor-pointer rounded-lg px-3 text-sm font-semibold text-blue-800 hover:bg-blue-50"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <p className="panel empty-state">
            {orders.length === 0 ? "No orders yet. Create your first order to see it here." : "No orders match your search."}
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
