// BytesOS — minimal dashboard
const { useState, useEffect } = React;

const fmt = (n) => "PKR " + Math.round(n).toLocaleString();
const fmtK = (n) => n >= 1000 ? (n/1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/,"") + "k" : String(n);
const pct = (a, b) => ((a - b) / b) * 100;

// ─── Up/Down arrows ────────────────────────────────────────
const ArrowUp   = () => <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 7 L5 3 L8 7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ArrowDown = () => <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 3 L5 7 L8 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const Plus = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const X = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function Delta({ cur, prev, inverse = false }) {
  const p = pct(cur, prev);
  const up = p >= 0;
  const good = inverse ? !up : up;
  return (
    <span className={`delta ${good ? "up" : "down"}`}>
      {up ? <ArrowUp /> : <ArrowDown />}{Math.abs(p).toFixed(1)}%
    </span>
  );
}

// ─── Top bar ────────────────────────────────────────────────
function TopBar({ onOpenLog }) {
  return (
    <div className="topbar">
      <div className="tb-left">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo">B</div>
          <div className="tb-title">bytes<em>os</em></div>
        </div>
      </div>
      <div className="tb-right">
        <span className="live-dot">live</span>
        <button className="ghost-btn">Orders</button>
        <button className="ghost-btn">Customers</button>
        <button className="primary-btn" onClick={onOpenLog}><Plus /> New order</button>
      </div>
    </div>
  );
}

