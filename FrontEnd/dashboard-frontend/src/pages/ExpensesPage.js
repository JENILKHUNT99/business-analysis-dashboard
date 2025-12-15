import { useEffect, useState } from "react";
import api from "../api";
import { useToasts } from "../components/ToastContext";

export default function ExpensesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    date: "",
    note: ""
  });

  const { push } = useToasts();

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      const res = await api.get("/expenses/");
      setItems(res.data);
    } catch (err) {
      console.error(err);
      push("Failed to load expenses", "error");
    }
  };

  const createExpense = async (e) => {
    e.preventDefault();

    if (!form.category || !form.amount || !form.date) {
      push("Category, Amount, and Date are required", "error");
      return;
    }

    // Build payload exactly how backend expects it
    const payload = {
      category: form.category,
      amount: parseFloat(form.amount),
      date: form.date,
      note: form.note || ""
    };

    try {
      await api.post("/expenses/", payload);
      push("Expense added successfully", "success");

      // Reset form
      setForm({ category: "", amount: "", date: "", note: "" });

      // Reload list
      load();
    } catch (err) {
      console.error(err);

      const detail = err?.response?.data;

      if (detail && typeof detail === "object") {
        const firstKey = Object.keys(detail)[0];
        const first = detail[firstKey];
        const message = Array.isArray(first) ? first.join(" ") : String(first);
        push(message, "error");
      } else {
        push("Failed to add expense", "error");
      }
    }
  };

  return (
    <div>
      <h2>Expenses</h2>

      <form onSubmit={createExpense} style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        <div className="input-row">
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
          <input
            placeholder="Amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <input
            placeholder="YYYY-MM-DD"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>

        <div className="input-row">
          <input
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </div>

        <button type="submit">Add Expense</button>
      </form>

      {items.length === 0 ? (
        <div className="empty-state">No expenses recorded yet.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {items.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.category}</td>
                <td>₹{parseFloat(exp.amount).toFixed(2)}</td>
                <td>{exp.date}</td>
                <td>{exp.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
