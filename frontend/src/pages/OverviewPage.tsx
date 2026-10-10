import { useEffect, useState } from "react";
import PageLabel from "../components/PageLabel";
import { getProducts } from "../services/products";
import type { ApiProduct } from "../services/products";
import { NavLink, useNavigate } from "react-router-dom";

export default function OverviewPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  const sortedReorders = products
    .filter(
      (product) =>
        product.stock_status === "Low Stock" ||
        product.stock_status === "Out of Stock",
    )
    .sort(
      (a, b) =>
        a.stocks / Math.max(a.reorder_at, 1) -
        b.stocks / Math.max(b.reorder_at, 1),
    );

  const recentOrders = [
    {
      id: 1,
      invoiceNum: "#2024-0801",
      customer: "Maria Santos",
      value: 1095.0,
      status: "Fulfilled",
    },
    {
      id: 2,
      invoiceNum: "#2024-0802",
      customer: "Juan Dela Cruz",
      value: 589.75,
      status: "Paid",
    },
    {
      id: 3,
      invoiceNum: "#2024-0803",
      customer: "Rosa Reyes",
      value: 260.3,
      status: "Cancelled",
    },
    {
      id: 4,
      invoiceNum: "#2024-0804",
      customer: "Lito Gonzales",
      value: 690.0,
      status: "Pending",
    },
    {
      id: 5,
      invoiceNum: "#2024-0805",
      customer: "Amelia Torres",
      value: 324.0,
      status: "Fulfilled",
    },
  ];

  return (
    <section>
      <PageLabel Heading="Your stock, at a glance" SubHeading="Overview" />
      <div className="mt-6 grid grid-cols-1 border-y border-gray-300 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Products",
            value: products.length,
          },
          {
            label: "Low on stock",
            value: products.filter(
              (product) => product.stock_status === "Low Stock",
            ).length,
          },
          {
            label: "Orders today",
            value: 0,
          },
          {
            label: "Revenue this month",
            value: "₱0.00",
          },
        ].map((data, index) => (
          <div
            key={data.label}
            className={`flex flex-col gap-4 border-b border-gray-300 px-6 py-10 last:border-b-0 sm:border-r sm:nth-[2n]:border-r-0 lg:border-b-0 lg:nth-[2n]:border-r lg:nth-[4n]:border-r-0 ${
              index < 2 ? "lg:border-b-0" : ""
            }`}
          >
            <p className="label text-xs font-semibold uppercase">
              {data.label}
            </p>

            <h3 className="text-5xl">{loadingProducts ? "..." : data.value}</h3>
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-3 mt-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500">
                Needs Reordering
              </p>
              <h2 className="text-2xl Georgia font-bold">Attention Needed</h2>
            </div>

            <NavLink to="/products" className="mb-1 text-sm nbg-dark-blue">
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
            sortedReorders.map((data) => (
              <div key={data.id} className="border-y border-gray-300 px-6 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Product name and SKU */}
                  <div className="min-w-0">
                    <p className="font-semibold">{data.products}</p>
                    <p className="mt-1 font-mono text-xs text-gray-500">
                      {data.sku}
                    </p>
                  </div>

                  {/* Stock quantity and reorder threshold */}
                  <div className="flex items-center gap-5">
                    <p className="text-sm">
                      <span className="font-semibold">{data.stocks}</span> left
                    </p>
                    <p className="text-sm text-gray-500">
                      Reorder at{" "}
                      <span className="font-semibold text-gray-900">
                        {data.reorder_at}
                      </span>
                    </p>

                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        data.stock_status === "Out of Stock"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {data.stock_status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div>
          <div className="mb-3 mt-6">
            <p className="text-xs text-gray-500 uppercase">Latest Activity</p>
            <h2 className="text-2xl Georgia font-bold">Recent orders</h2>
          </div>
          {recentOrders.map((data) => (
            <div
              key={data.id}
              className="flex flex-col gap-4 border-y border-gray-300 px-6 py-10"
            >
              <p className="text-xs label uppercase font-[600]">
                {data.invoiceNum}
              </p>
              <div className="flex flex-row gap-4">
                <p className="text-sm">{data.customer}</p>
                <p className="text-sm">{data.value.toFixed(2)}</p>
                <p className="text-sm">{data.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
