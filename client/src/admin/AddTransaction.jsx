import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast.jsx";
import {
  CATEGORIES,
  addTransactionRecord,
  loadTransactions,
  nextTransactionId,
} from "../data/transactionsStore.js";
import "./Admin.css";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = {
  type: "income",
  amount: "",
  date: todayISO(),
  category: "",
  description: "",
};

export default function AddTransaction() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const navigate = useNavigate();

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.amount || Number(form.amount) <= 0)
      next.amount = "Enter a valid amount greater than 0.";
    if (!form.date) next.date = "Select the transaction date.";
    if (!form.category) next.category = "Choose a source / category.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function saveTransaction() {
    const transactions = loadTransactions();
    const record = {
      id: nextTransactionId(transactions),
      type: form.type,
      amount: Number(form.amount),
      date: form.date,
      category: form.category,
      description: form.description.trim(),
      createdAt: new Date().toISOString(),
    };
    addTransactionRecord(record);
    return record;
  }

  function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    saveTransaction();
    setSaving(false);
    setToastOpen(true);
    window.setTimeout(() => navigate("/admin/reports"), 900);
  }

  function handleSaveAndAddAnother(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    saveTransaction();
    setSaving(false);
    setToastOpen(true);
    setForm({ ...emptyForm, type: form.type, date: todayISO() });
  }

  function handleCancel() {
    navigate("/admin");
  }

  return (
    <>
      <div className="admin-page-head">
        <span className="eyebrow">Finance</span>
        <h1>Add transaction</h1>
        <p>Record club income or expenses. New entries appear in Reports right away.</p>
      </div>

      <div className="admin-panel">
        {/* Income / Expense toggle sits outside the form fields */}
        <div className="type-toggle" role="radiogroup" aria-label="Transaction type">
          <button
            type="button"
            role="radio"
            aria-checked={form.type === "income"}
            className={`type-toggle-btn is-income${form.type === "income" ? " is-active" : ""}`}
            onClick={() => updateField("type", "income")}
          >
            <i className="bi bi-arrow-down-circle-fill"></i> Income
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={form.type === "expense"}
            className={`type-toggle-btn is-expense${form.type === "expense" ? " is-active" : ""}`}
            onClick={() => updateField("type", "expense")}
          >
            <i className="bi bi-arrow-up-circle-fill"></i> Expense
          </button>
        </div>

        <form className="admin-form" onSubmit={handleSave} noValidate>
          <div className="admin-form-row">
            <div className="field">
              <label htmlFor="tAmount">Amount</label>
              <input
                id="tAmount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                required
              />
              <span className="field-hint">Enter the transaction amount in INR</span>
              <span className="field-error">{errors.amount}</span>
            </div>

            <div className="field">
              <label htmlFor="tDate">Date</label>
              <input
                id="tDate"
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                required
              />
              <span className="field-hint">Select the transaction date</span>
              <span className="field-error">{errors.date}</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="tCategory">Source / Category</label>
            <select
              id="tCategory"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              required
            >
              <option value="" disabled>
                Select source
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="field-hint">
              {form.type === "income"
                ? "Choose where this income came from"
                : "Choose what this expense was for"}
            </span>
            <span className="field-error">{errors.category}</span>
          </div>

          <div className="field">
            <label htmlFor="tDescription">Description</label>
            <textarea
              id="tDescription"
              rows={3}
              placeholder="Add any extra detail about this transaction"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            ></textarea>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Transaction"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleSaveAndAddAnother}
              disabled={saving}
            >
              Save &amp; Add Another
            </button>
            <button type="button" className="btn btn-text" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <Toast
        open={toastOpen}
        type="success"
        title="Kamlaba Garden Sport Club"
        message="Transaction saved."
      />
    </>
  );
}
