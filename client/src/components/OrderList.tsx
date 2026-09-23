import { useEffect, useState } from "react";
import { getOrders } from "../api";
import { Link } from "react-router-dom";

type Order = {
  id: string;
  currentStatus: string;
};

function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, [status]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const data = await getOrders(status || undefined);
      setOrders(data);
    } catch (error) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Orders</h2>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="created">Created</option>
        <option value="paid">Paid</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {loading && <p>Loading orders...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p>No orders found.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Current Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.currentStatus}</td>
                <td>
                  <Link to={`/orders/${order.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrderList;