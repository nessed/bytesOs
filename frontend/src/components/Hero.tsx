import type { Metrics } from '../types';

const fmt = (n: number) => 'PKR ' + Math.round(n).toLocaleString();
const fmtK = (n: number) => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(n);

const ArrowUp = () => (
  <svg width="9" height="9" viewBox="0 0 10 10">
    <path d="M2 7 L5 3 L8 7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowDown = () => (
  <svg width="9" height="9" viewBox="0 0 10 10">
    <path d="M2 3 L5 7 L8 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (prev === 0) return null;
  const p = ((cur - prev) / prev) * 100;
  const up = p >= 0;
  return (
    <span className={`delta ${up ? 'up' : 'down'}`}>
      {up ? <ArrowUp /> : <ArrowDown />}{Math.abs(p).toFixed(1)}%
    </span>
  );
}

interface Props {
  m: Metrics;
}

export default function Hero({ m }: Props) {
  const todayProfit = m.todayProfit ?? Math.round((m.todayRevenue ?? 0) * 0.52);
  const todayPerPerson = m.todayPerPerson ?? Math.round(todayProfit / 4);
  const weekProfit = m.weekProfit ?? Math.round((m.weekRevenue ?? 0) * 0.52);
  const progress = Math.min(100, ((m.todayRevenue ?? 0) / (m.todayTarget || 1)) * 100);
  return (
    <section className="hero">
      <div className="hero-today">
        <div className="hero-label">Today's revenue</div>
        <div className="hero-value">{fmt(m.todayRevenue)}</div>
        <div className="hero-progress">
          <div className="hero-progress-fill" style={{ width: progress + '%' }} />
        </div>
        <div className="hero-meta">
          <span><strong className="num">{m.todayOrders}</strong> orders</span>
          <span>·</span>
          <span><strong className="num">{Math.round(progress)}%</strong> of {fmtK(m.todayTarget)} target</span>
          <span>·</span>
          <span>avg <strong className="num">{fmtK(m.avgOrder)}</strong></span>
        </div>
        <div className="hero-profit-row">
          <div className="profit-chip">
            <span className="profit-chip-label">profit</span>
            <span className="profit-chip-val num">{fmt(todayProfit)}</span>
          </div>
          <div className="profit-chip">
            <span className="profit-chip-label">per person</span>
            <span className="profit-chip-val num">{fmt(todayPerPerson)}</span>
          </div>
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
          <div className="side-profit">profit {fmt(weekProfit)}</div>
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
