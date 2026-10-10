import Button from "../components/Button";
import PageLabel from "../components/PageLabel";
import Dropdown from "../components/Dropdown";
import SearchBar from "../components/SearchBar";
import Table, { type Product } from "../components/Table";
import AddProductModal from "../components/AddProductModal";

import { useEffect, useMemo, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
} from "../services/products";

export default function ProductsPage() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const data = await getProducts();

        const mappedProducts: Product[] = data.map((product) => ({
          id: product.id,
          itemID: product.sku,
          name: product.products,
          category: product.category,
          price: Number(product.price),
          inStock: product.stocks,
          reOrderAt: product.reorder_at,
          stockStatus: product.stock_status,
        }));

        setItems(mappedProducts);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading products.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items
      .filter((p) => {
        const matchesCategory =
          category === "all" || p.category.toLowerCase() === category;

        const matchesText =
          q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.itemID.toLowerCase().includes(q);

        return matchesCategory && matchesText;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, search, category]);

  type ProductFormData = Omit<Product, "id" | "stockStatus">;

  async function handleAdd(data: ProductFormData) {
    try {
      const created = await createProduct({
        sku: data.itemID,
        products: data.name,
        category: data.category,
        price: data.price,
        stock: data.inStock,
        reorder_at: data.reOrderAt,
      });

      const newProduct: Product = {
        id: created.id,
        itemID: created.sku,
        name: created.products,
        category: created.category,
        price: Number(created.price),
        inStock: created.stocks,
        reOrderAt: created.reorder_at,
        stockStatus: created.stock_status,
      };

      setItems((prev) => [...prev, newProduct]);
      setAdding(false);
    } catch (err) {
      console.error("Failed to create product:", err);
      alert(err instanceof Error ? err.message : "Failed to create product.");
    }
  }

  async function handleSave(data: ProductFormData) {
    try {
      if (editingProduct) {
        const updated = await updateProduct(String(editingProduct.id), {
          sku: data.itemID,
          products: data.name,
          category: data.category,
          price: data.price,
          stocks: data.inStock,
          reorder_at: data.reOrderAt,
        });

        const updatedProduct: Product = {
          id: updated.id,
          itemID: updated.sku,
          name: updated.products,
          category: updated.category,
          price: Number(updated.price),
          inStock: updated.stocks,
          reOrderAt: updated.reorder_at,
          stockStatus: updated.stock_status,
        };

        setItems((prev) =>
          prev.map((item) =>
            item.id === updatedProduct.id ? updatedProduct : item,
          ),
        );

        setEditingProduct(null);
      } else {
        await handleAdd(data);
      }
    } catch (err) {
      console.error("Failed to save product:", err);
      alert(err instanceof Error ? err.message : "Failed to save product.");
    }
  }

  return (
    <section>
      <PageLabel Heading="Products" SubHeading="Inventory" />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-4 sm:max-w-2xl sm:flex-1 sm:flex-row sm:items-end">
          <div className="sm:flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div className="sm:w-56">
            <Dropdown
              value={category}
              onChange={setCategory}
              options={[
                { value: "all", label: "All categories" },
                { value: "pantry", label: "Pantry" },
                { value: "drinks", label: "Drinks" },
              ]}
            />
          </div>
        </div>

        <Button Label="Add Product" onClick={() => setAdding(true)} />
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="border-y border-gray-300 py-10 text-center text-gray-500">
            Loading products...
          </p>
        ) : error ? (
          <p className="border-y border-red-300 py-10 text-center text-red-600">
            Failed to load products: {error}
          </p>
        ) : visible.length === 0 ? (
          <p className="border-y border-gray-300 py-10 text-center text-gray-500">
            No products match your search.
          </p>
        ) : (
          <Table
            type="products"
            items={visible}
            onEdit={(product) => setEditingProduct(product)}
          />
        )}
      </div>

      {(adding || editingProduct !== null) && (
        <AddProductModal
          existingSkus={items
            .filter((p) => p.id !== editingProduct?.id)
            .map((p) => p.itemID)}
          initialProduct={editingProduct ?? undefined}
          onSubmit={handleSave}
          onClose={() => {
            setAdding(false);
            setEditingProduct(null);
          }}
        />
      )}
    </section>
  );
}
