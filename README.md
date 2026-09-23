# Order Status Tracker

A small full-stack application that receives order status webhook events, stores the order information, and displays the current status and event history in a web dashboard.

## Tech Stack

### Backend

* Node.js
* Express
* TypeScript
* SQLite
* better-sqlite3

### Frontend

* React
* TypeScript
* Vite
* React Router
* Native Fetch API

### Testing

* Vitest
* Supertest

## Project Structure

```text
order-status-tracker/
├── server/
│   ├── src/
│   │   ├── db/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── server.ts
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── README.md
├── AI_NOTES.md
├── AGENTS.md
└── .gitignore
```

## Features

* Receive order status events through a webhook endpoint
* Store orders and event history in SQLite
* Handle duplicate webhook events
* Handle events arriving out of order
* Validate order status transitions
* Get all orders
* Filter orders by status
* View an individual order and its complete event history
* React dashboard with loading, empty, and error states
* Tests for important order processing logic

## Order Status Flow

The normal order flow is:

```text
created → paid → shipped → delivered
```

An order can also be cancelled before it is shipped:

```text
created → cancelled
paid → cancelled
```

Invalid transitions are rejected and logged.

## Installation

Clone the repository and install the dependencies.

### Backend

```bash
cd server
npm install
```

### Frontend

Open another terminal:

```bash
cd client
npm install
```

## Environment Variables

The frontend uses a `.env` file.

Create:

```text
client/.env
```

with:

```env
VITE_API_URL=http://localhost:5000
```

The `.env` file should not be committed to the repository.

## Running the Application

### Start the backend

From the `server` directory:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Start the frontend

In another terminal:

```bash
cd client
npm run dev
```

Vite will provide the frontend URL, normally:

```text
http://localhost:5173
```

## Testing the Webhook

The webhook endpoint is:

```text
POST /webhooks/orders
```

Example request:

```json
{
  "eventId": "evt_123",
  "orderId": "ord_9",
  "status": "created",
  "timestamp": "2026-09-20T10:00:00Z"
}
```

You can send webhook events using Postman, Thunder Client, curl, or another HTTP client.

For example, after creating an order, a `paid` event can be sent:

```json
{
  "eventId": "evt_124",
  "orderId": "ord_9",
  "status": "paid",
  "timestamp": "2026-09-20T10:10:00Z"
}
```

## API Endpoints

| Method | Endpoint              | Description                      |
| ------ | --------------------- | -------------------------------- |
| POST   | `/webhooks/orders`    | Receive an order status event    |
| GET    | `/orders`             | Get all orders                   |
| GET    | `/orders?status=paid` | Filter orders by status          |
| GET    | `/orders/:id`         | Get one order with event history |

## Running Tests

From the `server` directory:

```bash
npm test
```

The tests cover:

* Creating an order
* Valid status transitions
* Invalid status transitions
* Duplicate events
* Out-of-order events
* Filtering orders by status

## Key Decisions

### SQLite

SQLite was selected because this is a small practical task and it provides persistent storage without requiring a separate database server.

### Separate service layer

Order processing logic is kept in `orderService.ts` instead of putting all the logic inside the Express routes. This keeps the webhook route easier to understand and makes the main logic easier to test.

### Event ID for duplicate detection

Each webhook event has an `eventId`. The event ID is stored as a primary key in the events table, so the same event can be detected and ignored if it is received again.

### Event timestamp for out-of-order events

Events are stored with their timestamps. When calculating the current order status, events are sorted by timestamp so that events arriving in a different order can still be processed correctly.

### React Router

The orders list and order details are separate pages. Selecting `View` opens the order details using a route such as:

```text
/orders/ord_001
```

## What Was Skipped

Because this was a time-limited practical task, the following were kept simple or skipped:

* No authentication or authorization
* No real payment provider integration
* No webhook signature verification
* Basic dashboard styling
* No pagination
* No real-time updates
* No production deployment configuration
* No advanced logging system

## What I Would Do With More Time

With more development time, I would:

* Add webhook signature verification
* Add authentication and authorization
* Add more API-level tests
* Add better validation for webhook data
* Add pagination for large numbers of orders
* Add real-time updates using WebSockets or Server-Sent Events
* Improve the dashboard UI and responsive design
* Add production configuration and deployment
* Add more detailed application logging
* Add database migrations

## AI Usage

AI usage and development notes are documented separately in `AI_NOTES.md`.
