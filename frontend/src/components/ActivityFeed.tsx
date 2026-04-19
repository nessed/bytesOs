import type { ActivityItem } from '../types';

function fmtOrder(o: string) {
  return o.replace(/(\d+)\s*x\s*(s|f)/gi, (_, qty, type) =>
    `${qty}× ${type.toLowerCase() === 'f' ? 'Fries' : 'Standard'}`
  );
}

interface Props {
  data: ActivityItem[];
}

export default function ActivityFeed({ data }: Props) {
  return (
    <section>
      <div className="section-head">
        <div>
          <span className="section-title">Activity</span>
          <span className="section-sub">today</span>
        </div>
        <span className="section-sub num">{data.length}</span>
      </div>
      {data.length === 0 && <div className="empty">No activity yet.</div>}
      {data.map(a => {
        const cls = a.kind === 'payment' ? 'payment' : (a.paid ? 'paid' : 'unpaid');
        return (
          <div key={a.id} className={`list-row ${cls}`}>
            <div className="row-body">
              <div className="row-line1">
                <span className={`dot ${cls}`}></span>
                <span className="row-who">{a.who}</span>
                <span className="row-what">{a.kind === 'payment' ? a.what : `· ${fmtOrder(a.what)}`}</span>
              </div>
              <div className="row-line2">
                <span>{a.t}</span>
                <span>·</span>
                <span>{cls}</span>
              </div>
            </div>
            <div className="row-amount">
              {a.kind === 'payment' ? '+' : ''}{a.amount.toLocaleString()}
            </div>
          </div>
        );
      })}
    </section>
  );
}
