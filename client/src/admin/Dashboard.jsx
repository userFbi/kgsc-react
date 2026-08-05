import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadTransactions } from "../data/transactionsStore.js";
import "./Admin.css";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatINR(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  const now = new Date();
  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { income, expense, balance: income - expense, thisMonth };
  }, [transactions]);

  const recent = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [transactions],
  );

  return (
    <>
      <div className="admin-page-head">
        <span className="eyebrow">Admin portal</span>
        <h1>Welcome back</h1>
        <p>Here's the club's financial snapshot right now.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-arrow-down-circle-fill"></i>
          </div>
          <div className="stat-num">{formatINR(totals.income)}</div>
          <div className="stat-label">Total income</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-arrow-up-circle-fill"></i>
          </div>
          <div className="stat-num">{formatINR(totals.expense)}</div>
          <div className="stat-label">Total expense</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-wallet-fill"></i>
          </div>
          <div className="stat-num">{formatINR(totals.balance)}</div>
          <div className="stat-label">Net balance</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-receipt"></i>
          </div>
          <div className="stat-num">{totals.thisMonth}</div>
          <div className="stat-label">Transactions this month</div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Recent transactions</h2>
          <Link className="btn btn-outline" to="/admin/reports">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="txn-empty">No transactions yet — add your first one.</p>
        ) : (
          <div className="txn-table-wrap">
            <table className="txn-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className={`type-badge is-${t.type}`}>
                        <i
                          className={`bi ${t.type === "income" ? "bi-arrow-down-circle-fill" : "bi-arrow-up-circle-fill"}`}
                        ></i>
                        {t.type === "income" ? "Income" : "Expense"}
                      </span>
                      <div className="txn-id" style={{ marginTop: 6 }}>
                        {t.id}
                      </div>
                    </td>
                    <td>{t.category}</td>
                    <td>{formatDate(t.date)}</td>
                    <td className={`amount-cell is-${t.type}`}>
                      {t.type === "income" ? "+" : "−"}
                      {formatINR(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <Link className="btn btn-primary" to="/admin/add-transaction">
            <i className="bi bi-plus-circle-fill"></i> Add a transaction
          </Link>
        </div>
      </div>
    </>
  );
}
