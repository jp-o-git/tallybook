import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageLabel from "../components/PageLabel";
import { money } from "../lib/format";
import { getOrderDetails, type OrderDetailsDto } from "../services/orders";

const statusStyle: Record<OrderDetailsDto["status"], string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Paid: "bg-blue-50 text-blue-800 ring-blue-200",
  Fulfilled: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function OrderDetailsPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!orderNumber) {
        setError("The order number is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await getOrderDetails(orderNumber);
        if (isMounted) setOrder(result);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Could not load this order.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderNumber]);

  const date = order ? new Date(order.created_at) : null;
  const dateLabel =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })
      : "Date unavailable";

  return (
    <section className="space-y-6">
      <Link
        to="/orders"
        className="inline-flex min-h-10 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Back to orders
      </Link>

      {loading ? (
        <>
          <PageLabel Heading="Order details" SubHeading="Sales" />
          <div className="panel empty-state">Loading order…</div>
        </>
      ) : error || !order ? (
        <>
          <PageLabel Heading="Order not found" SubHeading="Sales" />
          <div role="alert" className="panel empty-state text-rose-700">
            {error ?? "This order could not be found."}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <PageLabel Heading="Order details" SubHeading="Sales" />
            <span className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${statusStyle[order.status]}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <section className="panel">
              <header className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Order number</p>
                <h2 className="mt-2 break-all font-mono text-lg font-semibold text-slate-900 sm:text-xl">
                  {order.order_number}
                </h2>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                      <th scope="col" className="px-5 py-3.5 font-semibold sm:px-6">Product</th>
                      <th scope="col" className="px-3 py-3.5 text-right font-semibold">Qty</th>
                      <th scope="col" className="px-3 py-3.5 text-right font-semibold">Unit price</th>
                      <th scope="col" className="px-5 py-3.5 text-right font-semibold sm:px-6">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <tr key={item.product_id}>
                        <td className="px-5 py-4 font-medium text-slate-900 sm:px-6">{item.product_name}</td>
                        <td className="px-3 py-4 text-right tabular-nums text-slate-600">{item.quantity}</td>
                        <td className="px-3 py-4 text-right font-mono tabular-nums text-slate-600">{money(item.unit_price)}</td>
                        <td className="px-5 py-4 text-right font-mono font-medium tabular-nums text-slate-900 sm:px-6">{money(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                <span className="text-sm font-medium text-slate-600">Total</span>
                <span className="font-mono text-lg font-semibold tabular-nums text-slate-900">{money(order.total)}</span>
              </footer>
            </section>

            <aside className="panel p-5 sm:p-6">
              <h2 className="text-base font-semibold text-slate-900">Order information</h2>
              <dl className="mt-5 space-y-5">
                <div className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <UserRound size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Customer</dt>
                    <dd className="mt-1 break-words text-sm font-medium text-slate-900">{order.customer_name}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <CalendarDays size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Date placed</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">{dateLabel}</dd>
                  </div>
                </div>
              </dl>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