// ─── Hero ───────────────────────────────────────────────────
function Hero({ m }) {
  const progress = Math.min(100, (m.todayRevenue / m.todayTarget) * 100);
  return (
    <section className="hero">
      <div className="hero-today">
        <div className="hero-label">Today's revenue</div>
        <div className="hero-value">{fmt(m.todayRevenue)}</div>
        <div className="hero-progress"><div className="hero-progress-fill" style={{ width: progress + "%" }} /></div>
        <div className="hero-meta">
          <span><strong className="num">{m.todayOrders}</strong> orders</span>
          <span>·</span>
          <span><strong className="num">{Math.round(progress)}%</strong> of {fmtK(m.todayTarget)} target</span>
          <span>·</span>
          <span>avg <strong className="num">{fmtK(m.avgOrder)}</strong></span>
        </div>
      </div>

      <div className="hero-side">
        <div className="side-stat">
          <div className="side-label">This week</div>
          <div className="side-value">{fmt(m.weekRevenue)}</div>
          <div className="side-sub">
            <Delta cur={m.weekRevenue} prev={m.weekPrev} />
            <span>vs last week</span>
          </div>
        </div>
        <div className="side-stat">
          <div className="side-label">Outstanding</div>
          <div className="side-value red">{fmt(m.outstanding)}</div>
          <div className="side-sub">
            <span>{m.outstandingCount} customers owe</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Chart ──────────────────────────────────────────────────
function RevenueChart({ data, range, setRange }) {
  const series = data.rev14;
  const W = 800, H = 180, padT = 10, padB = 10, padL = 0, padR = 0;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const max = Math.max(...series), min = 0;
  const stepX = innerW / (series.length - 1);
  const points = series.map((v, i) => [
    padL + i * stepX,
    padT + innerH - ((v - min) / (max - min || 1)) * innerH,
  ]);
  const d = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    return acc + ` C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");
  const area = d + ` L${points.at(-1)[0]},${H - padB} L${points[0][0]},${H - padB} Z`;
  const todayIdx = series.length - 1;

  return (
    <section className="chart-section">
      <div className="section-head">
        <div>
          <span className="section-title">Revenue</span>
          <span className="section-sub">last 14 days</span>
        </div>
        <div className="seg">
          {["7d","14d","30d"].map(r => (
            <button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      <svg className="bigchart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#rg)" />
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              vectorEffect="non-scaling-stroke" />
        <circle cx={points[todayIdx][0]} cy={points[todayIdx][1]} r="10" fill="var(--accent)" opacity="0.18" />
        <circle cx={points[todayIdx][0]} cy={points[todayIdx][1]} r="3.5" fill="var(--accent)" />
      </svg>

      <div className="bigchart-axis">
        <span>Apr 5</span><span>Apr 9</span><span>Apr 13</span><span>today</span>
      </div>
    </section>
  );
}

// ─── Activity feed ──────────────────────────────────────────
function ActivityFeed({ data, simulate }) {
  const [feed, setFeed] = useState(data.activity.slice(0, 6));
  const [newIds, setNewIds] = useState(new Set());

  useEffect(() => {
    if (!simulate) return;
    const names = ["Talha Raza","Aiza Khan","Hassan Nadeem","Laiba Shah","Iman Ali"];
    const iv = setInterval(() => {
      const now = new Date();
      const t = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
      const who = names[Math.floor(Math.random() * names.length)];
      const qty = 1 + Math.floor(Math.random() * 3);
      const withFries = Math.random() < 0.4;
      const amt = qty * 1200 + (withFries ? 400 : 0);
      const paid = Math.random() > 0.25;
      const id = Date.now();
      setFeed(f => [{ id, t, who, what: `· ${qty}× Standard${withFries ? " + Fries" : ""}`, amount: amt, paid, slot: "Lunch" }, ...f].slice(0, 8));
      setNewIds(s => new Set([...s, id]));
      setTimeout(() => setNewIds(s => { const n = new Set(s); n.delete(id); return n; }), 1200);
    }, 18000);
    return () => clearInterval(iv);
  }, [simulate]);

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="section-title">Activity</span>
          <span className="section-sub">live</span>
        </div>
        <span className="section-sub num">{feed.length}</span>
      </div>
      {feed.map(a => {
        const cls = a.kind === "payment" ? "payment" : (a.paid ? "paid" : "unpaid");
        return (
          <div key={a.id} className={`list-row ${cls} ${newIds.has(a.id) ? "new" : ""}`}>
            <div className="row-body">
              <div className="row-line1">
                <span className={`dot ${cls}`}></span>
                <span className="row-who">{a.who}</span>
                <span className="row-what">{a.what}</span>
              </div>
              <div className="row-line2">
                <span>{a.t}</span>
                <span>·</span>
                <span>{cls}</span>
              </div>
            </div>
            <div className="row-amount">
              {a.kind === "payment" ? "+" : ""}{a.amount.toLocaleString()}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ─── Unpaid ─────────────────────────────────────────────────
function Unpaid({ data, paidById, onMarkPaid }) {
  const remaining = data.openOrders.filter(o => !paidById.has(o.id));
  const sum = remaining.reduce((s, o) => s + o.amount, 0);

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="section-title">Unpaid today</span>
          <span className="section-sub">{remaining.length} open</span>
        </div>
        {sum > 0 && <span className="section-sub num" style={{ color: "var(--red)" }}>{sum.toLocaleString()}</span>}
      </div>
      {remaining.length === 0 && <div className="empty">All collected. ✓</div>}
      {remaining.map(o => (
        <div key={o.id} className="list-row unpaid unpaid-row">
          <div className="row-body">
            <div className="row-line1">
              <span className="dot unpaid"></span>
              <span className="row-who">{o.who}</span>
              <span className="row-what">· {o.order}</span>
            </div>
            <div className="row-line2">
              <span>{o.age} ago</span>
              <span>·</span>
              <span>{o.slot.toLowerCase()}</span>
            </div>
          </div>
          <div className="row-amount">{o.amount.toLocaleString()}</div>
          <button className="mark-paid" onClick={() => onMarkPaid(o.id)}>mark paid</button>
        </div>
      ))}
    </section>
  );
}

// ─── Log panel ──────────────────────────────────────────────
function LogPanel({ onClose }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [fries, setFries] = useState(false);
  const [slot, setSlot] = useState("Lunch");
  const [paid, setPaid] = useState(true);
  const amount = qty * 1200 + (fries ? 400 : 0);

  return (
    <div className="log-panel">
      <div className="log-head">
        <div className="log-title">New order</div>
        <button className="log-close" onClick={onClose}><X /></button>
      </div>
      <div className="log-field">
        <label>Customer</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" autoFocus />
      </div>
      <div className="log-row2">
        <div className="log-field">
          <label>Qty</label>
          <input type="number" min="1" value={qty} onChange={e => setQty(+e.target.value || 1)} />
        </div>
        <div className="log-field">
          <label>Slot</label>
          <select value={slot} onChange={e => setSlot(e.target.value)}>
            <option>Lunch</option><option>Dinner</option><option>Late</option>
          </select>
        </div>
      </div>
      <div className="log-toggle-row">
        <button className={`log-toggle ${fries ? "on" : ""}`} onClick={() => setFries(!fries)}>
          + Fries
        </button>
        <button className={`log-toggle ${paid ? "on" : ""}`} onClick={() => setPaid(!paid)}>
          {paid ? "Paid" : "Unpaid"}
        </button>
      </div>
      <div className="log-amount-row">
        <span>Amount</span>
        <span className="num">{fmt(amount)}</span>
      </div>
      <button className="log-submit" onClick={onClose}>Add</button>
    </div>
  );
}

// ─── Tweaks ────────────────────────────────────────────────
function Tweaks({ tweaks, setTweaks, visible }) {
  if (!visible) return null;
  const u = (k, v) => {
    setTweaks(t => ({ ...t, [k]: v }));
    try { window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [k]: v } }, "*"); } catch {}
  };
  return (
    <div className="tweaks">
      <div className="tweaks-h">Tweaks</div>
      <div className="tweaks-g">
        <div className="tweaks-l">Theme</div>
        <div className="tweaks-r">
          {["dark","light"].map(t => (
            <button key={t} className={`tweaks-b ${tweaks.theme === t ? "on" : ""}`} onClick={() => u("theme", t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="tweaks-g">
        <div className="tweaks-l">Accent</div>
        <div className="tweaks-r">
          {[["ember","#f97316"],["lime","#84cc16"],["sky","#0ea5e9"],["violet","#a855f7"]].map(([n,c]) => (
            <button key={n} className={`tweaks-sw ${tweaks.accent === n ? "on" : ""}`} style={{ "--s": c }} onClick={() => u("accent", n)} />
          ))}
        </div>
      </div>
      <div className="tweaks-g">
        <div className="tweaks-l">Live simulation</div>
        <div className="tweaks-r">
          <button className={`tweaks-b ${tweaks.simulate ? "on" : ""}`} onClick={() => u("simulate", !tweaks.simulate)}>
            {tweaks.simulate ? "on" : "off"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────
function App() {
  const data = window.DATA;
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "dark",
    "accent": "ember",
    "simulate": true
  }/*EDITMODE-END*/;

  const [tweaks, setTweaks] = useState(DEFAULTS);
  const [tweaksVisible, setTweaksVisible] = useState(false);
  const [range, setRange] = useState("14d");
  const [logOpen, setLogOpen] = useState(false);
  const [paidById, setPaidById] = useState(new Set());
  const [live, setLive] = useState(data.metrics);

  useEffect(() => {
    if (!tweaks.simulate) return;
    const iv = setInterval(() => {
      setLive(m => {
        if (Math.random() > 0.55) return m;
        return { ...m,
          todayRevenue: m.todayRevenue + 800 + Math.floor(Math.random() * 2000),
          todayOrders:  m.todayOrders + (Math.random() > 0.5 ? 1 : 0),
        };
      });
    }, 9000);
    return () => clearInterval(iv);
  }, [tweaks.simulate]);

  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || !e.data.type) return;
      if (e.data.type === "__activate_edit_mode")   setTweaksVisible(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksVisible(false);
    };
    window.addEventListener("message", onMsg);
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch {}
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    const map = {
      ember:  ["#f97316","rgba(249,115,22,0.12)","rgba(249,115,22,0.28)"],
      lime:   ["#84cc16","rgba(132,204,22,0.12)","rgba(132,204,22,0.28)"],
      sky:    ["#0ea5e9","rgba(14,165,233,0.12)","rgba(14,165,233,0.28)"],
      violet: ["#a855f7","rgba(168,85,247,0.12)","rgba(168,85,247,0.28)"],
    };
    const [a, s, l] = map[tweaks.accent] || map.ember;
    document.documentElement.style.setProperty("--accent", a);
    document.documentElement.style.setProperty("--accent-soft", s);
    document.documentElement.style.setProperty("--accent-line", l);
  }, [tweaks.accent]);

  const onMarkPaid = (id) => setPaidById(s => new Set([...s, id]));

  return (
    <div className={`app theme-${tweaks.theme}`}>
      <TopBar onOpenLog={() => setLogOpen(true)} />

      <main className="main">
        <div className="greeting">
          <h1>Saturday afternoon.</h1>
          <div className="sub">{data.today} · lunch closed, dinner opens 19:00</div>
        </div>

        <Hero m={live} />
        <RevenueChart data={data} range={range} setRange={setRange} />

        <div className="bottom">
          <ActivityFeed data={data} simulate={tweaks.simulate} />
          <Unpaid data={data} paidById={paidById} onMarkPaid={onMarkPaid} />
        </div>
      </main>

      {logOpen && !tweaksVisible && <LogPanel onClose={() => setLogOpen(false)} />}
      <Tweaks tweaks={tweaks} setTweaks={setTweaks} visible={tweaksVisible} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
