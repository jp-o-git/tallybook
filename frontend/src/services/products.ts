import { apiFetch, responseError } from "./api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export type ApiProduct = {
  id: string;
  sku: string;
  products: string;
  category: string;
  price: number;
  stocks: number;
  reorder_at: number;
  stock_status: "In Stock" | "Low Stock" | "Out of Stock";
};

export async function getProducts(): Promise<ApiProduct[]> {
  const url = `${API_URL}/products`;

  const response = await apiFetch("/products");
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status}) at ${url}: ${body.slice(0, 150)}`,
    );
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON but received "${contentType}" from ${url}. Response: ${body.slice(0, 150)}`,
    );
  }

  return JSON.parse(body) as ApiProduct[];
}

export type CreateProductPayload = {
  sku: string;
  products: string;
  category: string;
  price: number;
  stocks: number; // was "stock", which the API ignored
  reorder_at: number;
};

export async function createProduct(
  product: CreateProductPayload,
): Promise<ApiProduct> {
  const response = await apiFetch("/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error(
      await responseError(
        response,
        `Failed to create product (${response.status}).`,
      ),
    );
  }

  return (await response.json()) as ApiProduct;
}

export type UpdateProductPayload = {
  sku?: string;
  products?: string;
  category?: string;
  price?: number;
  stocks?: number;
  reorder_at?: number;
};

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<ApiProduct> {
  const response = await apiFetch(`/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await responseError(response, "Failed to update product."));
  }

  return (await response.json()) as ApiProduct;
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await apiFetch(`/products/${id}`, {
    method: "DELETE",
  });

  // 204 has no body, so there is nothing to parse on success
  if (!response.ok) {
    throw new Error(
      await responseError(response, "Could not delete the product."),
    );
  }
}
