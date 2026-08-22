import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import Chart from "chart.js/auto";
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

const PAGE_SIZE = 8;

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(null);

  function refreshTransactions() {
    return api
      .get("/api/transactions")
      .then((res) => setTransactions(res.data))
      .catch((err) =>
        console.error("Failed to load transactions:", err.message),
      );
  }

  useEffect(() => {
    refreshTransactions();
  }, []);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Cumulative "final balance" at the end of each calendar year
  const yearlyBalances = useMemo(() => {
    const netByYear = {};
    transactions.forEach((t) => {
      const year = new Date(t.date).getFullYear();
      const amount = Number(t.amount);
      netByYear[year] =
        (netByYear[year] || 0) + (t.type === "income" ? amount : -amount);
    });

    const years = Object.keys(netByYear)
      .map(Number)
      .sort((a, b) => a - b);

    let running = 0;
    const cumulative = {};
    years.forEach((y) => {
      running += netByYear[y];
      cumulative[y] = running;
    });

    // Most recent year first, matching the reference chart
    return years
      .slice()
      .reverse()
      .slice(0, 6)
      .map((y) => ({ year: y, balance: cumulative[y] }));
  }, [transactions]);

  // All years that actually have transactions, newest first
  const availableYears = useMemo(() => {
    const years = new Set(
      transactions.map((t) => new Date(t.date).getFullYear()),
    );
    return [...years].sort((a, b) => b - a);
  }, [transactions]);

  // Default to the most recent year once data loads
  useEffect(() => {
    if (selectedYear === null && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // Income / expense / balance for just the selected year (not cumulative)
  const selectedYearTotals = useMemo(() => {
    if (selectedYear === null) return { income: 0, expense: 0, balance: 0 };
    const yearTxns = transactions.filter(
      (t) => new Date(t.date).getFullYear() === selectedYear,
    );
    const income = yearTxns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = yearTxns
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [transactions, selectedYear]);

  useEffect(() => {
    if (!chartRef.current || yearlyBalances.length === 0) return;

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: yearlyBalances.map((y) => y.year),
        datasets: [
          {
            data: yearlyBalances.map((y) => y.balance),
            backgroundColor: "#1c3f36",
            borderRadius: 8,
            maxBarThickness: 70,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => `₹${val.toLocaleString("en-IN")}`,
              font: { family: "Inter, sans-serif", size: 11 },
              color: "rgba(17,18,13,0.5)",
            },
            grid: { color: "rgba(17,18,13,0.08)" },
          },
          x: {
            ticks: {
              font: { family: "Inter, sans-serif", size: 12 },
              color: "rgba(17,18,13,0.7)",
            },
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [yearlyBalances]);

  const filtered = useMemo(() => {
    let list = transactions;
    if (filter !== "all") list = list.filter((t) => t.type === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q) ||
          t._id.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [transactions, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.del(`/api/transactions/${id}`);
      await refreshTransactions();
    } catch (err) {
      console.error("Failed to delete transaction:", err.message);
    }
  }

  return (
    <>
      <div className="admin-head-row">
        <div className="admin-page-head">
          <span className="eyebrow">Finance</span>
          <h1>Reports</h1>
          <p>Income and expenses across the club, all in one place.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/add-transaction">
          <i className="bi bi-plus-circle-fill"></i> Add transaction
        </Link>
      </div>

      <div className="dash-panel yearly-chart-panel">
        <h2 className="yearly-chart-title">Yearly Final Balance</h2>
        {yearlyBalances.length === 0 ? (
          <p className="txn-empty">Add transactions to see this chart.</p>
        ) : (
          <div className="yearly-chart-wrap">
            <canvas ref={chartRef}></canvas>
          </div>
        )}
      </div>

      {/* ============================= YEAR LOOKUP ============================= */}
      <div className="admin-panel year-lookup-panel">
        <div className="admin-panel-head">
          <h2>Look up a year</h2>
          <select
            className="year-lookup-select"
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            disabled={availableYears.length === 0}
          >
            {availableYears.length === 0 ? (
              <option value="">No data yet</option>
            ) : (
              availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))
            )}
          </select>
        </div>

        {availableYears.length === 0 ? (
          <p className="txn-empty">Add transactions to look up a year.</p>
        ) : (
          <div className="totals-bar">
            <div className="totals-card is-income">
              <span className="totals-label">Income in {selectedYear}</span>
              <span className="totals-num">
                {formatINR(selectedYearTotals.income)}
              </span>
            </div>
            <div className="totals-card is-expense">
              <span className="totals-label">Expense in {selectedYear}</span>
              <span className="totals-num">
                {formatINR(selectedYearTotals.expense)}
              </span>
            </div>
            <div className="totals-card is-balance">
              <span className="totals-label">Net balance</span>
              <span className="totals-num">
                {formatINR(selectedYearTotals.balance)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <div className="filter-pills">
            <button
              className={`filter-pill${filter === "all" ? " is-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-pill${filter === "income" ? " is-active" : ""}`}
              onClick={() => setFilter("income")}
            >
              Income
            </button>
            <button
              className={`filter-pill${filter === "expense" ? " is-active" : ""}`}
              onClick={() => setFilter("expense")}
            >
              Expense
            </button>
          </div>

          <div className="txn-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search category, description, or ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="txn-empty">No transactions match this view.</p>
        ) : (
          <div className="txn-table-wrap">
            <table className="txn-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span className={`type-badge is-${t.type}`}>
                        <i
                          className={`bi ${t.type === "income" ? "bi-arrow-down-circle-fill" : "bi-arrow-up-circle-fill"}`}
                        ></i>
                        {t.type === "income" ? "Income" : "Expense"}
                      </span>
                      <div className="txn-id" style={{ marginTop: 6 }}>
                        {t._id}
                      </div>
                      {t.description && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: "0.86rem",
                            color: "rgba(17,18,13,0.6)",
                          }}
                        >
                          {t.description}
                        </div>
                      )}
                    </td>
                    <td>{t.category}</td>
                    <td>{formatDate(t.date)}</td>
                    <td className={`amount-cell is-${t.type}`}>
                      {t.type === "income" ? "+" : "−"}
                      {formatINR(t.amount)}
                    </td>
                    <td className="row-actions">
                      <div className="action-buttons">
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => handleDelete(t._id)}
                          aria-label={`Delete transaction ${t._id}`}
                          title="Delete transaction"
                        >
                          <i className="bi bi-trash3-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="icon-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="icon-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
