import Database from "better-sqlite3";

const db = new Database("orders.db");

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    current_status TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    event_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );
`);

export default db;