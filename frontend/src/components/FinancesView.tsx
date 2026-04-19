import type { FinancesData } from '../types';

function fmt(n: number) { return 'PKR ' + n.toLocaleString(); }

export default function FinancesView({ data }: { data: FinancesData }) {
  return (
    <>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <span className="section-title">Lifetime Performance</span>
      </div>

      <div className="hero-side" style={{ marginBottom: 40, gap: 16, gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="stat-card" style={{ '--accent-color': 'var(--green)', '--accent-muted': 'var(--green-soft)' } as React.CSSProperties}>
           <div className="stat-label">Lifetime Revenue</div>
           <div className="stat-value">{fmt(data.lifetimeRevenue)}</div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--orange)', '--accent-muted': 'var(--orange-muted)' } as React.CSSProperties}>
           <div className="stat-label">Total Profit Tracker (est.)</div>
           <div className="stat-value">{fmt(data.lifetimeProfit)}</div>
           <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>
             {fmt(data.realizedProfit)} realized
           </div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--blue)', '--accent-muted': 'var(--blue-muted)' } as React.CSSProperties}>
           <div className="stat-label">Profit per Partner</div>
           <div className="stat-value">{fmt(data.lifetimePerPerson)}</div>
           <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>
             Expected full collection
           </div>
        </div>
      </div>

      <div className="section-header" style={{ marginBottom: 16 }}>
        <span className="section-title">Weekly Breakdown</span>
        <span className="section-count">{data.weeklyBreakdown.length} weeks tracked</span>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Week</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Profit</th>
                <th>Per Person</th>
                <th style={{ textAlign: 'right' }}>Debt Accrued</th>
              </tr>
            </thead>
            <tbody>
              {data.weeklyBreakdown.map((w, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{w.label}</td>
                  <td><span className="badge badge-orange">{w.count}</span></td>
                  <td className="num">{fmt(w.revenue)}</td>
                  <td className="num" style={{ color: 'var(--green)' }}>{fmt(w.profit)}</td>
                  <td className="num text-2">{fmt(w.perPerson)}</td>
                  <td className="num" style={{ textAlign: 'right', color: w.unpaidAmount > 0 ? 'var(--red)' : 'var(--ink-4)' }}>
                    {w.unpaidAmount > 0 ? fmt(w.unpaidAmount) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
