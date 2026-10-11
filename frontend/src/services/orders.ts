import type { Order } from '../components/Table'

const BASE = import.meta.env.VITE_API_URL

type OrderDto = {
  order_number: string
  customer_name: string
  status: Order['status']
  total: number
  created_at: string
}

export type NewOrder = {
  customerName: string
  items: { productId: string; quantity: number }[]
}

const toOrder = (d: OrderDto): Order => ({
  id: d.order_number, // the receipt number is the id now
  orderNumber: d.order_number,
  customer: d.customer_name,
  createdAt: d.created_at,
  total: d.total,
  status: d.status,
})

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!res.ok) {
    let message = 'Something went wrong. Try again.'
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') message = body.detail
      else if (Array.isArray(body.detail))
        message = 'Please check the order and try again.'
    } catch {
      // no JSON body, keep the default message
    }
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

export async function getOrders(): Promise<Order[]> {
  const rows = await request<OrderDto[]>('/orders')
  return rows.map(toOrder)
}

export async function createOrder(order: NewOrder): Promise<Order> {
  const row = await request<OrderDto>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer_name: order.customerName,
      items: order.items.map((i) => ({
        product_id: i.productId,
        quantity: i.quantity,
      })),
    }),
  })
  return toOrder(row)
}


export async function updateOrderStatus(
  orderNumber: string,
  status: Order["status"],
): Promise<Order> {
  const row = await request<OrderDto>(
    `/orders/${encodeURIComponent(orderNumber)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  return toOrder(row);
}


export type OrderDetailsDto = {
  order_number: string;
  customer_name: string;
  status: string;
  total: number;
  created_at: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
};

export async function getOrderDetails(
  orderNumber: string,
): Promise<OrderDetailsDto> {
  return request<OrderDetailsDto>(
    `/orders/${encodeURIComponent(orderNumber)}`,
    { method: "GET" },
  );
}