import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageLabel from "../components/PageLabel";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import type { Product } from "../components/Table";
import { getProducts } from "../services/products";
import { createOrder } from "../services/orders";
import { money } from "../lib/format";

type Line = { id: Product["id"]; qty: number };

const stepperClass =
  "flex size-11 cursor-pointer items-center justify-center border border-gray-300 text-base text-stone-900 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 lg:size-8";

export default function NewOrderPage() {
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [customer, setCustomer] = useState("");
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [customerError, setCustomerError] = useState("");
  const [itemsError, setItemsError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [placedOn] = useState(() => new Date());

  async function loadProducts(): Promise<Product[] | null> {
    try {
      setLoading(true);
      setLoadError(null);

      const data = await getProducts();
      const mapped: Product[] = data.map((p) => ({
        id: p.id,
        itemID: p.sku,
        name: p.products,
        category: p.category,
        price: Number(p.price),
        inStock: p.stocks,
        reOrderAt: p.reorder_at,
        stockStatus: p.stock_status,
      }));

      setProducts(mapped);
      return mapped;
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load products.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter(
      (p) =>
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.itemID.toLowerCase().includes(q),
    );
  }, [products, search]);

  // Receipt lines: each cart line joined with its product and a line total
  const receiptLines = lines.flatMap((line) => {
    const product = byId.get(line.id);
    return product
      ? [{ ...line, product, total: product.price * line.qty }]
      : [];
  });
  const total = receiptLines.reduce((sum, l) => sum + l.total, 0);
  const itemCount = receiptLines.reduce((sum, l) => sum + l.qty, 0);

  function addProduct(product: Product) {
    setItemsError("");
    setLines((prev) => {
      const existing = prev.find((l) => l.id === product.id);

      if (!existing) {
        return product.inStock > 0
          ? [...prev, { id: product.id, qty: 1 }]
          : prev;
      }

      return prev.map((l) =>
        l.id === product.id
          ? { ...l, qty: Math.min(l.qty + 1, product.inStock) }
          : l,
      );
    });
  }

  function changeQty(product: Product, qty: number) {
    const next = Math.min(Math.max(qty, 1), product.inStock);
    setLines((prev) =>
      prev.map((l) => (l.id === product.id ? { ...l, qty: next } : l)),
    );
  }

  function removeLine(id: Product["id"]) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  // After the stock numbers change, make the receipt match them
  function syncLines(fresh: Product[]) {
    setLines((prev) =>
      prev.flatMap((l) => {
        const p = fresh.find((x) => x.id === l.id);
        if (!p || p.inStock === 0) return [];
        return [{ ...l, qty: Math.min(l.qty, p.inStock) }];
      }),
    );
  }

  function scrollToReceipt() {
    receiptRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function placeOrder() {
    const nameMissing = customer.trim() === "";
    const empty = lines.length === 0;

    setCustomerError(nameMissing ? "Enter the customer name." : "");
    setItemsError(empty ? "Add at least one product." : "");
    if (nameMissing || empty) return;

    try {
      setPlacing(true);
      setPlaceError("");

      // No prices are sent. The server looks them up and checks the stock.
      await createOrder({
        customerName: customer.trim(),
        items: lines.map((l) => ({
          productId: String(l.id),
          quantity: l.qty,
        })),
      });

      navigate("/orders");
    } catch (err) {
      setPlaceError(
        err instanceof Error ? err.message : "Could not place the order.",
      );

      // Stock may have changed, so refresh the numbers and fix the receipt
      const fresh = await loadProducts();
      if (fresh) syncLines(fresh);
    } finally {
      setPlacing(false);
    }
  }

  return (
    // Extra bottom space on mobile so the sticky bar never covers content
    <section className={itemCount > 0 ? "pb-24 lg:pb-0" : ""}>
      <div className="flex flex-row items-center justify-between gap-4">
        <PageLabel Heading="New order" SubHeading="Sales" />
        <Link
          to="/orders"
          className="inline-flex min-h-11 items-center px-2 underline underline-offset-4"
        >
          Cancel
        </Link>
      </div>

      {/* minmax(0,1fr) lets the left column shrink instead of overflowing */}
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        {/* Left: customer + product picker */}
        <div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-500">Customer name</span>
            <input
              value={customer}
              onChange={(e) => {
                setCustomer(e.target.value);
                setCustomerError("");
              }}
              aria-invalid={!!customerError}
              className={`min-h-11 w-full border bg-white px-3 py-2 focus:outline-2 focus:outline-blue-900 ${
                customerError ? "border-red-600" : "border-gray-300"
              }`}
            />
            {customerError && (
              <span role="alert" className="text-red-700">
                {customerError}
              </span>
            )}
          </label>

          <div className="mt-10">
            <p className="text-xs uppercase text-gray-500">
              Add items to the order
            </p>
            <h2 className="text-2xl font-bold Georgia">Choose products</h2>
          </div>

          <div className="mt-4">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {loading && products.length === 0 ? (
            <p className="mt-4 border-y border-gray-300 py-10 text-center text-gray-500">
              Loading products…
            </p>
          ) : loadError ? (
            <div
              role="alert"
              className="mt-4 border-y border-gray-300 py-10 text-center"
            >
              <p className="text-red-700">
                Could not load products: {loadError}
              </p>
              <button
                type="button"
                onClick={() => loadProducts()}
                className="mt-3 min-h-11 cursor-pointer underline"
              >
                Try again
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className="mt-4 border-y border-gray-300 py-10 text-center text-gray-500">
              No products match your search.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-gray-300 border-y border-gray-300">
              {visible.map((p) => {
                const inOrder = lines.find((l) => l.id === p.id);
                const out = p.inStock === 0;
                const maxed = !!inOrder && inOrder.qty >= p.inStock;

                return (
                  // Mobile: name on top, price/stock + Add underneath.
                  // sm and up: everything on one row.
                  <li
                    key={p.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{p.name}</p>
                      <p className="font-mono text-xs text-gray-500">
                        {p.itemID}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-4">
                      <div className="sm:text-right">
                        <p className="font-mono text-sm">{money(p.price)}</p>
                        <p
                          className={`text-xs ${out ? "text-red-700" : "text-gray-500"}`}
                        >
                          {out ? "Out of stock" : `${p.inStock} available`}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={out || maxed}
                        onClick={() => addProduct(p)}
                        aria-label={`Add ${p.name}`}
                        className="min-h-11 min-w-20 cursor-pointer border border-gray-300 bg-white px-3 text-sm font-bold hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {maxed ? "Added" : "Add"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Right: the receipt */}
        <aside
          ref={receiptRef}
          aria-label="Order receipt"
          className="mx-auto w-full max-w-md scroll-mt-4 border border-gray-300 bg-white p-6 font-mono text-sm lg:sticky lg:top-6 lg:mx-0 lg:max-h-[calc(100dvh-3rem)] lg:max-w-none lg:self-start lg:overflow-y-auto"
        >
          <div className="text-center">
            <p className="text-lg font-bold tracking-widest">TALLYBOOK</p>
            <p className="text-xs text-gray-500">Order receipt</p>
          </div>

          <div className="mt-4 space-y-1 border-y border-dashed border-gray-400 py-3 text-xs">
            <div className="flex justify-between gap-4">
              <span>Date</span>
              <span>
                {placedOn.toLocaleString("en-PH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Customer</span>
              <span className="truncate text-right">
                {customer.trim() || "—"}
              </span>
            </div>
          </div>

          {receiptLines.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No items yet. Add products from the list.
            </p>
          ) : (
            <ul className="divide-y divide-dashed divide-gray-300">
              {receiptLines.map((line) => (
                <li key={line.id} className="py-3">
                  <div className="flex justify-between gap-4">
                    <span className="min-w-0 break-words font-bold">
                      {line.product.name}
                    </span>
                    <span className="shrink-0">{money(line.total)}</span>
                  </div>

                  {/* flex-wrap: on very narrow screens the controls drop to their own line */}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-gray-500">
                    <span>{money(line.product.price)} each</span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Decrease ${line.product.name}`}
                        disabled={line.qty <= 1}
                        onClick={() => changeQty(line.product, line.qty - 1)}
                        className={stepperClass}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm text-stone-900">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${line.product.name}`}
                        disabled={line.qty >= line.product.inStock}
                        onClick={() => changeQty(line.product, line.qty + 1)}
                        className={stepperClass}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="ml-2 min-h-11 cursor-pointer px-1 underline lg:min-h-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 border-t border-dashed border-gray-400 pt-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="mt-1 flex justify-between text-lg font-bold">
              <span>TOTAL</span>
              <span>{money(total)}</span>
            </div>
          </div>

          {itemsError && (
            <p role="alert" className="mt-3 text-red-700">
              {itemsError}
            </p>
          )}

          {placeError && (
            <p role="alert" className="mt-3 text-red-700">
              {placeError}
            </p>
          )}

          <div className="mt-4 [&>button]:w-full">
            <Button
              Label={placing ? "Placing order…" : "Place order"}
              onClick={placeOrder}
              disabled={placing}
            />
          </div>
        </aside>
      </div>

      {/* Mobile and tablet only: running total pinned to the bottom */}
      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 border-t border-gray-300 bg-stone-50 px-4 py-3 lg:hidden">
          <div className="font-mono">
            <p className="text-xs text-gray-500">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
            <p className="text-lg font-bold">{money(total)}</p>
          </div>
          <Button Label="View receipt" onClick={scrollToReceipt} />
        </div>
      )}
    </section>
  );
}
