// src/pages/OrdersPage.js
import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { useToasts } from "../components/ToastContext";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { push } = useToasts();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      push("Failed to load orders", "error");
    } finally { setLoading(false); }
  };

  const openDetails = (order) => setSelected(order);
  const closeDetails = () => setSelected(null);

  if (loading) return <div className="info-box">Loading orders...</div>;

  return (
    <div>
      <div className="space-between" style={{ marginBottom: 12 }}>
        <h2>Orders</h2>
        <Link to="/orders/create"><button>Create Order</button></Link>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">No orders yet — create your first order.</div>
      ) : (
        <table className="table">
          <thead><tr><th>ID</th><th>Customer</th><th>Date</th><th>Total</th><th></th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_name || o.customer || "Guest"}</td>
                <td>{new Date(o.order_date).toLocaleString()}</td>
                <td>₹{parseFloat(o.total_amount || 0).toFixed(2)}</td>
                <td><button className="secondary" onClick={() => openDetails(o)}>Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={!!selected} title={`Order #${selected?.id || ""}`} onClose={closeDetails}>
        {selected ? (
          <div>
            <div style={{ marginBottom: 10 }} className="kv">Customer: {selected.customer_name || selected.customer || "Guest"}</div>
            <div style={{ marginBottom: 10 }} className="kv">Date: {new Date(selected.order_date).toLocaleString()}</div>

            <h4>Items</h4>
            <div style={{ display: "grid", gap: 8 }}>
              {selected.items.map(it => (
                <div key={it.id} className="product-card">
                  <div className="product-avatar">{(it.product_name || "P").slice(0,1)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight:700 }}>{it.product_name}</div>
                    <div className="kv">{it.product_sku} • {it.product_category}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="kv">Qty: {it.quantity}</div>
                    <div style={{ fontWeight:700 }}>₹{parseFloat(it.total_price || (it.quantity * parseFloat(it.price_at_sale || 0))).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, textAlign: "right", fontWeight:700 }}>
              Total: ₹{parseFloat(selected.total_amount || 0).toFixed(2)}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
