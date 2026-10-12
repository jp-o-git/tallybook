import Dropdown from "../components/Dropdown";
import { ChevronDown } from "lucide-react";
import { money } from "../lib/format";

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type Product = {
  id: string | number;
  itemID: string;
  name: string;
  category: string;
  price: number;
  inStock: number;
  reOrderAt: number;
  stockStatus: StockStatus;
};

export type Order = {
  id: string | number;
  orderNumber: string;
  customer: string;
  createdAt: string; // ISO date, e.g. '2024-08-01'
  total: number;
  status: "Pending" | "Paid" | "Fulfilled" | "Cancelled";
};

type TableProps =
  | {
      type: "products";
      items: Product[];
      onEdit?: (product: Product) => void;
      onDelete?: (product: Product) => void;
    }
  | {
      type: "orders";
      items: Order[];
      onOrderClick?: (order: Order) => void;
      onStatusChange?: (order: Order, status: Order["status"]) => void;
    };

type Column = { label: string; right?: boolean; srOnly?: boolean };

const productColumns: Column[] = [
  { label: "Product" },
  { label: "Category" },
  { label: "Price", right: true },
  { label: "In stock", right: true },
  { label: "Reorder at", right: true },
  { label: "Status" },
];

// Only added when an onEdit or onDelete handler is passed in
const actionsColumn: Column = { label: "Actions", right: true, srOnly: true };

const orderColumns: Column[] = [
  { label: "Order" },
  { label: "Customer" },
  { label: "Date" },
  { label: "Total", right: true },
  { label: "Status" },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const orderDots: Record<Order["status"], string> = {
  Pending: "bg-amber-500",
  Paid: "bg-blue-800",
  Fulfilled: "bg-green-600",
  Cancelled: "bg-gray-400",
};

const stockStatusColors: Record<StockStatus, string> = {
  "In Stock": "bg-green-600",
  "Low Stock": "bg-amber-500",
  "Out of Stock": "bg-red-600",
};

function StatusMark({ label, dot }: { label: string; dot: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

const rowClass = "border-b border-slate-100 last:border-b-0";
const cell = "px-4 py-4 align-middle";
const numCell = "px-4 py-4 text-right align-middle font-mono tabular-nums";

function ProductRow({
  item,
  onEdit,
  onDelete,
}: {
  item: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}) {
  return (
    <tr className={rowClass}>
      <td className={cell}>
        <p className="font-medium text-slate-900">{item.name}</p>
        <p className="mt-1 font-mono text-xs text-slate-500">{item.itemID}</p>
      </td>
      <td className={cell}>{item.category}</td>
      <td className={numCell}>{money(item.price)}</td>
      <td className={numCell}>{item.inStock}</td>
      <td className={numCell}>{item.reOrderAt}</td>
      <td className={cell}>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            item.stockStatus === "In Stock"
              ? "bg-emerald-50 text-emerald-700"
              : item.stockStatus === "Low Stock"
                ? "bg-amber-50 text-amber-700"
                : "bg-rose-50 text-rose-700"
          }`}
        >
          <StatusMark
            label={item.stockStatus}
            dot={stockStatusColors[item.stockStatus]}
          />
        </span>
      </td>
      {(onEdit || onDelete) && (
        <td className="whitespace-nowrap px-2 py-2 text-right">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.name}`}
              className="min-h-10 cursor-pointer rounded-lg px-3 text-sm font-semibold text-blue-800 hover:bg-blue-50"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              aria-label={`Delete ${item.name}`}
              className="min-h-10 cursor-pointer rounded-lg px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              Delete
            </button>
          )}
        </td>
      )}
    </tr>
  );
}

function OrderRow({
  order,
  onClick,
  onStatusChange,
}: {
  order: Order;
  onClick?: (order: Order) => void;
  onStatusChange?: (order: Order, status: Order["status"]) => void;
}) {
  return (
    <tr
      className={`${rowClass} ${onClick ? "cursor-pointer focus:bg-blue-50 focus:outline-none" : ""}`}
      onClick={() => onClick?.(order)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(order);
        }
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "link" : undefined}
      aria-label={onClick ? `View order ${order.orderNumber}` : undefined}
    >
      <td className={`${cell} font-mono font-medium text-slate-700`}>
        {order.orderNumber}
      </td>
      <td className={cell}>{order.customer}</td>
      <td className={cell}>{formatDate(order.createdAt)}</td>
      <td className={numCell}>{money(order.total)}</td>

      <td className={cell}>
        <div
          onClick={(event) => event.stopPropagation()}
          className={`inline-flex items-center rounded-full border px-2.5 py-1 transition-colors hover:brightness-95 focus-within:ring-2 focus-within:ring-blue-400/40 ${
            order.status === "Pending"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : order.status === "Paid"
                ? "border-blue-200 bg-blue-50 text-blue-800"
                : order.status === "Fulfilled"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-gray-100 text-gray-600"
          }`}
        >
          <span
            className={`mr-2 size-2 shrink-0 rounded-full ${orderDots[order.status]}`}
            aria-hidden="true"
          />
          <Dropdown
            value={order.status}
            onChange={(value) =>
              onStatusChange?.(order, value as Order["status"])
            }
            options={[
              ...(order.status === "Pending"
                ? [{ value: "Paid", label: "Paid" }]
                : []),
              ...(order.status === "Pending" || order.status === "Paid"
                ? [{ value: "Cancelled", label: "Cancelled" }]
                : []),
              ...(order.status === "Paid"
                ? [{ value: "Fulfilled", label: "Fulfilled" }]
                : []),
              { value: order.status, label: order.status },
            ]}
            className="cursor-pointer !min-h-0 !w-auto !rounded-full !appearance-none !border-0 !bg-transparent !px-1 !py-1 !shadow-none text-center text-sm font-medium text-inherit focus:!outline-none focus:!ring-0 focus:!shadow-none"
          />
          <ChevronDown
            size={14}
            className="ml-1 shrink-0 opacity-70"
            aria-hidden="true"
          />
        </div>
      </td>
    </tr>
  );
}

export default function Table(props: TableProps) {
  const columns =
    props.type === "products"
      ? props.onEdit || props.onDelete
        ? [...productColumns, actionsColumn]
        : productColumns
      : orderColumns;

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-500">
            {columns.map((col) => (
              <th
                key={col.label}
                scope="col"
                className={`px-4 py-3.5 font-semibold ${col.right ? "text-right" : ""}`}
              >
                {col.srOnly ? (
                  <span className="sr-only">{col.label}</span>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {props.type === "products"
            ? props.items.map((item) => (
                <ProductRow
                  key={item.id}
                  item={item}
                  onEdit={props.onEdit}
                  onDelete={props.onDelete}
                />
              ))
            : props.items.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onClick={props.onOrderClick}
                  onStatusChange={props.onStatusChange}
                />
              ))}
        </tbody>
      </table>
    </div>
  );
}
