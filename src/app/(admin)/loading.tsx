export default function Loading() {
  return (
    <div className="main">
      <div className="page-head"><h1 style={{ opacity: 0.5 }}>กำลังโหลด…</h1></div>
      <div className="grid grid-3">
        <div className="card" style={{ height: 86, opacity: 0.4 }} />
        <div className="card" style={{ height: 86, opacity: 0.4 }} />
        <div className="card" style={{ height: 86, opacity: 0.4 }} />
      </div>
      <div className="stack" style={{ marginTop: 18 }}>
        <div className="card" style={{ height: 64, opacity: 0.3 }} />
        <div className="card" style={{ height: 64, opacity: 0.3 }} />
      </div>
    </div>
  );
}
