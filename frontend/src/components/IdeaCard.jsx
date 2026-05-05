export default function IdeaCard({ idea, onUpvote }) {
  const date = new Date(idea.created_at + "Z").toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        {idea.category && <span style={styles.badge}>{idea.category}</span>}
        <span style={styles.date}>{date}</span>
      </div>

      <h3 style={styles.title}>{idea.title}</h3>
      <p style={styles.desc}>{idea.description}</p>

      <div style={styles.footer}>
        <span style={styles.author}>
          {idea.student_name ? `— ${idea.student_name}` : "— Anonymous"}
        </span>
        <button style={styles.upvote} onClick={() => onUpvote(idea.id)} title="Upvote">
          ▲ {idea.votes}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "box-shadow 0.15s",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    background: "#E8EEF7",
    color: "#1A3A6B",
    borderRadius: "20px",
    padding: "2px 10px",
    fontSize: "12px",
    fontWeight: 600,
  },
  date: {
    fontSize: "12px",
    color: "#6B6B6B",
  },
  title: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#2C2C2C",
    lineHeight: 1.3,
  },
  desc: {
    fontSize: "14px",
    color: "#4A4A4A",
    lineHeight: 1.6,
    flex: 1,
    display: "-webkit-box",
    WebkitLineClamp: 4,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "4px",
  },
  author: {
    fontSize: "13px",
    color: "#6B6B6B",
    fontStyle: "italic",
  },
  upvote: {
    background: "#FBF5E4",
    color: "#8A6E1A",
    border: "1px solid #C9A227",
    borderRadius: "8px",
    padding: "4px 12px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
  },
};
