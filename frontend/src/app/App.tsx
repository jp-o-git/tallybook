import { RouterProvider } from 'react-router-dom'
import { Providers } from './provider'
import { router } from './router'

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
