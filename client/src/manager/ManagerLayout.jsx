import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./ManagerLayout.css";

const navItems = [
  { to: "/manager", label: "Dashboard", icon: "bi-grid-1x2-fill", end: true },
  { to: "/manager/insurance", label : "Insurance List", icon : "bi-shield-shaded"},
  { to: "/manager/members", label: "View Members", icon: "bi-people-fill" },
  { to: "/manager/add-member", label: "Add Member", icon: "bi-person-plus-fill" },
];

export default function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    setSidebarOpen(false);
    // TODO: clear real auth/session state once a backend is wired up.
    navigate("/login");
  }

  return (
    <div className="manager-shell">
      <button
        className="manager-topbar-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <i className="bi bi-list"></i>
      </button>

      <div
        className={`manager-overlay${sidebarOpen ? " is-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside className={`manager-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="manager-brand">
          <span className="manager-brand-mark">KGSC</span>
          <span className="manager-brand-sub">Manager portal</span>
        </div>

        <nav className="manager-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `manager-nav-item${isActive ? " is-active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="manager-nav-item manager-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </aside>

      <main className="manager-content">
        <Outlet />
      </main>
    </div>
  );
}
