import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  CircleDollarSign,
  ClipboardList,
  PackageSearch,
} from "lucide-react";

type Stat = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  alert?: boolean;
};

function StatCard({ title, value, description, icon: Icon, alert }: Stat) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>

        <span
          className={`rounded-xl p-3 ${
            alert
              ? "bg-amber-100 text-amber-700"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon size={21} aria-hidden="true" />
        </span>
      </div>

      <p className="mt-3 text-xs text-gray-500">{description}</p>
    </article>
  );
}

export default function OverviewStats({
  totalProducts,
  lowStockCount,
  ordersToday,
  revenueThisMonth,
  loadingProducts,
  loadingOrders,
}: {
  totalProducts: number;
  lowStockCount: number;
  ordersToday: number;
  revenueThisMonth: string;
  loadingProducts: boolean;
  loadingOrders: boolean;
}) {
  const stats: Stat[] = [
    {
      title: "Total Products",
      value: loadingProducts ? "..." : totalProducts.toLocaleString(),
      description: "Active products",
      icon: Boxes,
    },
    {
      title: "Low Stock Items",
      value: loadingProducts ? "..." : lowStockCount.toLocaleString(),
      description: "At or below reorder level",
      icon: PackageSearch,
      alert: !loadingProducts && lowStockCount > 0,
    },
    {
      title: "Orders Today",
      value: loadingOrders ? "..." : ordersToday.toLocaleString(),
      description: "Orders received today",
      icon: ClipboardList,
    },
    {
      title: "Revenue This Month",
      value: loadingOrders ? "..." : revenueThisMonth,
      description: "Paid and fulfilled orders",
      icon: CircleDollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
