import type { OpenOrder } from '../types';

function fmtOrder(o: string) {
  return o.replace(/(\d+)\s*x\s*(s|f)/gi, (_, qty, type) =>
    `${qty}× ${type.toLowerCase() === 'f' ? 'Fries' : 'Standard'}`
  );
}

interface Props {
  data: OpenOrder[];
  paidIds: Set<number>;
  onMarkPaid: (id: number) => void;
}

export default function UnpaidToday({ data, paidIds, onMarkPaid }: Props) {
  const remaining = data.filter(o => !paidIds.has(o.id));
  const sum = remaining.reduce((s, o) => s + o.amount, 0);

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="section-title">Unpaid today</span>
          <span className="section-sub">{remaining.length} open</span>
        </div>
        {sum > 0 && <span className="section-sub num" style={{ color: 'var(--red)' }}>{sum.toLocaleString()}</span>}
      </div>
      {remaining.length === 0 && <div className="empty">All collected. ✓</div>}
      {remaining.map(o => (
        <div key={o.id} className="list-row unpaid unpaid-row">
          <div className="row-body">
            <div className="row-line1">
              <span className="dot unpaid"></span>
              <span className="row-who">{o.who}</span>
              <span className="row-what">· {fmtOrder(o.order)}</span>
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
