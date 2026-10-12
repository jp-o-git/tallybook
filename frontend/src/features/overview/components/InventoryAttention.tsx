import { PackageSearch } from "lucide-react";
import type { ApiProduct } from "../../../services/products";

export default function InventoryAttention({
  products,
  loading,
}: {
  products: ApiProduct[];
  loading: boolean;
}) {
  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stocks ?? 0);
    const reorderAt = Number(product.reorder_at ?? 0);
    return stock <= reorderAt;
  });

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Inventory Needs Attention
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Products at or below their reorder level.
          </p>
        </div>

        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          {loading ? "..." : lowStockProducts.length}
        </span>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-500">
          Loading inventory...
        </p>
      ) : lowStockProducts.length === 0 ? (
        <div className="py-10 text-center">
          <PackageSearch size={30} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            All products are sufficiently stocked.
          </p>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-gray-100">
          {lowStockProducts.slice(0, 5).map((product) => {
            const stock = Number(product.stocks ?? 0);
            const reorderAt = Number(product.reorder_at ?? 0);

            return (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {product.products}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    SKU: {product.sku || "—"}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-amber-700">
                    {stock} left
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Reorder at {reorderAt}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
