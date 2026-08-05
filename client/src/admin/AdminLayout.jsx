import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: "bi-grid-1x2-fill", end: true },
  { to: "/admin/reports", label: "Reports", icon: "bi-bar-chart-fill" },
  { to: "/admin/add-transaction", label: "Add Transaction", icon: "bi-cash-coin" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    setSidebarOpen(false);
    // TODO: clear real auth/session state once a backend is wired up.
    navigate("/login");
  }

  return (
    <div className="admin-shell">
      <button
        className="admin-topbar-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <i className="bi bi-list"></i>
      </button>

      <div
        className={`admin-overlay${sidebarOpen ? " is-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside className={`admin-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="admin-brand">
          <span className="admin-brand-mark">KGSC</span>
          <span className="admin-brand-sub">Admin portal</span>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-nav-item${isActive ? " is-active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="admin-nav-item admin-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
