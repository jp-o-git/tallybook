# Tallybook

Tallybook is an inventory and sales management application. It provides a
dashboard overview, product and stock management, order creation and status
tracking, and a daily sales report API for integrations such as n8n.

The application currently has no sign-in or account system. The API and its
data are not protected by authentication.

## Features

- View sales and inventory summaries on the overview dashboard.
- Create, update, search, and archive products.
- Track stock quantities and reorder levels.
- Create orders from available products and update order statuses.
- Restore stock when an order is cancelled.
- Request a daily sales report, including revenue comparison, top-selling
  items, order status counts, and stock needing attention.

Orders support `Pending`, `Paid`, `Fulfilled`, and `Cancelled` statuses.

## Requirements

- Python 3.10 or newer
- Node.js and npm
- PostgreSQL

## Configuration

Create a `.env` file in the repository root:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
FRONTEND_REDIRECT_URI=http://localhost:5173
```

`DATABASE_URL` is required by the backend. `FRONTEND_REDIRECT_URI` configures
the allowed frontend origin for the API and defaults to
`http://localhost:5173`.

The frontend uses `http://localhost:8000` as its default API URL. To use a
different backend URL, set `VITE_API_URL` in a frontend environment file, for
example `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

## Database setup

From the repository root, create and activate a Python virtual environment,
install backend dependencies, and apply the database migrations:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m alembic upgrade head
```

The latest migration removes the obsolete account, verification, and refresh
token tables and removes ownership columns from products and orders. It
preserves product and order records.

## Run locally

Start the backend from the repository root:

```powershell
python -m uvicorn backend.portal.app:app --reload
```

In another terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend URL printed by Vite, normally
`http://localhost:5173`. The FastAPI interactive API documentation is available
at `http://localhost:8000/docs`.

## Daily sales report for n8n

Configure an n8n **Schedule Trigger** followed by an **HTTP Request** node:

- Method: `GET`
- URL: `http://<backend-host>/reports/daily-sales`

The report covers the current calendar day in `Asia/Manila`. Revenue includes
paid and fulfilled orders and is compared with the previous business day. It
also includes the most purchased non-cancelled items (including ties), order
counts by status, and active products at or below their reorder level.
`ongoing_orders` combines pending and paid orders; `fulfilled_orders` counts
fulfilled orders.

If the previous day's revenue is zero and today's revenue is non-zero,
`revenue_comparison.change_percent` is `null` because a percentage change from
zero is undefined. The `trend` and `change` fields still describe the movement.
The endpoint returns the report when requested; it does not send an unsolicited
webhook request to n8n.

## Frontend checks

Run these commands from the `frontend` directory:

```powershell
npm run lint
npm run build
```
