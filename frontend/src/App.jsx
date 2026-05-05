import { useState, useEffect, useCallback } from "react";
import Toolbar from "./components/Toolbar.jsx";
import IdeaCard from "./components/IdeaCard.jsx";
import IdeaForm from "./components/IdeaForm.jsx";

export default function App() {
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchIdeas = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("sort", sort);
    const res = await fetch(`/api/ideas?${params}`);
    if (res.ok) setIdeas(await res.json());
  }, [search, category, sort]);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    if (res.ok) setCategories(await res.json());
  };

  useEffect(() => {
    setLoading(true);
    fetchIdeas().finally(() => setLoading(false));
  }, [fetchIdeas]);

  useEffect(() => { fetchCategories(); }, []);

  async function handleUpvote(id) {
    const res = await fetch(`/api/ideas/${id}/upvote`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      setIdeas((prev) => prev.map((idea) => (idea.id === updated.id ? updated : idea)));
    }
  }

  function handleSubmitted(newIdea) {
    setShowForm(false);
    setIdeas((prev) => [newIdea, ...prev]);
    fetchCategories();
  }

  async function handleExport() {
    const res = await fetch("/api/ideas/export");
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ideas.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoGroup}>
            <img src="/ukm_logo.png" alt="UKM Qatar" style={styles.logoImg} />
            <h1 style={styles.logo}>💡 Student Ideas</h1>
          </div>
          <span style={styles.count}>{ideas.length} idea{ideas.length !== 1 ? "s" : ""}</span>
        </div>
      </header>

      <Toolbar
        search={search} setSearch={setSearch}
        category={category} setCategory={setCategory}
        sort={sort} setSort={setSort}
        categories={categories}
        onNew={() => setShowForm(true)}
        onExport={handleExport}
      />

      <main style={styles.main}>
        {loading ? (
          <p style={styles.empty}>Loading…</p>
        ) : ideas.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "48px", marginBottom: "12px" }}>🌱</p>
            <p style={{ fontWeight: 600, fontSize: "16px" }}>No ideas yet</p>
            <p style={{ color: "#6B6B6B", marginTop: "6px" }}>Be the first to submit one!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onUpvote={handleUpvote} />
            ))}
          </div>
        )}
      </main>

      {showForm && <IdeaForm onSubmitted={handleSubmitted} onClose={() => setShowForm(false)} />}
    </div>
  );
}

const styles = {
  app: { minHeight: "100vh", display: "flex", flexDirection: "column" },
  header: { background: "#C8102E", color: "#fff" },
  headerInner: {
    maxWidth: "1200px", margin: "0 auto",
    padding: "18px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  logoGroup: { display: "flex", alignItems: "center", gap: "12px" },
  logoImg: { height: "44px", width: "auto" },
  logo: { fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" },
  count: { fontSize: "13px", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "20px" },
  main: { flex: 1, maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "28px 24px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  empty: {
    textAlign: "center", padding: "80px 20px", color: "#6B6B6B",
  },
};
