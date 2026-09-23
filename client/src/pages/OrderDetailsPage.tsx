import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../api";

type OrderEvent = {
  eventId: string;
  orderId: string;
  status: string;
  timestamp: string;
};

type Order = {
  id: string;
  currentStatus: string;
  events: OrderEvent[];
};

function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
    try {
      setLoading(true);
      setError("");

      const data = await getOrderById(id!);
      setOrder(data);
    } catch (error) {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Loading order...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  return (
    <div>
      <Link to="/">← Back to Orders</Link>

      <h2>Order Details</h2>

      <p>
        <strong>Order ID:</strong> {order.id}
      </p>

      <p>
        <strong>Current Status:</strong> {order.currentStatus}
      </p>

      <h3>Event History</h3>

      {order.events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Event ID</th>
            </tr>
          </thead>

          <tbody>
            {order.events.map((event) => (
              <tr key={event.eventId}>
                <td>{event.status}</td>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
                <td>{event.eventId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrderDetailsPage;