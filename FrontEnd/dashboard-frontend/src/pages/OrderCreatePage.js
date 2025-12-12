// src/pages/OrderCreatePage.js
import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useToasts } from "../components/ToastContext";

export default function OrderCreatePage() {
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 16));
  const [items, setItems] = useState([{ product: "", quantity: 1 }]);
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const { push } = useToasts();

  useEffect(() => {
    api.get("/products/").then(res => setProducts(res.data)).catch(() => push("Failed to load products", "error"));
    api.get("/customers/").then(res => setCustomers(res.data)).catch(() => push("Failed to load customers", "error"));
  }, [push]);

  const addItem = () => setItems([...items, { product: "", quantity: 1 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, key, value) => {
    const copy = [...items];
    copy[idx][key] = value;
    setItems(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    for (const it of items) {
      if (!it.product) { push("Select product for all items", "error"); return; }
      if (!it.quantity || Number(it.quantity) <= 0) { push("Quantity must be >= 1", "error"); return; }
      const prod = products.find(p => p.id === Number(it.product));
      if (prod && Number(it.quantity) > prod.stock) { push(`Not enough stock for ${prod.name}`, "error"); return; }
    }

    const payload = {
      customer: customerId || null,
      order_date: new Date(orderDate).toISOString(),
      payment_method: "CASH",
      items: items.map(it => ({ product: parseInt(it.product), quantity: parseInt(it.quantity) })),
    };
    try {
      await api.post("/orders/", payload);
      push("Order created", "success");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      push("Order creation failed", "error");
    }
  };

  return (
    <div>
      <h2>Create Order</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label className="kv">Customer</label><br />
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">-- guest / no customer --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label className="kv">Order Date</label><br />
          <input type="datetime-local" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
        </div>

        <div>
          <h4>Items</h4>
          {items.map((it, idx) => (
            <div key={idx} style={{ marginBottom: 8, display:"flex", gap:8, alignItems:"center" }}>
              <select value={it.product} onChange={(e) => updateItem(idx, "product", e.target.value)} required>
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.sku} (Stock: {p.stock})</option>)}
              </select>
              <input type="number" min="1" value={it.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} style={{ width: 100 }} />
              <button type="button" className="secondary" onClick={() => removeItem(idx)}>Remove</button>
            </div>
          ))}
          <div style={{ marginTop:8 }}>
            <button type="button" onClick={addItem}>Add Item</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit">Create Order</button>
        </div>
      </form>
    </div>
  );
}
