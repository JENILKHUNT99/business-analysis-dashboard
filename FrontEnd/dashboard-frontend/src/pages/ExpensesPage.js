import { useEffect, useState } from "react";
import api from "../api";

export default function ExpensesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ category: "", amount: "", date: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.get("/expenses/");
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses/", form);
      setForm({ category: "", amount: "", date: "" });
      load();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h2>Expenses</h2>
      <form onSubmit={create}>
        <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
        <input placeholder="Amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
        <input placeholder="Date (YYYY-MM-DD)" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        <button type="submit">Add</button>
      </form>

      <ul>
        {items.map(it => <li key={it.id}>{it.category} - ₹{parseFloat(it.total_amount || it.amount || 0).toFixed(2)} on {it.date || it.created_at}</li>)}
      </ul>
    </div>
  );
}
