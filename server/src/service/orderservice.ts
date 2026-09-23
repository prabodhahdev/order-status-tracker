import db from "../db/database";
import { OrderEvent, OrderStatus } from "../types/order";

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  created: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function processOrderEvent(event: OrderEvent) {
  // Check if this event was already received
  const existingEvent = db
    .prepare("SELECT event_id FROM events WHERE event_id = ?")
    .get(event.eventId);

  if (existingEvent) {
    return {
      duplicate: true,
      message: "Event already processed",
    };
  }

  // Get existing events for this order
  const existingEvents = db
    .prepare(`
      SELECT
        event_id as eventId,
        order_id as orderId,
        status,
        timestamp
      FROM events
      WHERE order_id = ?
      ORDER BY timestamp ASC
    `)
    .all(event.orderId) as OrderEvent[];

  // If this is the first event, create the order
  if (existingEvents.length === 0) {
    db.prepare(`
      INSERT INTO orders (id, current_status)
      VALUES (?, ?)
    `).run(event.orderId, event.status);

    db.prepare(`
      INSERT INTO events (
        event_id,
        order_id,
        status,
        timestamp
      )
      VALUES (?, ?, ?, ?)
    `).run(
      event.eventId,
      event.orderId,
      event.status,
      event.timestamp
    );

    return {
      duplicate: false,
      status: event.status,
    };
  }

  // Find the latest event we currently know about
  const latestEvent = existingEvents[existingEvents.length - 1];

  const newTime = new Date(event.timestamp).getTime();
  const latestTime = new Date(latestEvent.timestamp).getTime();

  // If this event is newer, check the normal transition
  if (newTime >= latestTime) {
    const allowedStatuses = validTransitions[latestEvent.status];

    if (!allowedStatuses.includes(event.status)) {
      console.error(
        `Invalid transition: ${latestEvent.status} -> ${event.status}`
      );

      throw new Error(
        `Invalid status transition: ${latestEvent.status} -> ${event.status}`
      );
    }
  }

  // Add the new event
  db.prepare(`
    INSERT INTO events (
      event_id,
      order_id,
      status,
      timestamp
    )
    VALUES (?, ?, ?, ?)
  `).run(
    event.eventId,
    event.orderId,
    event.status,
    event.timestamp
  );

  // Get all events again so we can find the latest status
  const allEvents = db
    .prepare(`
      SELECT
        event_id as eventId,
        order_id as orderId,
        status,
        timestamp
      FROM events
      WHERE order_id = ?
      ORDER BY timestamp ASC
    `)
    .all(event.orderId) as OrderEvent[];

  const currentStatus = allEvents[allEvents.length - 1].status;

  // Update the current order status
  db.prepare(`
    UPDATE orders
    SET current_status = ?
    WHERE id = ?
  `).run(currentStatus, event.orderId);

  return {
    duplicate: false,
    status: currentStatus,
  };
}

export function getAllOrders(status?: OrderStatus) {
  if (status) {
    return db
      .prepare(`
        SELECT
          id,
          current_status as currentStatus
        FROM orders
        WHERE current_status = ?
        ORDER BY id
      `)
      .all(status);
  }

  return db
    .prepare(`
      SELECT
        id,
        current_status as currentStatus
      FROM orders
      ORDER BY id
    `)
    .all();
}

export function getOrderById(orderId: string) {
  const order = db
    .prepare(`
      SELECT
        id,
        current_status as currentStatus
      FROM orders
      WHERE id = ?
    `)
    .get(orderId);

  if (!order) {
    return null;
  }

  const events = db
    .prepare(`
      SELECT
        event_id as eventId,
        order_id as orderId,
        status,
        timestamp
      FROM events
      WHERE order_id = ?
      ORDER BY timestamp ASC
    `)
    .all(orderId);

  return {
    ...order,
    events,
  };
}