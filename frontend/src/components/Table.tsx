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
    }
  | { type: "orders"; items: Order[] };

type Column = { label: string; right?: boolean; srOnly?: boolean };

const productColumns: Column[] = [
  { label: "Product" },
  { label: "Category" },
  { label: "Price", right: true },
  { label: "In stock", right: true },
  { label: "Reorder at", right: true },
  { label: "Status" },
];

// Only added when an onEdit handler is passed in
const actionsColumn: Column = { label: "Actions", right: true, srOnly: true };

const orderColumns: Column[] = [
  { label: "Order" },
  { label: "Customer" },
  { label: "Date" },
  { label: "Total", right: true },
  { label: "Status" },
];

const money = (n: number) => `$${n.toFixed(2)}`;

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

const rowClass = "border-b border-gray-300 last:border-b-0";
const cell = "px-4 py-4";
const numCell = "px-4 py-4 text-right font-mono";

function ProductRow({
  item,
  onEdit,
}: {
  item: Product;
  onEdit?: (product: Product) => void;
}) {
  return (
    <tr className={rowClass}>
      <td className={cell}>
        <p className="font-medium">{item.name}</p>
        <p className="font-mono text-xs text-gray-500">{item.itemID}</p>
      </td>
      <td className={cell}>{item.category}</td>
      <td className={numCell}>{money(item.price)}</td>
      <td className={numCell}>{item.inStock}</td>
      <td className={numCell}>{item.reOrderAt}</td>
      <td className={cell}>
        <StatusMark
          label={item.stockStatus}
          dot={stockStatusColors[item.stockStatus]}
        />
      </td>
      {onEdit && (
        <td className="px-2 py-2 text-right">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.name}`}
            className="min-h-11 cursor-pointer px-3 underline underline-offset-4 hover:text-blue-800"
          >
            Edit
          </button>
        </td>
      )}
    </tr>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <tr className={rowClass}>
      <td className={`${cell} font-mono`}>{order.orderNumber}</td>
      <td className={cell}>{order.customer}</td>
      <td className={cell}>{formatDate(order.createdAt)}</td>
      <td className={numCell}>{money(order.total)}</td>
      <td className={cell}>
        <StatusMark label={order.status} dot={orderDots[order.status]} />
      </td>
    </tr>
  );
}

export default function Table(props: TableProps) {
  const columns =
    props.type === "products"
      ? props.onEdit
        ? [...productColumns, actionsColumn]
        : productColumns
      : orderColumns;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-y border-gray-300 text-left text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-xs uppercase text-gray-500">
            {columns.map((col) => (
              <th
                key={col.label}
                scope="col"
                className={`px-4 py-3 font-semibold ${col.right ? "text-right" : ""}`}
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
                <ProductRow key={item.id} item={item} onEdit={props.onEdit} />
              ))
            : props.items.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
        </tbody>
      </table>
    </div>
  );
}
