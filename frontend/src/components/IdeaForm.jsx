import { useState } from "react";

const EMPTY = { title: "", description: "", student_name: "", category: "", contact_email: "" };

export default function IdeaForm({ onSubmitted, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      e.contact_email = "Invalid email address";
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit");
      const idea = await res.json();
      onSubmitted(idea);
      setForm(EMPTY);
    } catch {
      setErrors({ _global: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  function field(name, label, required, extra = {}) {
    const El = extra.multiline ? "textarea" : "input";
    return (
      <div style={styles.field}>
        <label style={styles.label}>
          {label}{required && <span style={styles.req}> *</span>}
        </label>
        <El
          style={{ ...styles.input, ...(extra.multiline ? styles.textarea : {}), ...(errors[name] ? styles.inputErr : {}) }}
          value={form[name]}
          onChange={(e) => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: undefined }); }}
          placeholder={extra.placeholder || ""}
          rows={extra.multiline ? 4 : undefined}
          type={extra.type || "text"}
        />
        {errors[name] && <span style={styles.errMsg}>{errors[name]}</span>}
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Submit an Idea</h2>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        {errors._global && <div style={styles.globalErr}>{errors._global}</div>}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {field("title", "Title", true, { placeholder: "Give your idea a catchy title" })}
          {field("description", "Description", true, { multiline: true, placeholder: "Describe your idea in detail…" })}
          {field("student_name", "Your name", false, { placeholder: "Optional — shown on the card" })}
          {field("category", "Category", false, { placeholder: "e.g. Technology, Community, Education" })}
          {field("contact_email", "Contact email", false, { type: "email", placeholder: "Optional — for follow-up" })}

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.submitBtn} disabled={saving}>
              {saving ? "Submitting…" : "Submit Idea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100, padding: "16px",
  },
  panel: {
    background: "#fff",
    borderRadius: "16px",
    width: "100%", maxWidth: "520px",
    maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 24px 0",
  },
  heading: { fontSize: "20px", fontWeight: 700 },
  close: { fontSize: "18px", color: "#6B6B6B", padding: "4px 8px" },
  form: { padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#2C2C2C" },
  req: { color: "#C8102E" },
  input: {
    padding: "9px 12px", border: "1px solid #D1D1D1", borderRadius: "8px",
    fontSize: "14px", outline: "none", transition: "border-color 0.15s",
  },
  textarea: { resize: "vertical", minHeight: "100px" },
  inputErr: { borderColor: "#C8102E" },
  errMsg: { fontSize: "12px", color: "#C8102E" },
  globalErr: {
    margin: "0 24px", padding: "10px 14px",
    background: "#FFF0F2", color: "#8B0000",
    borderRadius: "8px", fontSize: "13px",
  },
  actions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" },
  cancelBtn: {
    padding: "9px 18px", borderRadius: "8px", fontSize: "14px",
    border: "1px solid #D1D1D1", color: "#2C2C2C",
  },
  submitBtn: {
    padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
    fontWeight: 600, background: "#C8102E", color: "#fff",
  },
};
