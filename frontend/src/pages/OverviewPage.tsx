import PageLabel from '../components/PageLabel'

export default function OverviewPage() {
  const productData = [
    { id: 1, label: 'PRODUCTS', amount: 10 },
    { id: 2, label: 'LOW ON STOCK', amount: 10 },
    { id: 3, label: 'ORDERS TODAY', amount: 10 },
    { id: 4, label: 'REVENUE THIS MONTH', amount: 10 },
  ]

  const needReOrder = [
    {
      id: 1,
      productCode: 'RICE-005',
      product: 'Jasmine Rice (5kg)',
      left: 10,
      reorder: 10,
    },
    {
      id: 2,
      productCode: 'CIT-500',
      product: 'Calamansi Juice (500ml)',
      left: 0,
      reorder: 12,
    },
    {
      id: 3,
      productCode: 'MIX-PAN',
      product: 'Pandesal Mix (1kg)',
      left: 3,
      reorder: 6,
    },
    {
      id: 4,
      productCode: 'TUN-180',
      product: 'Canned Tuna (180g)',
      left: 4,
      reorder: 20,
    },
  ]

  const recentOrders = [
    {
      id: 1,
      invoiceNum: '#2024-0801',
      customer: 'Maria Santos',
      value: 1095.0,
      status: 'Fulfilled',
    },
    {
      id: 2,
      invoiceNum: '#2024-0802',
      customer: 'Juan Dela Cruz',
      value: 589.75,
      status: 'Paid',
    },
    {
      id: 3,
      invoiceNum: '#2024-0803',
      customer: 'Rosa Reyes',
      value: 260.3,
      status: 'Cancelled',
    },
    {
      id: 4,
      invoiceNum: '#2024-0804',
      customer: 'Lito Gonzales',
      value: 690.0,
      status: 'Pending',
    },
    {
      id: 5,
      invoiceNum: '#2024-0805',
      customer: 'Amelia Torres',
      value: 324.0,
      status: 'Fulfilled',
    },
  ]

  const sortedReorders = [...needReOrder].sort(
    (a, b) => a.left / a.reorder - b.left / b.reorder,
  )

  return (
    <section>
      <PageLabel Heading="Your stock, at a glance" SubHeading="Overview" />
      <div className="mt-6 grid grid-cols-1 border-y border-gray-300 sm:grid-cols-2 lg:grid-cols-4">
        {productData.map((data) => (
          <div
            key={data.id}
            className="
              flex flex-col gap-4
              border-b border-gray-300
              px-6 py-10
              last:border-b-0
              sm:border-r
              sm:nth-[2n]:border-r-0
              lg:border-b-0
              lg:nth-[2n]:border-r
              lg:nth-[4n]:border-r-0
            "
          >
            <p className="text-xs label uppercase font-[600]">{data.label}</p>

            <h3 className="text-5xl">{data.amount}</h3>
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="mb-3 mt-6">
            <p className="text-xs text-gray-500 uppercase">Needs Reordering</p>
            <h2 className="text-2xl Georgia font-bold">Attention Needed</h2>
          </div>
          {sortedReorders.map((data) => (
            <div
              key={data.id}
              className="flex flex-col gap-4 border-y border-gray-300 px-6 py-10"
            >
              <p className="text-xs label uppercase font-[600]">
                {data.product}
              </p>
              <div className="flex flex-row gap-4 justify-between w-full">
                <p className="text-sm">Product Code: {data.productCode}</p>
                <p className="text-sm">Left: {data.left}</p>
                <p className="text-sm">Reorder: {data.reorder}</p>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="mb-3 mt-6">
            <p className="text-xs text-gray-500 uppercase">Latest Activity</p>
            <h2 className="text-2xl Georgia font-bold">Recent orders</h2>
          </div>
          {recentOrders.map((data) => (
            <div
              key={data.id}
              className="flex flex-col gap-4 border-y border-gray-300 px-6 py-10"
            >
              <p className="text-xs label uppercase font-[600]">
                {data.invoiceNum}
              </p>
              <div className="flex flex-row gap-4">
                <p className="text-sm">{data.customer}</p>
                <p className="text-sm">{data.value.toFixed(2)}</p>
                <p className="text-sm">{data.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
