import PageLabel from '../components/PageLabel'
import Button from '../components/Button'
import Dropdown from '../components/Dropdown'
import SearchBar from '../components/SearchBar'
import Table, { type Order } from '../components/Table'

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Temporary mock data. Later this comes from a useOrders() hook.
const orders: Order[] = [
  {
    id: 1,
    orderNumber: '#2024-0805',
    customer: 'Amelia Torres',
    createdAt: '2024-08-05',
    total: 324,
    status: 'Fulfilled',
  },
  {
    id: 2,
    orderNumber: '#2024-0804',
    customer: 'Lito Gonzales',
    createdAt: '2024-08-04',
    total: 690,
    status: 'Pending',
  },
  {
    id: 3,
    orderNumber: '#2024-0803',
    customer: 'Rosa Reyes',
    createdAt: '2024-08-03',
    total: 260.3,
    status: 'Cancelled',
  },
  {
    id: 4,
    orderNumber: '#2024-0802',
    customer: 'Juan Dela Cruz',
    createdAt: '2024-08-02',
    total: 589.75,
    status: 'Paid',
  },
  {
    id: 5,
    orderNumber: '#2024-0801',
    customer: 'Maria Santos',
    createdAt: '2024-08-01',
    total: 1095,
    status: 'Fulfilled',
  },
]

export default function OrdersPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()

    return orders
      .filter((o) => {
        const matchesStatus =
          status === 'all' || o.status.toLowerCase() === status
        const matchesText =
          q === '' ||
          o.customer.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q)

        return matchesStatus && matchesText
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)) // newest first
  }, [search, status])

  return (
    <section>
      <PageLabel Heading="Orders" SubHeading="Sales" />

      {/* Toolbar: filters on the left, primary action on the right */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-4 sm:max-w-2xl sm:flex-1 sm:flex-row sm:items-end">
          <div className="sm:flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div className="sm:w-56">
            <Dropdown
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'fulfilled', label: 'Fulfilled' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>
        </div>

        <Button Label="New Order" onClick={() => navigate('/orders/new')} />
      </div>

      {/* Order list */}
      <div className="mt-6">
        {visible.length === 0 ? (
          <p className="border-y border-gray-300 py-10 text-center text-gray-500">
            No orders match your search.
          </p>
        ) : (
          <Table type="orders" items={visible} />
        )}
      </div>
    </section>
  )
}
