
const API_URL = import.meta.env.VITE_API_URL

export type ApiProduct = {
  id: string
  sku: string
  products: string
  category: string
  price: number
  stocks: number
  reorder_at: number
  stock_status: "In Stock" | "Low Stock" | "Out of Stock"
}

export async function getProducts(): Promise<ApiProduct[]> {
  const url = `${API_URL}/products`

  const response = await fetch(url)
  const contentType = response.headers.get('content-type') ?? ''
  const body = await response.text()

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status}) at ${url}: ${body.slice(0, 150)}`,
    )
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      `Expected JSON but received "${contentType}" from ${url}. Response: ${body.slice(0, 150)}`,
    )
  }

  return JSON.parse(body) as ApiProduct[]
}

export type CreateProductPayload = {
  sku: string
  products: string
  category: string
  price: number
  stock: number
  reorder_at: number
}

export async function createProduct(
  product: CreateProductPayload,
): Promise<ApiProduct> {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.detail ?? `Failed to create product: ${response.status}`,
    )
  }

  return result as ApiProduct
}

export type UpdateProductPayload = {
  sku?: string
  products?: string
  category?: string
  price?: number
  stocks?: number
  reorder_at?: number
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<ApiProduct> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.detail || 'Failed to update product.')
  }

  return result
}