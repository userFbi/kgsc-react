import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadMembers, updateMemberRecord } from "../data/membersStore.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Manager.css";
import "./Insurance.css";

const RELATIONS = [
  "Spouse",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Sibling",
  "Other",
];

export default function InsuranceMembers() {
  const [members, setMembers] = useState(() => loadMembers());

  // search box used to find & add a member to insurance
  const [addQuery, setAddQuery] = useState("");
  const [addTarget, setAddTarget] = useState(null); // member being added
  const [nomineeForm, setNomineeForm] = useState({
    name: "",
    relation: "",
    phone: "",
  });
  const [nomineeErrors, setNomineeErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // search box used to filter the insured members table
  const [listQuery, setListQuery] = useState("");

  // ------- add-to-insurance search results (only non-insured members) -------
  const addResults = useMemo(() => {
    const q = addQuery.trim().toLowerCase();
    if (!q) return [];
    return members
      .filter((m) => !m.insurance)
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.id.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [members, addQuery]);

  // ------- insured members table -------
  const insuredMembers = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    const insured = members.filter((m) => m.insurance);
    if (!q) return insured;
    return insured.filter(
      (m) => m.name.toLowerCase().includes(q) || m.phone.includes(q),
    );
  }, [members, listQuery]);

  function openAddForm(member) {
    setAddTarget(member);
    setNomineeForm({ name: "", relation: "", phone: "" });
    setNomineeErrors({});
    setAddQuery("");
  }

  function closeAddForm() {
    setAddTarget(null);
    setNomineeForm({ name: "", relation: "", phone: "" });
    setNomineeErrors({});
  }

  function updateNomineeField(field, value) {
    setNomineeForm((f) => ({ ...f, [field]: value }));
  }

  function validateNominee() {
    const next = {};
    if (!nomineeForm.name.trim()) next.name = "Enter the nominee's name.";
    if (!nomineeForm.relation) next.relation = "Select a relation.";
    if (!/^[0-9]{10}$/.test(nomineeForm.phone.trim()))
      next.phone = "Enter a valid 10-digit number.";
    setNomineeErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    if (!validateNominee()) return;

    setSaving(true);
    const updated = updateMemberRecord(addTarget.id, {
      insurance: true,
      nominee: {
        name: nomineeForm.name.trim(),
        relation: nomineeForm.relation,
        phone: nomineeForm.phone.trim(),
      },
    });
    setMembers(updated);
    setSaving(false);
    closeAddForm();
  }

  function handleExportPdf() {
    if (insuredMembers.length === 0) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const dateLabel = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Kamlaba Garden Sport Club (KGSC)", 40, 40);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Insured Members List", 40, 60);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      `Generated on ${dateLabel}  ·  Total insured: ${insuredMembers.length}`,
      40,
      76,
    );
    doc.setTextColor(0);

    // Table
    autoTable(doc, {
      startY: 92,
      head: [
        ["Sr No.", "Member Name", "Phone Number", "Nominee Name", "Relation"],
      ],
      body: insuredMembers.map((m, index) => [
        index + 1,
        m.name,
        m.phone,
        m.nominee?.name || "—",
        m.nominee?.relation || "—",
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 8,
        lineColor: [225, 220, 205],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [45, 74, 47], // forest green, matches KGSC theme
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 247, 238], // cream tint
      },
      columnStyles: {
        0: { cellWidth: 45, halign: "center" },
      },
      margin: { left: 40, right: 40 },
    });

    const dateStamp = new Date().toISOString().slice(0, 10);
    doc.save(`KGSC-Insured-Members-${dateStamp}.pdf`);
  }

  function handleRemove(member) {
    if (!window.confirm(`Remove insurance for ${member.name}?`)) return;
    const updated = updateMemberRecord(member.id, {
      insurance: false,
      nominee: null,
    });
    setMembers(updated);
  }

  return (
    <>
      <div className="manager-head-row">
        <div className="manager-page-head">
          <span className="eyebrow">Insurance</span>
          <h1>Insured members</h1>
          <p>
            {insuredMembers.length} of {members.length} members are covered.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleExportPdf}
          disabled={insuredMembers.length === 0}
        >
          <i className="bi bi-filetype-pdf"></i> Export PDF
        </button>
      </div>

      {/* ============ ADD TO INSURANCE ============ */}
      <div className="manager-panel ins-add-panel">
        <h2 className="ins-panel-title">
          <i className="bi bi-shield-plus"></i> Add a member to insurance
        </h2>
        <div className="member-search ins-add-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search a member by name, phone, or ID"
            value={addQuery}
            onChange={(e) => setAddQuery(e.target.value)}
          />
        </div>

        {addQuery.trim() && (
          <div className="ins-search-results">
            {addResults.length === 0 ? (
              <p className="member-empty">
                No uninsured members match that search.
              </p>
            ) : (
              addResults.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="ins-result-row"
                  onClick={() => openAddForm(m)}
                >
                  <span>
                    <span className="member-name">{m.name}</span>
                    <span className="member-id"> · {m.phone}</span>
                  </span>
                  <span className="ins-add-pill">
                    <i className="bi bi-plus-lg"></i> Add
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ============ INSURED MEMBERS TABLE ============ */}
      <div className="manager-panel">
        <div className="manager-panel-head">
          <div className="member-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search insured members"
              value={listQuery}
              onChange={(e) => setListQuery(e.target.value)}
            />
          </div>
        </div>

        {insuredMembers.length === 0 ? (
          <p className="member-empty">
            {members.filter((m) => m.insurance).length === 0
              ? "No members are insured yet — add one above."
              : "No insured members match your search."}
          </p>
        ) : (
          <div className="member-table-wrap">
            <table className="member-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Phone</th>
                  <th>Nominee</th>
                  <th>Relation</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {insuredMembers.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="member-name">{m.name}</div>
                      <div className="member-id">{m.id}</div>
                    </td>
                    <td>{m.phone}</td>
                    <td>{m.nominee?.name || "—"}</td>
                    <td>{m.nominee?.relation || "—"}</td>
                    <td className="row-actions">
                      <div className="row-actions-inner">
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => handleRemove(m)}
                          aria-label={`Remove insurance for ${m.name}`}
                          title="Remove from insurance"
                        >
                          <i className="bi bi-shield-x"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================= NOMINEE FORM MODAL ============================= */}
      <div
        className={`mgr-modal-overlay${addTarget ? " is-open" : ""}`}
        onClick={closeAddForm}
      ></div>
      <div
        className={`mgr-modal${addTarget ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mgr-modal-box">
          <button
            className="mgr-modal-close"
            onClick={closeAddForm}
            aria-label="Close"
          >
            &times;
          </button>
          {addTarget && (
            <>
              <h2 className="mgr-modal-title">Add nominee</h2>
              <p className="mgr-modal-sub">
                Insuring {addTarget.name} · {addTarget.id}
              </p>

              <form
                className="manager-form"
                onSubmit={handleAddSubmit}
                noValidate
              >
                <div className="field">
                  <label htmlFor="nomName">Nominee name</label>
                  <input
                    id="nomName"
                    type="text"
                    value={nomineeForm.name}
                    onChange={(e) => updateNomineeField("name", e.target.value)}
                    required
                  />
                  <span className="field-error">{nomineeErrors.name}</span>
                </div>

                <div className="manager-form-row">
                  <div className="field">
                    <label htmlFor="nomRelation">Relation</label>
                    <select
                      id="nomRelation"
                      value={nomineeForm.relation}
                      onChange={(e) =>
                        updateNomineeField("relation", e.target.value)
                      }
                      required
                    >
                      <option value="">Select relation</option>
                      {RELATIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <span className="field-error">
                      {nomineeErrors.relation}
                    </span>
                  </div>
                  <div className="field">
                    <label htmlFor="nomPhone">Nominee phone</label>
                    <input
                      id="nomPhone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={nomineeForm.phone}
                      onChange={(e) =>
                        updateNomineeField("phone", e.target.value)
                      }
                      required
                    />
                    <span className="field-error">{nomineeErrors.phone}</span>
                  </div>
                </div>

                <div className="mgr-modal-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Add to insurance"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeAddForm}
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
