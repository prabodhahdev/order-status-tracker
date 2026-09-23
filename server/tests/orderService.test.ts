import { beforeEach, describe, expect, it } from "vitest";
import db from "../src/db/database";
import {
  processOrderEvent,
  getAllOrders,
  getOrderById,
} from "../src/service/orderservice";

beforeEach(() => {
  db.prepare("DELETE FROM events").run();
  db.prepare("DELETE FROM orders").run();
});

describe("Order service", () => {
  it("should create a new order", () => {
    const result = processOrderEvent({
      eventId: "evt_001",
      orderId: "ord_001",
      status: "created",
      timestamp: "2026-09-20T10:00:00Z",
    });

    expect(result.status).toBe("created");

    const order = getOrderById("ord_001");

    expect(order?.currentStatus).toBe("created");
  });

  it("should allow a valid status transition", () => {
    processOrderEvent({
      eventId: "evt_002",
      orderId: "ord_002",
      status: "created",
      timestamp: "2026-09-20T10:00:00Z",
    });

    const result = processOrderEvent({
      eventId: "evt_003",
      orderId: "ord_002",
      status: "paid",
      timestamp: "2026-09-20T10:10:00Z",
    });

    expect(result.status).toBe("paid");
  });

  it("should reject an invalid status transition", () => {
    processOrderEvent({
      eventId: "evt_004",
      orderId: "ord_003",
      status: "created",
      timestamp: "2026-09-20T10:00:00Z",
    });

    expect(() => {
      processOrderEvent({
        eventId: "evt_005",
        orderId: "ord_003",
        status: "shipped",
        timestamp: "2026-09-20T10:10:00Z",
      });
    }).toThrow("Invalid status transition");
  });

  it("should ignore duplicate events", () => {
    const event = {
      eventId: "evt_006",
      orderId: "ord_004",
      status: "created" as const,
      timestamp: "2026-09-20T10:00:00Z",
    };

    processOrderEvent(event);

    const result = processOrderEvent(event);

    expect(result.duplicate).toBe(true);
  });

  it("should handle events that arrive out of order", () => {
    processOrderEvent({
      eventId: "evt_007",
      orderId: "ord_005",
      status: "shipped",
      timestamp: "2026-09-20T10:20:00Z",
    });

    processOrderEvent({
      eventId: "evt_008",
      orderId: "ord_005",
      status: "paid",
      timestamp: "2026-09-20T10:10:00Z",
    });

    processOrderEvent({
      eventId: "evt_009",
      orderId: "ord_005",
      status: "created",
      timestamp: "2026-09-20T10:00:00Z",
    });

    const order = getOrderById("ord_005");

    expect(order?.currentStatus).toBe("shipped");

    expect(order?.events.map((event) => event.status)).toEqual([
      "created",
      "paid",
      "shipped",
    ]);
  });

  it("should return orders filtered by status", () => {
    processOrderEvent({
      eventId: "evt_010",
      orderId: "ord_006",
      status: "created",
      timestamp: "2026-09-20T10:00:00Z",
    });

    processOrderEvent({
      eventId: "evt_011",
      orderId: "ord_007",
      status: "created",
      timestamp: "2026-09-20T10:00:00Z",
    });

    processOrderEvent({
      eventId: "evt_012",
      orderId: "ord_007",
      status: "paid",
      timestamp: "2026-09-20T10:10:00Z",
    });

    const orders = getAllOrders("paid");

    expect(orders).toHaveLength(1);
    expect(orders[0]).toEqual({
      id: "ord_007",
      currentStatus: "paid",
    });
  });
});