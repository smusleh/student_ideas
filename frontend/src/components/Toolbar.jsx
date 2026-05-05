export default function Toolbar({ search, setSearch, category, setCategory, sort, setSort, categories, onNew, onExport }) {
  return (
    <div style={styles.bar}>
      <input
        style={styles.search}
        type="search"
        placeholder="Search ideas…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <div style={styles.sortGroup}>
        <button
          style={{ ...styles.sortBtn, ...(sort === "newest" ? styles.active : {}) }}
          onClick={() => setSort("newest")}
        >
          Newest
        </button>
        <button
          style={{ ...styles.sortBtn, ...(sort === "votes" ? styles.active : {}) }}
          onClick={() => setSort("votes")}
        >
          Top Voted
        </button>
      </div>

      <button style={styles.exportBtn} onClick={onExport}>⬇ Export CSV</button>
      <button style={styles.newBtn} onClick={onNew}>+ Submit Idea</button>
    </div>
  );
}

const styles = {
  bar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
    padding: "16px 24px",
    background: "#fff",
    borderBottom: "1px solid #D1D1D1",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  search: {
    flex: "1 1 200px",
    padding: "8px 12px",
    border: "1px solid #D1D1D1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  select: {
    padding: "8px 12px",
    border: "1px solid #D1D1D1",
    borderRadius: "8px",
    fontSize: "14px",
    background: "#fff",
    cursor: "pointer",
  },
  sortGroup: {
    display: "flex",
    border: "1px solid #D1D1D1",
    borderRadius: "8px",
    overflow: "hidden",
  },
  sortBtn: {
    padding: "8px 14px",
    fontSize: "13px",
    background: "#fff",
    color: "#2C2C2C",
    transition: "background 0.15s",
  },
  active: {
    background: "#C8102E",
    color: "#fff",
  },
  exportBtn: {
    padding: "8px 14px",
    background: "#fff",
    color: "#2C2C2C",
    border: "1px solid #D1D1D1",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    marginLeft: "auto",
  },
  newBtn: {
    padding: "8px 16px",
    background: "#C8102E",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
  },
};
