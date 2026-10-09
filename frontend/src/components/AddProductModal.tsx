import { useState, type FormEvent, type ReactNode } from 'react'
import Modal from './Modal'
import Button from './Button'
import type { Product } from './Table'

const categories = ['Pantry', 'Drinks']

type Values = {
  name: string
  itemID: string
  category: string
  price: string
  inStock: string
  reOrderAt: string
}
type Errors = Partial<Record<keyof Values, string>>

const emptyValues: Values = {
  name: '',
  itemID: '',
  category: '',
  price: '',
  inStock: '0',
  reOrderAt: '0',
}

const isCount = (s: string) =>
  s.trim() !== '' && Number.isInteger(Number(s)) && Number(s) >= 0

function validate(v: Values, existingSkus: string[]): Errors {
  const errors: Errors = {}
  const sku = v.itemID.trim().toUpperCase()
  const price = Number(v.price)

  if (!v.name.trim()) errors.name = 'Enter a product name.'

  if (!sku) errors.itemID = 'Enter a SKU.'
  else if (existingSkus.some((s) => s.toUpperCase() === sku))
    errors.itemID = 'This SKU already exists.'

  if (!v.category) errors.category = 'Choose a category.'

  if (v.price.trim() === '' || Number.isNaN(price) || price <= 0)
    errors.price = 'Enter a price above 0.'

  if (!isCount(v.inStock)) errors.inStock = 'Whole number, 0 or more.'
  if (!isCount(v.reOrderAt)) errors.reOrderAt = 'Whole number, 0 or more.'

  return errors
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-gray-500">{label}</span>
      {children}
      {error && (
        <span role="alert" className="text-red-700">
          {error}
        </span>
      )}
    </label>
  )
}

const inputClass = (hasError: boolean) =>
  `min-h-11 w-full border bg-white px-3 py-2 focus:outline-2 focus:outline-blue-900 ${
    hasError ? 'border-red-600' : 'border-gray-300'
  }`

export default function AddProductModal({
  existingSkus,
  onSubmit,
  onClose,
}: {
  existingSkus: string[]
  onSubmit: (product: Omit<Product, 'id'>) => void
  onClose: () => void
}) {
  const [values, setValues] = useState<Values>(emptyValues)
  const [errors, setErrors] = useState<Errors>({})

  function update(key: keyof Values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    // Clear that field's error as soon as the user edits it
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const found = validate(values, existingSkus)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    onSubmit({
      name: values.name.trim(),
      itemID: values.itemID.trim().toUpperCase(),
      category: values.category,
      price: Number(values.price),
      inStock: Number(values.inStock),
      reOrderAt: Number(values.reOrderAt),
    })
  }

  return (
    <Modal title="Add product" onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
        <Field label="Product name" error={errors.name}>
          <input
            data-autofocus
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            aria-invalid={!!errors.name}
            className={inputClass(!!errors.name)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="SKU" error={errors.itemID}>
            <input
              value={values.itemID}
              onChange={(e) => update('itemID', e.target.value)}
              aria-invalid={!!errors.itemID}
              className={`${inputClass(!!errors.itemID)} font-mono uppercase`}
            />
          </Field>

          <Field label="Category" error={errors.category}>
            <select
              value={values.category}
              onChange={(e) => update('category', e.target.value)}
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
              onChange={(e) => update('price', e.target.value)}
              aria-invalid={!!errors.price}
              className={`${inputClass(!!errors.price)} font-mono`}
            />
          </Field>

          <Field label="Opening stock" error={errors.inStock}>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={values.inStock}
              onChange={(e) => update('inStock', e.target.value)}
              aria-invalid={!!errors.inStock}
              className={`${inputClass(!!errors.inStock)} font-mono`}
            />
          </Field>

          <Field label="Reorder at" error={errors.reOrderAt}>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={values.reOrderAt}
              onChange={(e) => update('reOrderAt', e.target.value)}
              aria-invalid={!!errors.reOrderAt}
              className={`${inputClass(!!errors.reOrderAt)} font-mono`}
            />
          </Field>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 font-bold hover:bg-stone-100"
          >
            Cancel
          </button>
          <Button type="submit" Label="Save product" />
        </div>
      </form>
    </Modal>
  )
}
