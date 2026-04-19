import { useState } from 'react';
import type { Customer } from '../types';

function fmt(n: number) { return 'PKR ' + n.toLocaleString(); }

function fmtDate(d: string) {
  if (!d) return '—';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [, m, day] = d.split('-');
  return `${months[parseInt(m) - 1]} ${parseInt(day)}`;
}

function fmtOrder(o: string) {
  return o.trim().replace(/(\d+)\s*x\s*(s|f)/i, (_, qty, type) =>
    `${qty}× ${type.toLowerCase() === 'f' ? 'Fries' : 'Standard'}`
  ) || o;
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['#f97316','#22c55e','#3b82f6','#a855f7','#ec4899','#14b8a6','#f59e0b','#6366f1'];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const Chevron = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

interface Props { data: Customer[]; }

export default function CustomerTable({ data }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const sorted = [...data].sort((a, b) => b.totalSpend - a.totalSpend);

  return (
    <>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <span className="section-title">Repeat Customers</span>
        <span className="section-count">{data.length} customers · 2+ orders</span>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Customer</th>
                <th>Orders</th>
                <th>Total Spend</th>
                <th>Last Order</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => {
                const isOpen = expanded.has(i);
                const color  = avatarColor(c.name);
                const unpaidCount = c.history.filter(h => !h.paid).length;
                return (
                  <>
                    <tr key={i} style={{ cursor: 'pointer' }} onClick={() => toggle(i)}>
                      <td style={{ color: 'var(--text-3)', fontWeight: 600, fontSize: 12 }}>
                        {i + 1}
                      </td>
                      <td>
                        <div className="customer-cell">
                          <div className="avatar" style={{ background: color }}>{initials(c.name)}</div>
                          <div>
                            <div className="customer-name">{c.name}</div>
                            {unpaidCount > 0 && (
                              <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 1 }}>
                                {unpaidCount} unpaid order{unpaidCount !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-orange">{c.totalOrders}</span>
                      </td>
                      <td className="num" style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {fmt(c.totalSpend)}
                      </td>
                      <td className="text-2">{fmtDate(c.lastOrderDate)}</td>
                      <td>
                        <button className={`chevron-btn${isOpen ? ' open' : ''}`} onClick={e => { e.stopPropagation(); toggle(i); }}>
                          <Chevron />
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr key={'d' + i} className="detail-row">
                        <td colSpan={6}>
                          <div className="detail-inner">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Date</th><th>Order</th><th>Amount</th><th>Status</th></tr>
                              </thead>
                              <tbody>
                                {c.history.map((o, j) => (
                                  <tr key={j}>
                                    <td>{fmtDate(o.date)}</td>
                                    <td>{fmtOrder(o.order)}</td>
                                    <td className="num">{fmt(o.amount)}</td>
                                    <td>
                                      <span className={o.paid ? 'badge badge-green' : 'badge badge-red'}>
                                        {o.paid ? 'Paid' : 'Unpaid'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
