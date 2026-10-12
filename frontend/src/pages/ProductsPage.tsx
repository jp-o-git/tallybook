import Button from "../components/Button";
import PageLabel from "../components/PageLabel";
import Dropdown from "../components/Dropdown";
import SearchBar from "../components/SearchBar";
import Table, { type Product } from "../components/Table";
import AddProductModal from "../components/AddProductModal";
import ConfirmDialog from "../components/ConfirmDialog";

import { useEffect, useMemo, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/products";

export default function ProductsPage() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
        stocks: data.inStock,
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

  async function handleDelete() {
    if (!deleting) return;

    try {
      setDeleteBusy(true);
      setDeleteError("");

      await deleteProduct(String(deleting.id));

      setItems((prev) => prev.filter((item) => item.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Could not delete the product.",
      );
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageLabel Heading="Products" SubHeading="Inventory" />

      <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div>
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div>
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

        <Button Label="Add product" onClick={() => setAdding(true)} />
      </div>

      <div>
        {loading ? (
          <p className="panel empty-state">Loading products...</p>
        ) : error ? (
          <p role="alert" className="panel empty-state text-rose-700">
            Failed to load products: {error}
          </p>
        ) : visible.length === 0 ? (
          <p className="panel empty-state">
            {items.length === 0
              ? "Your inventory is empty. Add your first product to get started."
              : "No products match your search."}
          </p>
        ) : (
          <Table
            type="products"
            items={visible}
            onEdit={(product) => setEditingProduct(product)}
            onDelete={(product) => {
              setDeleteError("");
              setDeleting(product);
            }}
          />
        )}
      </div>

      {(adding || editingProduct !== null) && (
        <AddProductModal
          key={editingProduct ? String(editingProduct.id) : "new"}
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

      {deleting && (
        <ConfirmDialog
          title="Delete product"
          confirmLabel="Delete"
          busy={deleteBusy}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => {
            if (!deleteBusy) setDeleting(null);
          }}
        >
          <p>
            <strong>{deleting.name}</strong> will be removed from your stock
            list and the New Order screen.
            {deleting.inStock > 0 &&
              ` It still has ${deleting.inStock} in stock.`}
          </p>
          <p className="mt-2 text-gray-600">
            Past orders keep it, so you can still see who bought it.
          </p>
        </ConfirmDialog>
      )}
    </section>
  );
}
