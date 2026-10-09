import Button from '../components/Button'
import PageLabel from '../components/PageLabel'
import Dropdown from '../components/Dropdown'
import SearchBar from '../components/SearchBar'
import Table, { type Product } from '../components/Table'
import AddProductModal from '../components/AddProductModal'

import { useMemo, useState } from 'react'

const products: Product[] = [
  {
    id: 1,
    itemID: 'RICE-005',
    name: 'Jasmine Rice (5kg)',
    category: 'Pantry',
    price: 389,
    inStock: 10,
    reOrderAt: 10,
  },
  {
    id: 2,
    itemID: 'CIT-500',
    name: 'Calamansi Juice (500ml)',
    category: 'Drinks',
    price: 85,
    inStock: 0,
    reOrderAt: 12,
  },
  {
    id: 3,
    itemID: 'MIX-PAN',
    name: 'Pandesal Mix (1kg)',
    category: 'Pantry',
    price: 120,
    inStock: 3,
    reOrderAt: 6,
  },
  {
    id: 4,
    itemID: 'TUN-180',
    name: 'Canned Tuna (180g)',
    category: 'Pantry',
    price: 42.5,
    inStock: 4,
    reOrderAt: 20,
  },
  {
    id: 5,
    itemID: 'COF-250',
    name: 'Barako Coffee (250g)',
    category: 'Drinks',
    price: 210,
    inStock: 18,
    reOrderAt: 8,
  },
]

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>(products)
  const [adding, setAdding] = useState(false)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()

    return items
      .filter((p) => {
        const matchesCategory =
          category === 'all' || p.category.toLowerCase() === category
        const matchesText =
          q === '' ||
          p.name.toLowerCase().includes(q) ||
          p.itemID.toLowerCase().includes(q)

        return matchesCategory && matchesText
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [items, search, category])

  function handleAdd(data: Omit<Product, 'id'>) {
    // Temporary id. The backend will assign the real one later.
    setItems((prev) => [
      ...prev,
      { ...data, id: Math.max(0, ...prev.map((p) => p.id)) + 1 },
    ])
    setAdding(false)
  }

  return (
    <section>
      <PageLabel Heading="Products" SubHeading="Inventory" />

      {/* Toolbar: filters on the left, primary action on the right */}
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
                { value: 'all', label: 'All categories' },
                { value: 'pantry', label: 'Pantry' },
                { value: 'drinks', label: 'Drinks' },
              ]}
            />
          </div>
        </div>

        <Button Label="Add Product" onClick={() => setAdding(true)} />
      </div>

      {/* Product list */}
      <div className="mt-6">
        {visible.length === 0 ? (
          <p className="border-y border-gray-300 py-10 text-center text-gray-500">
            No products match your search.
          </p>
        ) : (
          <Table type="products" items={visible} />
        )}
      </div>

      {adding && (
        <AddProductModal
          existingSkus={items.map((p) => p.itemID)}
          onSubmit={handleAdd}
          onClose={() => setAdding(false)}
        />
      )}
    </section>
  )
}
