import { useState, type FormEvent, type ReactNode } from "react";
import Modal from "./Modal";
import Button from "./Button";
import type { Product } from "./Table";

const categories = ["Pantry", "Drinks"];

type Values = {
  name: string;
  itemID: string;
  category: string;
  price: string;
  inStock: string;
  reOrderAt: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const emptyValues: Values = {
  name: "",
  itemID: "",
  category: "",
  price: "",
  inStock: "0",
  reOrderAt: "0",
};

const isCount = (s: string) =>
  s.trim() !== "" && Number.isInteger(Number(s)) && Number(s) >= 0;

function validate(
  v: Values,
  existingSkus: string[],
  currentSku?: string,
): Errors {
  const errors: Errors = {};
  const sku = v.itemID.trim().toUpperCase();
  const price = Number(v.price);
  const originalSku = currentSku?.trim().toUpperCase();

  if (!v.name.trim()) errors.name = "Enter a product name.";

  if (!sku) {
    errors.itemID = "Enter a SKU.";
  } else if (
    existingSkus.some(
      (s) => s.toUpperCase() === sku && s.toUpperCase() !== originalSku,
    )
  ) {
    errors.itemID = "This SKU already exists.";
  }

  if (!v.category) errors.category = "Choose a category.";

  if (v.price.trim() === "" || Number.isNaN(price) || price <= 0) {
    errors.price = "Enter a price above 0.";
  }

  if (!isCount(v.inStock)) {
    errors.inStock = "Whole number, 0 or more.";
  }

  if (!isCount(v.reOrderAt)) {
    errors.reOrderAt = "Whole number, 0 or more.";
  }

  return errors;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
      {error && (
        <span role="alert"         className="text-sm text-rose-700">
          {error}
        </span>
      )}
    </label>
  );
}

const inputClass = (hasError: boolean) =>
  `field-control ${hasError ? "!border-rose-500 !ring-2 !ring-rose-100" : ""}`;

export default function AddProductModal({
  existingSkus,
  initialProduct,
  onSubmit,
  onClose,
}: {
  existingSkus: string[];
  initialProduct?: Product;
  onSubmit: (
    product: Omit<Product, "id" | "stockStatus">,
  ) => void | Promise<void>;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Values>(() =>
    initialProduct
      ? {
          name: initialProduct.name,
          itemID: initialProduct.itemID,
          category: initialProduct.category,
          price: String(initialProduct.price),
          inStock: String(initialProduct.inStock),
          reOrderAt: String(initialProduct.reOrderAt),
        }
      : emptyValues,
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(initialProduct);

  function update(key: keyof Values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found = validate(values, existingSkus, initialProduct?.itemID);

    setErrors(found);

    if (Object.keys(found).length > 0) return;

    setSaving(true);

    try {
      await onSubmit({
        name: values.name.trim(),
        itemID: values.itemID.trim().toUpperCase(),
        category: values.category,
        price: Number(values.price),
        inStock: Number(values.inStock),
        reOrderAt: Number(values.reOrderAt),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEditing ? "Edit product" : "Add product"} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 flex flex-col gap-5"
      >
        <Field label="Product name" error={errors.name}>
          <input
            data-autofocus
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            className={inputClass(!!errors.name)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="SKU" error={errors.itemID}>
            <input
              value={values.itemID}
              onChange={(e) => update("itemID", e.target.value)}
              aria-invalid={!!errors.itemID}
              className={`${inputClass(!!errors.itemID)} font-mono uppercase no-spinner`}
            />
          </Field>

          <Field label="Category" error={errors.category}>
            <select
              value={values.category}
              onChange={(e) => update("category", e.target.value)}
              aria-invalid={!!errors.category}
              className={inputClass(!!errors.category)}
            >
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Price" error={errors.price}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={values.price}
              onChange={(e) => update("price", e.target.value)}
              aria-invalid={!!errors.price}
              className={`${inputClass(!!errors.price)} font-mono no-spinner`}
            />
          </Field>

          <Field
            label={isEditing ? "Stock quantity" : "Opening stock"}
            error={errors.inStock}
          >
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={values.inStock}
              onChange={(e) => update("inStock", e.target.value)}
              aria-invalid={!!errors.inStock}
              className={`${inputClass(!!errors.inStock)} font-mono no-spinner`}
            />
          </Field>

          <Field label="Reorder at" error={errors.reOrderAt}>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={values.reOrderAt}
              onChange={(e) => update("reOrderAt", e.target.value)}
              aria-invalid={!!errors.reOrderAt}
              className={`${inputClass(!!errors.reOrderAt)} font-mono no-spinner`}
            />
          </Field>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-11 cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <Button
            type="submit"
            disabled={saving}
            Label={
              saving ? "Saving..." : isEditing ? "Save changes" : "Save product"
            }
          />
        </div>
      </form>
    </Modal>
  );
}
