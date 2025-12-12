import { useEffect, useState } from "react";
import api from "../api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [summaryRes, monthlyRes, topRes] = await Promise.all([
          api.get("/analytics/sales-summary/"),
          api.get("/analytics/monthly-sales/"),
          api.get("/analytics/top-products/?limit=5"),
        ]);
        setSummary(summaryRes.data);
        setMonthlySales(monthlyRes.data);
        setTopProducts(topRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="info-box">Loading dashboard...</div>;
  if (error) return <div className="error-box">{error}</div>;
  if (!summary) return null;

  const cards = [
    { label: "Today's Sales", value: summary.today_sales },
    { label: "This Month's Sales", value: summary.month_sales },
    { label: "Total Revenue", value: summary.total_revenue },
    { label: "Total Expense", value: summary.total_expense },
    { label: "Total Profit", value: summary.total_profit },
    { label: "Total Orders", value: summary.total_orders },
    { label: "Total Customers", value: summary.total_customers },
  ];

  return (
    <div>
      <div className="cards-container">
        {cards.map(c => (
          <div className="card" key={c.label}>
            <div className="card-label">{c.label}</div>
            <div className="card-value">
              {typeof c.value === "number" ? (c.label.includes("Orders") || c.label.includes("Customers") ? c.value : `₹ ${c.value.toFixed(2)}`) : c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h2>Monthly Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total_sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Top Products</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_quantity" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
