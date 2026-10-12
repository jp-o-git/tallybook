import { useEffect, useState } from "react";
import type { Order } from "../../../components/Table";
import { getOrders } from "../../../services/orders";
import { getProducts } from "../../../services/products";
import type { ApiProduct } from "../../../services/products";

type OverviewData = {
  products: ApiProduct[];
  orders: Order[];
  loadingProducts: boolean;
  loadingOrders: boolean;
  productsError: string;
  ordersError: string;
};

export function useOverviewData(): OverviewData {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const data = await getProducts();

        if (active) {
          setProducts(data);
        }
      } catch (error) {
        if (active) {
          setProductsError(
            error instanceof Error ? error.message : "Failed to load products.",
          );
        }
      } finally {
        if (active) {
          setLoadingProducts(false);
        }
      }
    };

    const loadOrders = async () => {
      try {
        const data = await getOrders();

        if (active) {
          setOrders(data);
        }
      } catch (error) {
        if (active) {
          setOrdersError(
            error instanceof Error ? error.message : "Failed to load orders.",
          );
        }
      } finally {
        if (active) {
          setLoadingOrders(false);
        }
      }
    };

    void loadProducts();
    void loadOrders();

    return () => {
      active = false;
    };
  }, []);

  return {
    products,
    orders,
    loadingProducts,
    loadingOrders,
    productsError,
    ordersError,
  };
}
