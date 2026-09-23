import { Router, Request, Response } from "express";
import {
  processOrderEvent,
  getAllOrders,
  getOrderById,
} from "../service/orderservice";
import { OrderEvent, OrderStatus } from "../types/order";

const router = Router();

// Receive order webhook
router.post("/webhooks/orders", (req: Request, res: Response) => {
  try {
    const event: OrderEvent = req.body;

    // Basic validation
    if (
      !event.eventId ||
      !event.orderId ||
      !event.status ||
      !event.timestamp
    ) {
      return res.status(400).json({
        message: "Missing required event fields",
      });
    }

    const result = processOrderEvent(event);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Invalid order event",
    });
  }
});

// Get all orders
router.get("/orders", (req: Request, res: Response) => {
  try {
    const status = req.query.status as OrderStatus | undefined;

    const orders = getAllOrders(status);

    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get orders",
    });
  }
});

// Get one order with event history
router.get("/orders/:id", (req: Request, res: Response) => {
  try {
    const order = getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get order",
    });
  }
});

export default router;