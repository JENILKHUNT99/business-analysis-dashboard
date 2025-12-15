// src/pages/ProductsPage.js
import { useEffect, useState } from "react";
import api from "../api";
import { useToasts } from "../components/ToastContext";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", sku: "", category: "", buy_price: "", sell_price: "", stock: 0 });
  const { push } = useToasts();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      push("Failed to load products", "error");
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku) { push("Name and SKU are required", "error"); return; }
    try {
      await api.post("/products/", form);
      push("Product added", "success");
      setForm({ name: "", sku: "", category: "", buy_price: "", sell_price: "", stock: 0 });
      load();
    } catch (err) {
      console.error(err);
      push("Failed to add product", "error");
    }
  };

  if (loading) return <div className="info-box">Loading products...</div>;

  return (
    <div>
      <h2>Products</h2>

      <form onSubmit={handleCreate} style={{ marginBottom: 16, display:"grid", gap:8 }}>
        <div className="input-row">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
        </div>
        <div className="input-row">
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input placeholder="Buy price" type="number" value={form.buy_price} onChange={(e) => setForm({ ...form, buy_price: e.target.value })} />
          <input placeholder="Sell price" type="number" value={form.sell_price} onChange={(e) => setForm({ ...form, sell_price: e.target.value })} />
          <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
        <div>
          <button type="submit">Add Product</button>
        </div>
      </form>

      <table className="table">
        <thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Stock</th><th>Sell</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.category}</td>
              <td>{p.stock}</td>
              <td>₹{parseFloat(p.sell_price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
