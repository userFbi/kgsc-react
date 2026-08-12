import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteMemberRecord,
  loadMembers,
  updateMemberRecord,
} from "../data/membersStore.js";
import "./Manager.css";

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];
const PAGE_SIZE = 8;

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

function maskAadhar(aadhar) {
  if (!aadhar) return "—";
  return `XXXX XXXX ${aadhar.slice(-4)}`;
}

export default function ViewMembers() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [viewingMember, setViewingMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setMembers(loadMembers());
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") closeModals();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q),
    );
  }, [members, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function handleDelete(id) {
    if (!window.confirm("Remove this member from the club roster?")) return;
    setMembers(deleteMemberRecord(id));
  }

  function openView(member) {
    setViewingMember(member);
  }

  function openEdit(member) {
    setEditingMember(member);
    setEditForm({
      name: member.name,
      phone: member.phone,
      aadhar: member.aadhar || "",
      address: member.address,
      tshirtSize: member.tshirtSize || "",
      shortsSize: member.shortsSize || "",
    });
    setEditErrors({});
  }

  function closeModals() {
    setViewingMember(null);
    setEditingMember(null);
    setEditForm(null);
  }

  function updateEditField(field, value) {
    setEditForm((f) => ({ ...f, [field]: value }));
  }

  function validateEdit() {
    const next = {};
    if (!editForm.name.trim())
      next.name = "Please enter the member's full name.";
    if (!/^[0-9]{10}$/.test(editForm.phone.trim()))
      next.phone = "Enter a valid 10-digit number.";
    if (!/^[0-9]{12}$/.test(editForm.aadhar.trim()))
      next.aadhar = "Enter a valid 12-digit Aadhar number.";
    if (!editForm.address.trim())
      next.address = "Please enter the member's address.";
    if (!editForm.tshirtSize) next.tshirtSize = "Select a T-shirt size.";
    if (!editForm.shortsSize) next.shortsSize = "Select a shorts size.";
    setEditErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    if (!validateEdit()) return;

    setSaving(true);
    const updated = updateMemberRecord(editingMember.id, {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      aadhar: editForm.aadhar.trim(),
      address: editForm.address.trim(),
      tshirtSize: editForm.tshirtSize,
      shortsSize: editForm.shortsSize,
    });
    setMembers(updated);
    setSaving(false);
    closeModals();
  }

  return (
    <>
      <div className="manager-head-row">
        <div className="manager-page-head">
          <span className="eyebrow">Membership</span>
          <h1>View members</h1>
          <p>{members.length} members on the KGSC roster.</p>
        </div>
        <Link className="btn btn-primary" to="/manager/add-member">
          <i className="bi bi-person-plus-fill"></i> Add member
        </Link>
      </div>

      <div className="manager-panel">
        <div className="manager-panel-head">
          <div className="member-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search by name, phone, or ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="member-empty">
            {members.length === 0
              ? "No members yet — add your first one."
              : "No members match your search."}
          </p>
        ) : (
          <>
            <div className="member-table-wrap">
              <table className="member-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Phone</th>
                    <th>Insurance</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="member-name">{m.name}</div>
                        <div className="member-id">{m.id}</div>
                      </td>
                      <td>{m.phone}</td>
                      <td className="insurance-cell">
                        {m.insurance ? (
                          <i
                            className="bi bi-check-circle-fill insurance-yes"
                            aria-label="Insured"
                            title="Insured"
                          ></i>
                        ) : (
                          <i
                            className="bi bi-x-circle-fill insurance-no"
                            aria-label="Not insured"
                            title="Not insured"
                          ></i>
                        )}
                      </td>
                      <td className="row-actions">
                        <div className="row-actions-inner">
                          <button
                            className="icon-btn"
                            onClick={() => openView(m)}
                            aria-label={`View ${m.name}`}
                            title="View details"
                          >
                            <i className="bi bi-eye-fill"></i>
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => openEdit(m)}
                            aria-label={`Edit ${m.name}`}
                            title="Edit member"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button
                            className="icon-btn icon-btn-danger"
                            onClick={() => handleDelete(m.id)}
                            aria-label={`Remove ${m.name}`}
                            title="Remove member"
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
          </>
        )}
      </div>

      {/* ============================= VIEW MODAL ============================= */}
      <div
        className={`mgr-modal-overlay${viewingMember ? " is-open" : ""}`}
        onClick={closeModals}
      ></div>
      <div
        className={`mgr-modal${viewingMember ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mgr-modal-box">
          <button
            className="mgr-modal-close"
            onClick={closeModals}
            aria-label="Close"
          >
            &times;
          </button>
          {viewingMember && (
            <>
              <h2 className="mgr-modal-title">{viewingMember.name}</h2>
              <p className="mgr-modal-sub">{viewingMember.id}</p>

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{viewingMember.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Aadhar number</span>
                  <span className="detail-value">
                    {viewingMember.aadhar || "—"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">T-shirt size</span>
                  <span className="detail-value">
                    {viewingMember.tshirtSize || "—"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Shorts size</span>
                  <span className="detail-value">
                    {viewingMember.shortsSize || "—"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Joined</span>
                  <span className="detail-value">
                    {formatDate(viewingMember.joined)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Insurance</span>
                  <span className="detail-value">
                    {viewingMember.insurance ? "Insured" : "Not insured"}
                  </span>
                </div>
                <div className="detail-item detail-full">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{viewingMember.address}</span>
                </div>
              </div>

              <div className="mgr-modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const m = viewingMember;
                    closeModals();
                    openEdit(m);
                  }}
                >
                  <i className="bi bi-pencil-fill"></i> Edit member
                </button>
                <button className="btn btn-outline" onClick={closeModals}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============================= EDIT MODAL ============================= */}
      <div
        className={`mgr-modal-overlay${editingMember ? " is-open" : ""}`}
        onClick={closeModals}
      ></div>
      <div
        className={`mgr-modal${editingMember ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mgr-modal-box">
          <button
            className="mgr-modal-close"
            onClick={closeModals}
            aria-label="Close"
          >
            &times;
          </button>
          {editingMember && editForm && (
            <>
              <h2 className="mgr-modal-title">Edit member</h2>
              <p className="mgr-modal-sub">{editingMember.id}</p>

              <form
                className="manager-form"
                onSubmit={handleEditSubmit}
                noValidate
              >
                <div className="field">
                  <label htmlFor="eName">Full name</label>
                  <input
                    id="eName"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => updateEditField("name", e.target.value)}
                    required
                  />
                  <span className="field-error">{editErrors.name}</span>
                </div>

                <div className="manager-form-row">
                  <div className="field">
                    <label htmlFor="ePhone">Phone number</label>
                    <input
                      id="ePhone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={editForm.phone}
                      onChange={(e) => updateEditField("phone", e.target.value)}
                      required
                    />
                    <span className="field-error">{editErrors.phone}</span>
                  </div>
                  <div className="field">
                    <label htmlFor="eAadhar">Aadhar card number</label>
                    <input
                      id="eAadhar"
                      type="text"
                      inputMode="numeric"
                      maxLength={12}
                      value={editForm.aadhar}
                      onChange={(e) =>
                        updateEditField("aadhar", e.target.value)
                      }
                      required
                    />
                    <span className="field-error">{editErrors.aadhar}</span>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="eAddress">Address</label>
                  <textarea
                    id="eAddress"
                    rows={3}
                    value={editForm.address}
                    onChange={(e) => updateEditField("address", e.target.value)}
                    required
                  ></textarea>
                  <span className="field-error">{editErrors.address}</span>
                </div>

                <div className="manager-form-row">
                  <div className="field">
                    <label>T-shirt size</label>
                    <div
                      className="size-group"
                      role="radiogroup"
                      aria-label="T-shirt size"
                    >
                      {SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          role="radio"
                          aria-checked={editForm.tshirtSize === size}
                          className={`size-option${editForm.tshirtSize === size ? " is-active" : ""}`}
                          onClick={() => updateEditField("tshirtSize", size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <span className="field-error">{editErrors.tshirtSize}</span>
                  </div>
                  <div className="field">
                    <label>Shorts size</label>
                    <div
                      className="size-group"
                      role="radiogroup"
                      aria-label="Shorts size"
                    >
                      {SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          role="radio"
                          aria-checked={editForm.shortsSize === size}
                          className={`size-option${editForm.shortsSize === size ? " is-active" : ""}`}
                          onClick={() => updateEditField("shortsSize", size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <span className="field-error">{editErrors.shortsSize}</span>
                  </div>
                </div>

                <div className="mgr-modal-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeModals}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
