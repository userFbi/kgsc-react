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

function formatEventDate(iso) {
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

export default function AdminMessages() {
  const [mode, setMode] = useState("message"); // "message" | "event"

  // Messages state
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Events state
  const [events, setEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventError, setEventError] = useState("");
  const [eventSending, setEventSending] = useState(false);

  function refreshMessages() {
    return api
      .get("/api/messages")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Failed to load messages:", err.message));
  }

  function refreshEvents() {
    return api
      .get("/api/events")
      .then((res) => setEvents(res.data?.data || res.data || []))
      .catch((err) => console.error("Failed to load events:", err.message));
  }

  useEffect(() => {
    refreshMessages();
    refreshEvents();
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

  async function handleCreateEvent(e) {
    e.preventDefault();
    setEventError("");

    if (!eventTitle.trim() || !eventDate) {
      setEventError("Title and date are required.");
      return;
    }

    setEventSending(true);
    try {
      await api.post("/api/events", {
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        date: eventDate,
        location: eventLocation.trim(),
      });
      await refreshEvents();
      setEventTitle("");
      setEventDescription("");
      setEventDate("");
      setEventLocation("");
    } catch (err) {
      setEventError(err.message);
    } finally {
      setEventSending(false);
    }
  }

  async function handleDeleteEvent(id) {
    try {
      await api.del(`/api/events/${id}`);
      await refreshEvents();
    } catch (err) {
      console.error("Failed to delete event:", err.message);
    }
  }

  return (
    <>
      <div className="admin-page-head">
        <span className="eyebrow">Admin portal</span>
        <h1>Club messages &amp; events</h1>
        <p>
          Post an announcement or add an upcoming event — both show up on member
          dashboards.
        </p>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>
            <i
              className={`bi ${mode === "message" ? "bi-megaphone-fill" : "bi-calendar-event-fill"}`}
            ></i>{" "}
            {mode === "message" ? "New message" : "New event"}
          </h2>
<br />
          <div className="msg-mode-tabs">
            <button
              type="button"
              className={`msg-mode-tab${mode === "message" ? " is-active" : ""}`}
              onClick={() => setMode("message")}
            >
              <i className="bi bi-megaphone-fill"></i>
              Message
            </button>
            <button
              type="button"
              className={`msg-mode-tab${mode === "event" ? " is-active" : ""}`}
              onClick={() => setMode("event")}
            >
              <i className="bi bi-calendar-event-fill"></i>
              Event
            </button>
          </div>
        </div>

        {mode === "message" ? (
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
        ) : (
          <form className="admin-form" onSubmit={handleCreateEvent}>
            <div className="field">
              <label htmlFor="evTitle">Event title</label>
              <input
                id="evTitle"
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Annual sports meet"
                required
              />
            </div>

            <div className="admin-form-row">
              <div className="field">
                <label htmlFor="evDate">Date</label>
                <input
                  id="evDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="evLocation">Location (optional)</label>
                <input
                  id="evLocation"
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Club grounds"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="evDescription">Description (optional)</label>
              <textarea
                id="evDescription"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Any extra detail about the event..."
                rows={3}
              />
              {eventError && <div className="field-error">{eventError}</div>}
            </div>

            <div className="admin-form-actions">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={eventSending}
              >
                <i className="bi bi-calendar-plus-fill"></i>{" "}
                {eventSending ? "Adding…" : "Add event"}
              </button>
            </div>
          </form>
        )}
      </div>

      {mode === "message" ? (
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
      ) : (
        <div className="admin-panel" style={{ marginTop: 24 }}>
          <div className="admin-panel-head">
            <h2>
              <i className="bi bi-clock-history"></i> Upcoming events
            </h2>
          </div>

          {events.length === 0 ? (
            <p className="txn-empty">No events added yet.</p>
          ) : (
            <div className="msg-feed">
              {events.map((ev) => (
                <div key={ev._id} className="msg-card">
                  <div className="msg-card-top">
                    <div className="msg-card-title">{ev.title}</div>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => handleDeleteEvent(ev._id)}
                      title="Delete event"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                  {ev.description && (
                    <p className="msg-card-body">{ev.description}</p>
                  )}
                  <div className="msg-card-meta">
                    <i className="bi bi-calendar3"></i>{" "}
                    {formatEventDate(ev.date)}
                    {ev.location && (
                      <>
                        {" "}
                        · <i className="bi bi-geo-alt"></i> {ev.location}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
