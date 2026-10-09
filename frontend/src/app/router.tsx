import { createBrowserRouter } from 'react-router-dom'
import OverviewPage from '../pages/OverviewPage'
import ProductsPage from '../pages/ProductsPage'
import OrdersPage from '../pages/OrdersPage'
import NewOrderPage from '../pages/NewOrderPage'
import AppLayout from './AppLayout'
// import NotFoundPage from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/new', element: <NewOrderPage /> },
      //   { path: '*', element: <NotFoundPage /> },
    ],
  },
])
