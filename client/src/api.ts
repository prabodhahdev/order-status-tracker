const API_URL = import.meta.env.VITE_API_URL;

export async function getOrders(status?: string) {
  const url = status
    ? `${API_URL}/orders?status=${status}`
    : `${API_URL}/orders`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to get orders");
  }

  return response.json();
}

export async function getOrderById(id: string) {
  const response = await fetch(`${API_URL}/orders/${id}`);

  if (!response.ok) {
    throw new Error("Failed to get order");
  }

  return response.json();
}