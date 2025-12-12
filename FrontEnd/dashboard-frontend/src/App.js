import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import ExpensesPage from "./pages/ExpensesPage";
import OrderCreatePage from "./pages/OrderCreatePage";
import { FiHome, FiBox, FiShoppingCart, FiFilePlus, FiDollarSign, FiLogOut } from "react-icons/fi";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(!!localStorage.getItem("access_token"));

  useEffect(() => {
    if (!authed) navigate("/login");
  }, [authed, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAuthed(false);
    navigate("/login");
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Business Dashboard</h1>
        {authed && (
          <nav className="top-nav">
            <button onClick={() => navigate("/")}><FiHome /> Dashboard</button>
            <button onClick={() => navigate("/products")}><FiBox /> Products</button>
            <button onClick={() => navigate("/orders")}><FiShoppingCart /> Orders</button>
            <button onClick={() => navigate("/orders/create")}><FiFilePlus /> Create</button>
            <button onClick={() => navigate("/expenses")}><FiDollarSign /> Expenses</button>
            <button onClick={handleLogout}><FiLogOut /> Logout</button>
          </nav>
        )}
      </header>

      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={() => setAuthed(true)} />} />
          <Route path="/" element={authed ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/products" element={authed ? <ProductsPage /> : <Navigate to="/login" />} />
          <Route path="/orders" element={authed ? <OrdersPage /> : <Navigate to="/login" />} />
          <Route path="/orders/create" element={authed ? <OrderCreatePage /> : <Navigate to="/login" />} />
          <Route path="/expenses" element={authed ? <ExpensesPage /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
