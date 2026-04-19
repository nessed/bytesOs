import { useState } from 'react';
import type { DebtCustomer } from '../types';

function fmt(n: number) { return 'PKR ' + n.toLocaleString(); }

function fmtDate(d: string) {
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

interface Props { data: DebtCustomer[]; }

export default function DebtTable({ data }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const totalDebt = data.reduce((s, c) => s + c.totalOwed, 0);
  const maxOwed   = data[0]?.totalOwed ?? 1;

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)', fontSize: 14 }}>
        No outstanding debt.
      </div>
    );
  }

  return (
    <>
      <div className="alert-banner">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span><strong>{fmt(totalDebt)}</strong> outstanding across <strong>{data.length}</strong> customer{data.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount Owed</th>
                <th>Orders</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.map((c, i) => {
                const isOpen = expanded.has(i);
                const color  = avatarColor(c.name);
                return (
                  <>
                    <tr key={i} style={{ cursor: 'pointer' }} onClick={() => toggle(i)}>
                      <td>
                        <div className="customer-cell">
                          <div className="avatar" style={{ background: color }}>{initials(c.name)}</div>
                          <div>
                            <div className="customer-name">{c.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="debt-bar-cell">
                        <div className="debt-bar-wrap">
                          <span className="debt-amount">{fmt(c.totalOwed)}</span>
                          <div className="debt-bar-bg">
                            <div className="debt-bar-fill" style={{ width: `${(c.totalOwed / maxOwed) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-red">{c.orders.length} order{c.orders.length !== 1 ? 's' : ''}</span>
                      </td>
                      <td>
                        <button className={`chevron-btn${isOpen ? ' open' : ''}`} onClick={e => { e.stopPropagation(); toggle(i); }}>
                          <Chevron />
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr key={'d' + i} className="detail-row">
                        <td colSpan={4}>
                          <div className="detail-inner">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Date</th><th>Slot</th><th>Order</th><th>Amount</th></tr>
                              </thead>
                              <tbody>
                                {c.orders.map((o, j) => (
                                  <tr key={j}>
                                    <td>{fmtDate(o.date)}</td>
                                    <td className="text-muted">{o.slot ?? '—'}</td>
                                    <td>{fmtOrder(o.order)}</td>
                                    <td className="num" style={{ color: 'var(--red)' }}>{fmt(o.amount)}</td>
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
