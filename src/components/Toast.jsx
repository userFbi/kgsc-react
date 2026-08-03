export default function Toast({ open, type, title, message }) {
  return (
    <div
      className={`toast${open ? " is-open" : ""}${type === "error" ? " is-error" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast-title">{title}</div>
      <div className="toast-msg">{message}</div>
    </div>
  );
}
