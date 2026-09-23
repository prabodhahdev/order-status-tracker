export type OrderStatus =
  | "created"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderEvent {
  eventId: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
}

export interface Order {
  id: string;
  currentStatus: OrderStatus;
}