import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import "./Admin.css";
import "./AdminMessages.css";

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  function refreshMessages() {
    return api
      .get("/api/messages")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Failed to load messages:", err.message));
  }

  useEffect(() => {
    refreshMessages();
  }, []);

  async function handleSend(e) {
    e.preventDefault();
    setError("");

    if (!body.trim()) {
      setError("Message can't be empty.");
      return;
    }

    setSending(true);
    try {
      await api.post("/api/messages", { title, message: body });
      await refreshMessages();
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.del(`/api/messages/${id}`);
      await refreshMessages();
    } catch (err) {
      console.error("Failed to delete message:", err.message);
    }
  }

  return (
    <>
      <div className="admin-page-head">
        <span className="eyebrow">Admin portal</span>
        <h1>Club messages</h1>
        <p>Post an announcement — it'll show up on every member's dashboard.</p>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>
            <i className="bi bi-megaphone-fill"></i> New message
          </h2>
        </div>

        <form className="admin-form" onSubmit={handleSend}>
          <div className="field">
            <label htmlFor="msgTitle">Title (optional)</label>
            <input
              id="msgTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ganesh Chaturthi collection reminder"
            />
          </div>

          <div className="field">
            <label htmlFor="msgBody">Message</label>
            <textarea
              id="msgBody"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write what you want members to see..."
              rows={4}
            />
            {error && <div className="field-error">{error}</div>}
          </div>

          <div className="admin-form-actions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={sending}
            >
              <i className="bi bi-send-fill"></i>{" "}
              {sending ? "Posting…" : "Post to dashboard"}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-panel" style={{ marginTop: 24 }}>
        <div className="admin-panel-head">
          <h2>
            <i className="bi bi-clock-history"></i> Sent messages
          </h2>
        </div>

        {messages.length === 0 ? (
          <p className="txn-empty">No messages posted yet.</p>
        ) : (
          <div className="msg-feed">
            {messages.map((m) => (
              <div key={m._id} className="msg-card">
                <div className="msg-card-top">
                  {m.title && <div className="msg-card-title">{m.title}</div>}
                  <button
                    className="icon-btn icon-btn-danger"
                    onClick={() => handleDelete(m._id)}
                    title="Delete message"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
                <p className="msg-card-body">{m.message}</p>
                <div className="msg-card-meta">
                  <i className="bi bi-person-fill"></i> {m.senderName} ·{" "}
                  {formatDateTime(m.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
